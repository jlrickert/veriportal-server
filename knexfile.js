// Update with your config settings.

require('dotenv').config();
const parse = require('pg-connection-string').parse;

const DATABASE_URL = process.env.DATABASE_URL;

const DbConfig = parse(process.env.DATABASE_URL);

module.exports = {

  development: DATABASE_URL && {
    client: 'pg',
    connection: Object.assign({}, DbConfig, { database: DbConfig.database + '-dev'})
  },

  test: DATABASE_URL && {
    client: 'pg',
    connection: Object.assign({}, DbConfig, { database: DbConfig.database + '-test'})
  },

  production: DATABASE_URL && {
    client: 'pg',
    connection: Object.assign({}, DbConfig),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
