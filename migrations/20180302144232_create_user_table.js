exports.up = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("User");
  if (!exists) {
    return knex.schema.createTable("User", t => {
      t.increments("id").primary();

      t
        .string("username")
        .unique()
        .notNullable();

      t.string("firstName");
      t.string("lastName");

      t
        .boolean("admin")
        .default("false")
        .notNullable();

      t.index("username");
    });
  }
};

exports.down = async (knex, Promise) => {
  const exists = knex.schema.hasTable("User");
  if (exists) {
    return Promise.all([knex.schema.dropTable("User")]);
  }
};
