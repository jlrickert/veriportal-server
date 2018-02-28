import { Connector, SqlConnection } from "../connector";
export class Users {
  conn: SqlConnection;
  constructor(conn: Connector) {
    this.conn = conn.knex;
  }

  getUser = (id: number) =>
    this.conn
      .select("*")
      .from("User")
      .where("id", id);
}

export default Users;
