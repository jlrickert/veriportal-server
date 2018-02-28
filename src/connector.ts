import * as Knex from "knex";

export type SqlConnection = Knex;

export class Connector {
  readonly knex: SqlConnection;
  constructor(knex) {
    this.knex = knex;
  }
}
