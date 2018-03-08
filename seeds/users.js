exports.seed = async (knex, Promise) => {
  await knex("users").del();
  await knex("auth").del();

  const hashes = [
    "$2a$10$sMG3IAuHr0rIwav4D8no4O7ecapZAxLAryGEW8TPXUIE.prFBmUgG",
    "$2a$10$6rvxvobRn6al.vPVRndLNuAbrn9cGpqvWULj.dzds/BM9Ml.ph3wK",
    "$2a$10$kM7Pe31ILSfTfYCfiwZfWu4KDeBvq0KbpDn.lrz9mGPGavFglaHOe"
  ];

  const refreshTokens = [
    "abc",
    "def",
    "ghi",
    "jkl",
    "mno",
    "pqrs",
    "tuv",
    "wxy",
    "rofl"
  ];

  const users = await knex("users").insert(
    [
      {
        username: "jlrickert",
        first_name: "Jared",
        last_name: "Rickert",
        admin: true
      },
      {
        username: "rrabbit",
        first_name: "Roger",
        last_name: "Rabbit",
        admin: false
      },
      {
        username: "cjacky",
        first_name: "Jacky",
        last_name: "Chan",
        admin: false
      },
      {
        username: "gnr",
        first_name: "Guns",
        last_name: "Roses",
        admin: false
      }
    ],
    ["id"]
  );

  return knex("auth").insert(
    users.map((user, i) => {
      return {
        user_id: user.id,
        hash: hashes[i % hashes.length],
        refresh_token: refreshTokens[i % refreshTokens.length]
      };
    })
  );
};
