exports.up = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("auth");
  if (!exists) {
    return knex.schema.createTable("auth", t => {
      t.increments("id").primary();

      t
        .integer("user_id")
        .unsigned()
        .unique()
        .notNullable()
        .references("users.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      t.string("refresh_token").unique();

      t.string("passwordHash");
    });
  }
};

exports.down = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("auth");
  if (exists) {
    return Promise.all([knex.schema.dropTable("auth")]);
  }
};
