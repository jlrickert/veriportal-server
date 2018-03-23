import { sql } from "./connector";
import * as Schema from "../schema";
import * as Auth from "../utils/auth";
import {
  issueJWT,
  newRefreshToken,
  hashPassword,
  comparePasswords
} from "../utils/auth";
import { Model } from "../utils/model";
import { ISchemaUser } from "../schema";

export interface ISqlUser {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  admin?: boolean;
  created_at?: string;
  updated_at?: string;
  hash?: string;
  refresh_token?: string;
}

export class User extends Model<ISqlUser, Schema.ISchemaUser> {
  static async fromUsername(username: string): Promise<User> {
    const query = sql("users")
      .join("auth", "auth.user_id", "users.id")
      .select("*")
      .where("username", username)
      .first()
      .then(user => Promise.resolve(user as ISqlUser));

    return query.then(data => {
      if (data) {
        const user = new User(data);
        return Promise.resolve(user);
      } else {
        return Promise.reject(`User "${username}" does not exist`);
      }
    });
  }

  static async fromId(id: number): Promise<User> {
    const query = sql("users")
      .join("auth", "users.id", "auth.user_id")
      .select("*")
      .where("users.id", id)
      .first()
      .then(user => Promise.resolve(user as ISqlUser));

    return query.then(data => {
      if (data) {
        return Promise.resolve(new User(data));
      } else {
        return Promise.reject(`User with id "${id}" does not exist`);
      }
    });
  }

  static async fromToken(token: string): Promise<User> {
    const query = sql("auth")
      .select("*")
      .where("refresh_token", token)
      .join("users", "users.id", "auth.user_id")
      .first()
      .then(user => Promise.resolve(user as ISqlUser));

    return query.then(data => {
      if (data) {
        return Promise.resolve(new User(data));
      } else {
        return Promise.reject("Invalid token");
      }
    });
  }

  static async login(username: string, password: string): Promise<User> {
    return User.fromUsername(username).then(async user => {
      const hash = await user.getData("hash");
      if (!hash) {
        console.warn("hash is invalid for user ${username}");
        return Promise.reject("Invalid credentials");
      } else if (await comparePasswords(password, hash)) {
        return Promise.resolve(user);
      } else {
        return Promise.reject("Invalid credentials");
      }
    });
  }

  static async signup(params: Schema.ISchemaSignupInput): Promise<User> {
    const hash = await Auth.hashPassword(params.password);
    const refreshToken = Auth.newRefreshToken();

    const userData = {
      username: params.username,
      first_name: params.firstName,
      last_name: params.lastName,
      admin: false
    };

    return sql
      .transaction(async trx => {
        const userQuery = trx("users")
          .insert(userData, "*")
          .then(res => res[0] as ISqlUser);

        const authQuery = userQuery
          .then(userData =>
            trx("auth").insert(
              {
                user_id: userData.id,
                hash,
                refresh_token: refreshToken
              },
              "*"
            )
          )
          .then(res => {
            if (res) {
              return res[0].id;
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

  constructor(data: ISqlUser) {
    super(data);
    if (!data.refresh_token) {
      this.updateRefreshToken();
    }
  }

  toGqlSchema(): Schema.ISchemaUser {
    return {
      username: this.username,
      firstName: this.firstName as string | undefined,
      lastName: this.lastName as string | undefined,
      admin: this.admin
    };
  }

  get id(): number {
    return this.getData("id") as number;
  }

  get username(): string {
    return this.getData("username") as string;
  }

  get firstName(): string | null {
    return this.getData("first_name")!;
  }

  get lastName(): string | null {
    return this.getData("last_name")!;
  }

  get admin(): boolean {
    return this.getData("admin") as boolean;
  }

  get token(): string {
    return issueJWT({ username: this.username, admin: this.admin });
  }

  get refreshToken(): string | null {
    const value = this.getData("refresh_token");
    if (value) {
      return value;
    } else {
      const token = newRefreshToken();
      this.updateRefreshToken(token);
      return token;
    }
  }

  equals(user: User): boolean {
    return this.username === user.username;
  }

  async revokeToken(): Promise<this> {
    const query = sql("auth")
      .update({ refresh_token: null })
      .where("user_id", this.id);

    return query.then(() => {
      this.data.refresh_token = "";
      return Promise.resolve(this);
    });
  }

  async updatePassword(password: string): Promise<this> {
    const hash = await hashPassword(password);
    const query = sql("auth")
      .update({ hash })
      .where("user_id", this.id);

    return query.then(() => {
      this.data.hash = hash;
      return Promise.resolve(this);
    });
  }

  async updateRefreshToken(token: string = newRefreshToken()): Promise<this> {
    const query = sql("auth")
      .where("user_id", "=", this.id)
      .update({ refresh_token: token });

    return query.then(res => {
      this.data.refresh_token = token;
      return Promise.resolve(this);
    });
  }
}
