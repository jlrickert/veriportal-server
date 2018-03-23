exports.seed = async (knex, Promise) => {
  // Deletes ALL existing entries
  return knex("documentLinks")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("documentTypeEnum").insert([
        { colName: "weekly" },
        { colName: "daily" },
        { colName: "monthly" }
      ]);
    });
};
