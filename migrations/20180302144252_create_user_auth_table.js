exports.up = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("auth");
  if (!exists) {
    return knex.schema.createTable("auth", t => {
      t.increments("id").primary();

      t
        .integer("userId")
        .unsigned()
        .unique()
        .notNullable()
        .references("users.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      t.string("refreshToken").unique();

      t.string("hash");

      t.timestamps(true, true);

      t.index("refreshToken");
    });
  }
};

exports.down = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("auth");
  if (exists) {
    return Promise.all([knex.schema.dropTable("auth")]);
  }
};
