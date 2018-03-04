exports.seed = (knex, Promise) => {
  return knex
    .table("User")
    .del()
    .then(() =>
      knex
        .table("User")
        .insert([
          {
            username: "jlrickert",
            firstName: "Jared",
            lastName: "Rickert",
            admin: true
          },
          {
            username: "dmrickert",
            firstName: "Donna",
            lastName: "Rickert",
            admin: false
          },
          {
            username: "jjrickert",
            firstName: "Justen",
            lastName: "Rickert",
            admin: false
          }
        ])
    );
};
