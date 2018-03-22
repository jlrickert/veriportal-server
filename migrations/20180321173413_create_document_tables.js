const documents = "documents";
const documentTypeEnum = "documentTypeEnum";
const documentLinks = "documentLinks";

exports.up = async (knex, Promise) => {
  return Promise.resolve()
    .then(() =>
      knex.schema.createTable(documentTypeEnum, t => {
        t.increments("id").primary();

        t.text("name").notNullable();
      })
    )

    .then(() =>
      knex.schema.createTable(documents, t => {
        t.increments("id").primary();

        t.text("name");

        t.dateTime("dueDate");

        t
          .integer("author")
          .unsigned()
          .references("users.id")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        t.text("description");

        t
          .integer("docType")
          .unsigned()
          .unique()
          .notNullable()
          .references(`${documentTypeEnum}.id`)
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        t.timestamps(true, true);
      })
    )

    .then(() =>
      knex.schema.createTable(documentLinks, t => {
        t.increments("id").primary();

        t
          .integer("docId")
          .unsigned()
          .unique()
          .notNullable()
          .references(`${documents}.id`)
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        t.text("link").notNullable();
      })
    );
};

exports.down = async (knex, Promise) => {
  const dropTable = table => {
    return knex.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`);
  };

  return Promise.all([
    dropTable(documentTypeEnum),
    dropTable(documentLinks),
    dropTable(documents)
  ]);
};
