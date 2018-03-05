import * as Knex from "knex";

import { IUser } from "./schema/types";
import { ConnectionOptions } from "pg-connection-string";

export type TConnection = SqlConnection | MemConnection;
export type SqlConnectionOptions = Knex.Config;

export class SqlConnection {
  readonly knex: Knex;
  constructor(config: SqlConnectionOptions) {
    this.knex = Knex(config);
  }

  /**
   * Seeds database with initial data. This is great for testing and setting up
   * data for a development database
   */
  seed = async (): Promise<void> => {
    await this.knex.seed.run();
    console.log("Seeded database");
  };

  /**
   * Migrate schema to the latest
   */
  migrate = async (): Promise<void> => {
    await this.knex.migrate.latest();
    console.log("Migrate database");
  };

  /**
   * Get the current migration number
   */
  currentVersion = async (): Promise<void> => {
    await this.knex.migrate.currentVersion();
  };

  /**
   * rollback database to its initial state
   */
  rollback = async (): Promise<void> => {
    await this.knex.migrate.rollback();
    console.log("Rollded back database");
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
