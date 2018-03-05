// Update with your config settings.

require("dotenv").config();
const parse = require("pg-connection-string").parse;

const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;
const DbConfig = parse(PG_CONNECTION_STRING);

module.exports = {
  development: PG_CONNECTION_STRING && {
    client: "pg",
    connection: Object.assign({}, DbConfig, {
      database: DbConfig.database + "-dev"
    })
  },

  test: PG_CONNECTION_STRING && {
    client: "pg",
    connection: Object.assign({}, DbConfig, {
      database: DbConfig.database + "-test"
    })
  },

  production: PG_CONNECTION_STRING && {
    client: "pg",
    connection: Object.assign({}, DbConfig),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
