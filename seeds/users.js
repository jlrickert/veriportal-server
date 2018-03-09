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
        firstName: "Jared",
        lastName: "Rickert",
        admin: true
      },
      {
        username: "rrabbit",
        firstName: "Roger",
        lastName: "Rabbit",
        admin: false
      },
      {
        username: "cjacky",
        firstName: "Jacky",
        lastName: "Chan",
        admin: false
      },
      {
        username: "gnr",
        firstName: "Guns",
        lastName: "Roses",
        admin: false
      }
    ],
    ["id"]
  );

  return knex("auth").insert(
    users.map((user, i) => {
      return {
        userId: user.id,
        hash: hashes[i % hashes.length],
        refreshToken: refreshTokens[i % refreshTokens.length]
      };
    })
  );
};
