import { merge } from "lodash";
import { sql } from "./connector";
import * as Schema from "../schema";
import * as Auth from "../utils/auth";

export interface ISqlUser {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;
  created_at: string;
  updated_at: string;
  hash?: string;
  refreshToken: string;
  [key: string]: any;
}

export class User {
  static async fromToken(token: string): Promise<User> {
    return sql("auth")
      .select("*")
      .where("refreshToken", token)
      .join("users", "users.id", "auth.userId")
      .first()
      .then(data => new User(data));
  }

  static async fromId(id: number): Promise<User> {
    const res: ISqlUser = await sql("users")
      .join("auth", "users.id", "auth.userId")
      .select("*")
      .where("users.id", id)
      .first();

    if (!res) {
      return Promise.reject(`User ${id} does not exist`);
    }
    return new User(res);
  }

  static async fromUsername(username: string): Promise<User> {
    const res: ISqlUser = await sql("users")
      .join("auth", "auth.userId", "users.id")
      .select("*")
      .where("username", username)
      .first();
    if (!res) {
      return Promise.reject(`User ${username} does not exist`);
    }
    return new User(res);
  }

  static async signup(params: Schema.ISignupInput): Promise<User> {
    const hash = await Auth.hashPassword(params.password);
    const refreshToken = Auth.newRefreshToken();

    return sql.transaction(async trx => {
      const userId = await trx("users")
        .insert(merge(params, { admin: false }), "id")
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
      return Promise.resolve(new User(merge(params, { hash, refreshToken })));
    });
  }

  private constructor(readonly data: ISqlUser) {}

  toSchema(): Schema.IUser {
    return {
      username: this.data.username,
      firstName: this.data.firstName,
      lastName: this.data.lastName,
      admin: this.data.admin
    };
  }

  updateToken() {}

  revokeToken() {}
}
