// Update with your config settings.

require('dotenv').config();
const parse = require('pg-connection-string').parse;

const DATABASE_URL = process.env.DATABASE_URL;

module.exports = {

  development: DATABASE_URL && {
    client: 'pg',
    connection: Object.assign({}, `${parse(DATABASE_URL)}-dev`, { ssl: true })
  },

  test: DATABASE_URL && {
    client: 'pg',
    connection: Object.assign({}, `${parse(DATABASE_URL)}-test`, { ssl: true })
  },

  production: DATABASE_URL && {
    client: 'pg',
    connection: Object.assign({}, parse(DATABASE_URL), { ssl: true }),
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
