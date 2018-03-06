exports.up = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("users");
  if (!exists) {
    return knex.schema.createTable("users", t => {
      t.increments("id").primary();

      t
        .string("username")
        .unique()
        .notNullable();

      t.string("first_name");
      t.string("last_name");

      t
        .boolean("admin")
        .default("false")
        .notNullable();

      t.timestamps(true, true);
    });
  }
};

exports.down = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("users");
  if (exists) {
    return Promise.all([knex.schema.dropTable("users")]);
  }
};
