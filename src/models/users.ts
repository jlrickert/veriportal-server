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
import { error } from "util";

export interface IUsers {
  fetchUserById: (id: number) => Promise<IUser>;
  fetchUserByUsername: (username: string) => Promise<IUser>;
  fetchUsers: () => Promise<IUser[]>;
  signup: (params: ISignupInput) => Promise<IAuthPayload>;
  login: (username: string, password: string) => Promise<IAuthPayload>;
  refreshToken: (token: string) => Promise<IAuthPayload>;
  revokeTokens: (user: IUser) => Promise<IUser>;
  updatePassword: (user: IUser, password: string) => Promise<IUser>;
}

export class SqlUsers implements IUsers {
  conn: SqlConnection;
  constructor(conn: SqlConnection) {
    this.conn = conn;
  }

  async fetchUserById(id: number): Promise<IUser> {
    return this.conn
      .knex("users")
      .join("auth", "users.id", "auth.userId")
      .select("*")
      .where("users.id", id)
      .first();
  }

  async fetchUserByUsername(username: string): Promise<IUser> {
    return this.conn.knex
      .join("auth", "auth.userId", "users.id")
      .select("*")
      .from("users")
      .where("username", username)
      .first();
  }

  async fetchUsers(): Promise<IUser[]> {
    return this.conn.knex("users").select("*");
  }

  async signup(params: ISignupInput): Promise<IAuthPayload> {
    const refreshToken = newRefreshToken();
    const token = issueJWT({ username: params.username, admin: false });
    const hash = await hashPassword(params.password);

    const data = merge({ admin: false }, params);
    delete data["password"];

    const userId = await this.conn.knex.transaction(async trx => {
      const userId = await trx("users")
        .insert(data, "id")
        .then(res => Promise.resolve(res[0]))
        .catch(err => {
          if (err.constraint === "users_username_unique") {
            return Promise.reject(`User ${params.username} already exists`);
          } else {
            console.error(err);
            return Promise.reject("Server error");
          }
        });

      await trx("auth").insert({ userId, hash, refreshToken });
      return Promise.resolve(userId);
    });

    const user = await this.fetchUserById(userId);
    return Promise.resolve({ user, refreshToken, token });
  }

  async login(username: string, password: string): Promise<IAuthPayload> {
    const user = await this.fetchUserByUsername(username);

    if (!await comparePasswords(password, user.hash)) {
      return Promise.reject("Incorrect username or password");
    }

    const refreshToken = newRefreshToken();
    await this.conn
      .knex("auth")
      .where("userId", user.id)
      .update({ refreshToken });

    return Promise.resolve({
      user: merge({ refreshToken }, user),
      token: issueJWT(user),
      refreshToken
    });
  }

  async refreshToken(token: string): Promise<IAuthPayload> {
    const newToken = newRefreshToken();
    const authInfo = await this.conn
      .knex("auth")
      .where("refreshToken", "=", token)
      .update("refreshToken", newToken, ["userId"]);

    if (authInfo.length === 0) {
      return Promise.reject("Invalid token");
    }

    const user = await this.fetchUserById(authInfo[0].userId);
    return {
      user,
      refreshToken: user.refreshToken,
      token: issueJWT({ username: user.username, admin: user.admin })
    };
  }

  private async updateRefreshToken(id: number): Promise<IUser> {
    await this.conn
      .knex("auth")
      .where("userId", id)
      .update({ refreshToken: newRefreshToken() }, ["*"]);
    return this.fetchUserById(id);
  }

  async revokeTokens(user: IUser): Promise<IUser> {
    await this.conn
      .knex("auth")
      .where("userId", user.id)
      .update("refreshToken", null);
    return this.fetchUserByUsername(user.username);
  }

  async updatePassword(user: IUser, password: string): Promise<IUser> {
    const hash = await hashPassword(password);
    await this.conn
      .knex("auth")
      .where("userId", user.id)
      .update({ hash });

    return Promise.resolve(merge(user, { hash }));
  }
}
