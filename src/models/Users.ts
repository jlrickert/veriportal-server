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
