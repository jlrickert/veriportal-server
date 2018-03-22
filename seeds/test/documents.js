const documentsTable = "documents";
const documentTypeEnumTable = "documentTypeEnum";
const documentLinksTable = "documentLinks";

exports.seed = async (knex, Promise) => {
  [documentsTable, documentTypeEnumTable, documentLinksTable].forEach(
    async table => await knex(table).del()
  );

  // Deletes ALL existing entries
  const docTypes = (async () => {
    const types = ["weekly", "monthly", "daily"].map(name => ({ name }));
    return await knex(documentTypeEnumTable).insert(types, "*");
  })();

  const docs = [
    {
      author: 1,
      name: "daily parking tickets",
      description: "Example document",
      links: ["/mnt/daily/ticket-3-3-2018"],
      types: ["daily"]
    }
  ];
  const docLinks = [];

  return Promise.all([
    // knex(documentTypeEnumTable).insert(docTypes)
    // knex(documentsTable).insert(docs)
  ]);
  // // Inserts seed entries
  // return knex("table_name").insert([
  //   { id: 1, colName: "rowValue1" },
  //   { id: 2, colName: "rowValue2" },
  //   { id: 3, colName: "rowValue3" }
  // ]);
};
