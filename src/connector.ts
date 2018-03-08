import * as Knex from "knex";
import { ConnectionOptions } from "pg-connection-string";

import { IUser } from "./schema/types";

export type TConnection = SqlConnection;
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
  };

  /**
   * Migrate schema to the latest
   */
  migrate = async (): Promise<void> => {
    await this.knex.migrate.latest();
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
  };
}
