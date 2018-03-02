import {
  SqlConnection,
  MemConnection,
  TConnection,
  matchConnector
} from "../connector";
import { IUser, IAuthPayload } from "../schema/types";
import * as Auth from "../auth";

export interface IUsers {
  fetchUser: (id: number) => Promise<IUser>;
  fetchUsers: () => Promise<IUser[]>;
  signup: (
    params: {
      firstName?: string;
      lastName?: string;
      username: string;
      password: string;
    }
  ) => Promise<IAuthPayload>;
}

export interface IMatchUserArg<T> {
  SQLUsers: (users: SqlUsers) => T;
  MemUsers: (users: MemUsers) => T;
}

export const connectToUsers = (conn: TConnection): IUsers =>
  matchConnector({
    Sql: c => new SqlUsers(c) as IUsers,
    Mem: c => new MemUsers(c) as IUsers
  })(conn);

export class SqlUsers implements IUsers {
  conn: SqlConnection;
  constructor(conn: SqlConnection) {
    this.conn = conn;
  }

  fetchUser = async (id: number): Promise<IUser> =>
    this.conn.knex
      .select("*")
      .from("User")
      .where("id", id)
      .first();

  fetchUsers = async (): Promise<IUser[]> =>
    this.conn.knex.select("*").from("User");

  signup = async (): Promise<IAuthPayload> => Promise.reject("Not implemented");
}

export class MemUsers implements IUsers {
  state: MemConnection;
  constructor(initialState: MemConnection) {
    this.state = initialState;
  }

  fetchUser = async (id: number): Promise<IUser> =>
    new Promise((resolve, reject) => {
      const user: IUser = this.state.users[id];
      if (user) {
        resolve(user);
      } else {
        reject(new Error(`User ${id} does'nt exist`));
      }
    });

  fetchUsers = async (): Promise<IUser[]> => Promise.resolve(this.state.users);

  signup = async (): Promise<IAuthPayload> => Promise.reject("Not implemented");
  // signup = async (params): Promise<IAuthPayload> =>
  //   Promise.resolve({
  //     user: {
  //       username: params.username,
  //       firstName: params.firstName,
  //       lastName: params.lastName,
  //       admin: false
  //     },
  //     refreshToken: Auth.newRefreshToken()
  //   });
}

export default SqlUsers;
