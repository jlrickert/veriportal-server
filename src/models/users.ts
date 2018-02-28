import { Connector, SqlConnection } from "../connector";
import { IUser } from "../schema/types";

export class Users {
  conn: SqlConnection;
  constructor(conn: Connector) {
    this.conn = conn.knex;
  }

  getUser = (id: number): Promise<IUser> =>
    this.conn
      .select("*")
      .from("User")
      .where("id", id)
      .first();

  getUsers = (): Promise<IUser[]> => this.conn.select("*").from("User");
}

export default Users;
