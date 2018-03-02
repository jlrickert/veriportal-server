import * as Knex from "knex";

import { IUser } from "./schema/types";

export type TConnection = SqlConnection | MemConnection;

export class SqlConnection {
  constructor(public knex: Knex) {}
  seed = (seed): void => {
    throw new Error("Not implemented");
  };

  migrate = (): void => {
    throw new Error("Not implemented");
  };
}

export interface IMemConnectionArgs {
  users: { [id: number]: IUser };
}

export class MemConnection implements IMemConnectionArgs {
  users: { [id: number]: IUser };
  constructor(public state: IMemConnectionArgs = { users: {} }) {
    this.users = state.users;
  }
}

export interface IMatchConnectorPattern<T> {
  Sql: (conn: SqlConnection) => T;
  Mem: (conn: MemConnection) => T;
}

export function matchConnector<T>(
  conn: IMatchConnectorPattern<T>
): (a: TConnection) => T {
  return (c: TConnection): T => {
    if (c instanceof SqlConnection) {
      return conn.Sql(c);
    } else if (c instanceof MemConnection) {
      return conn.Mem(c);
    }
  };
}
// export const matchConnector = <T>(conn: Connection): (a: Argument) => T {};
