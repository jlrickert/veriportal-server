import * as Config from "../config";
import * as Knex from "knex";

export type SqlConnectionOptions = Knex.Config;

export const sql = Knex(Config.knexConfig);

export namespace Managment {
  export async function seed(): Promise<void> {
    await sql.seed.run();
  }

  export async function migrate(): Promise<void> {
    await sql.migrate.latest();
  }

  export async function currentVersion(): Promise<void> {
    await sql.migrate.currentVersion();
  }

  export async function rollback(): Promise<void> {
    await sql.migrate.rollback();
  }
}
