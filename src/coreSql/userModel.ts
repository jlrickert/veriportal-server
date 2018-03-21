import { merge } from "lodash";
import { sql } from "./connector";
import * as Schema from "../schema";
import * as Auth from "../utils/auth";
import { issueJWT, newRefreshToken, hashPassword } from "../utils/auth";
import { Model } from "../utils/model";

export interface ISqlUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  created_at?: string;
  updated_at?: string;
  hash?: string;
  refreshToken?: string;
  [key: string]: any;
}

export class User extends Model<ISqlUser, Schema.IUser> {
  static async fromToken(token: string): Promise<User> {
    const query = sql("auth")
      .select("*")
      .where("refreshToken", token)
      .join("users", "users.id", "auth.userId")
      .first();

    return query.then(data => {
      if (data) {
        return Promise.resolve(new User(data));
      } else {
        return Promise.reject("Invalid token");
      }
    });
  }

  static async fromId(id: number): Promise<User> {
    const query = sql("users")
      .join("auth", "users.id", "auth.userId")
      .select("*")
      .where("users.id", id)
      .first();

    return query.then(data => {
      if (data) {
        return Promise.resolve(new User(data));
      } else {
        return Promise.reject(`User with id "${id}" does not exist`);
      }
    });
  }

  static async fromUsername(username: string): Promise<User> {
    const query = sql("users")
      .join("auth", "auth.userId", "users.id")
      .select("*")
      .where("username", username)
      .first();

    return query.then(data => {
      if (data) {
        return Promise.resolve(new User(data));
      } else {
        return Promise.reject(`User "${username}" does not exist`);
      }
    });
  }

  static async login(username: string, password: string): Promise<User> {
    return Promise.reject("not implemented");
  }

  static async signup(params: Schema.ISignupInput): Promise<User> {
    const hash = await Auth.hashPassword(params.password);
    const refreshToken = Auth.newRefreshToken();

    const userData = {
      username: params.username,
      firstName: params.firstName,
      lastName: params.lastName,
      admin: false
    };

    return sql
      .transaction(async trx => {
        const userQuery = trx("users")
          .insert(userData, "*")
          .then(res => Promise.resolve(res[0]));

        const authQuery = userQuery
          .then(userData =>
            trx("auth").insert({ userId: userData.id, hash, refreshToken }, "*")
          )
          .then(res => {
            if (res) {
              return Promise.resolve(res[0].id);
            } else {
              Promise.reject(res);
            }
          });

        return authQuery;
      })
      .then(id => User.fromId(id))
      .catch(err => {
        if (err.constraint === "users_username_unique") {
          return Promise.reject(`User "${params.username}" already exists`);
        } else {
          console.error(err);
          return Promise.reject("Server error");
        }
      });
  }

  toSchema(): Schema.IUser {
    return {
      username: this.getData("username"),
      firstName: this.getData("firstName"),
      lastName: this.getData("lastName"),
      admin: this.getData("admin")
    };
  }

  get token(): string {
    return issueJWT({ username: this.data.username, admin: this.data.admin });
  }

  async revokeToken(): Promise<void> {
    const query = sql("auth")
      .update("refreshToken", "null")
      .where("userId", this.data.id);

    return query.then(() => {
      this.data.refreshToken = "";
      return Promise.resolve();
    });
  }

  async updatePassword(password: string): Promise<void> {
    const hash = await hashPassword(password);
    const query = sql("auth")
      .update({ hash })
      .where("userId", this.data.id);

    return query.then(() => {
      this.data.hash = hash;
      return Promise.resolve();
    });
  }

  async updateRefreshToken(): Promise<string> {
    const token = newRefreshToken();
    return sql("auth")
      .where("userId", this.data.id)
      .update({ refreshToken: token }, "token")
      .then(res => Promise.resolve(res[0]));
  }
}
