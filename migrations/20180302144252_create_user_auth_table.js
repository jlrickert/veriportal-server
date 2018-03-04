exports.up = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("Auth");
  if (!exists) {
    return knex.schema.createTable("Auth", t => {
      t.increments("id").primary();

      t
        .integer("userId")
        .unsigned()
        .unique()
        .notNullable()
        .references("User.id")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      t.string("refreshToken").unique();

      t.string("passwordHash");
    });
  }
};

exports.down = async (knex, Promise) => {
  const exists = await knex.schema.hasTable("Auth");
  if (exists) {
    return Promise.all([knex.schema.dropTable("Auth")]);
  }
};
