exports.up = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("users");
  if (!exists) {
    return knex.schema.createTable("users", t => {
      t.increments("id").primary();

      t
        .text("username")
        .unique()
        .notNullable();

      t.text("first_name");
      t.text("last_name");

      t
        .boolean("admin")
        .default("false")
        .notNullable();

      t.timestamps(true, true);

      t.index("username");
    });
  }
};

exports.down = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("users");
  if (exists) {
    return Promise.all([knex.schema.dropTable("users")]);
  }
};
