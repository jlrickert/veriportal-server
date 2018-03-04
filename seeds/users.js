exports.seed = (knex, Promise) => {
  return knex("users")
    .del()
    .then(() =>
      knex("users").insert([
        {
          username: "jlrickert",
          first_name: "Jared",
          last_name: "Rickert",
          admin: true
        },
        {
          username: "dmrickert",
          first_name: "Donna",
          last_name: "Rickert",
          admin: false
        },
        {
          username: "jjrickert",
          first_name: "Justen",
          last_name: "Rickert",
          admin: false
        }
      ])
    );
};
