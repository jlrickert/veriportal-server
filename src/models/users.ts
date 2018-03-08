import { merge } from "lodash";
import { SqlConnection, TConnection } from "../connector";
import { IUser, IAuthPayload, ISignupInput } from "../schema/types";
import * as Auth from "../auth";
import {
  newRefreshToken,
  hashPassword,
  issueJWT,
  comparePasswords
} from "../auth";
import { Promise } from "bluebird";

export interface IUsers {
  fetchUserById: (id: number) => Promise<IUser>;
  fetchUserByUsername: (username: string) => Promise<IUser>;
  fetchUsers: () => Promise<IUser[]>;
  signup: (params: ISignupInput) => Promise<IAuthPayload>;
  login: (username: string, password: string) => Promise<IAuthPayload>;
  refreshToken: (token: string) => Promise<IAuthPayload>;
  revokeTokens: (user: IUser) => Promise<IUser>;
  updatePassword: (user: IUser, password: string) => Promise<IAuthPayload>;
}

export class SqlUsers implements IUsers {
  conn: SqlConnection;
  constructor(conn: SqlConnection) {
    this.conn = conn;
  }

  async fetchUserById(id: number): Promise<IUser> {
    return this.conn
      .knex("users")
      .join("auth", "users.id", "auth.user_id")
      .select("*")
      .where("users.id", id)
      .first();
  }

  async fetchUserByUsername(username: string): Promise<IUser> {
    return this.conn.knex
      .join("auth", "auth.user_id", "users.id")
      .select("*")
      .from("users")
      .where("username", username)
      .first();
  }

  async fetchUsers(): Promise<IUser[]> {
    return this.conn.knex("users").select("*");
  }

  async signup(params: ISignupInput): Promise<IAuthPayload> {
    return this.conn.knex
      .transaction(async trx => {
        const data = {
          username: params.username,
          first_name: params.firstName,
          last_name: params.lastName,
          admin: false
        };
        const res = await trx.insert(data, ["id"]).into("users");
        const userId = res[0].id;

        const refreshToken = newRefreshToken();
        const token = issueJWT({ username: params.username, admin: false });
        const hash = await hashPassword(params.password);

        await trx
          .insert({
            user_id: userId,
            hash,
            refresh_token: refreshToken
          })
          .into("auth");

        return Promise.resolve({
          user: {
            id: userId,
            username: params.username,
            firstName: params.firstName,
            lastName: params.lastName,
            admin: false
          },
          refreshToken,
          token
        });
      })
      .catch(err => {
        if (err.constraint === "users_username_unique") {
          return Promise.reject(
            `Unable to signup: ${params.username} already exists`
          );
        }
        return Promise.reject(err);
      });
  }

  async login(username: string, password: string): Promise<IAuthPayload> {
    const user = await this.conn
      .knex("users")
      .select("*")
      .where("username", username)
      .join("auth", "users.id", "auth.user_id")
      .first();

    if (comparePasswords(password, user.hash)) {
      const refreshToken = newRefreshToken();
      await this.conn
        .knex("auth")
        .update("refresh_token", refreshToken)
        .where("user_id", user.id);

      return Promise.resolve({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          admin: user.admin
        },
        token: issueJWT(user),
        refreshToken
      });
    } else {
      Promise.reject("Incorrect username or password");
    }
  }

  async refreshToken(token: string): Promise<IAuthPayload> {
    const user = await this.conn
      .knex("auth")
      .select()
      .where("refresh_token", token)
      .join("users", "users.id", "auth.user_id")
      .first();

    if (user) {
      return Promise.resolve({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          admin: user.admin
        },
        token: issueJWT({ username: user.username, admin: user.admin }),
        refreshToken: user.refresh_token
      });
    } else {
      return Promise.reject("Invalid token");
    }
  }

  async revokeTokens(user: IUser): Promise<IUser> {
    await this.conn
      .knex("auth")
      .update("refresh_token", null)
      .where("user_id", user.id);
    return this.fetchUserByUsername(user.username);
  }

  async updatePassword(user: IUser, password: string): Promise<IAuthPayload> {
    const hash = await hashPassword(password);
    this.conn.knex("auth").update("hash", hash);
    return Promise.resolve({
      user: merge(
        {
          user: user
        },
        { hash }
      ),
      refreshToken: user.refreshToken,
      token: issueJWT(user)
    });
  }
}
