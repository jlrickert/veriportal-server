exports.seed = async (knex, Promise) => {
  await knex("users").del();
  await knex("auth").del();

  // all salted hashes of shhh
  const hashes = [
    "$2a$10$sMG3IAuHr0rIwav4D8no4O7ecapZAxLAryGEW8TPXUIE.prFBmUgG",
    "$2a$10$6rvxvobRn6al.vPVRndLNuAbrn9cGpqvWULj.dzds/BM9Ml.ph3wK",
    "$2a$10$kM7Pe31ILSfTfYCfiwZfWu4KDeBvq0KbpDn.lrz9mGPGavFglaHOe",
    "$2a$10$iRlYbDhZC/tuuMnvNeRMUuw/Eh8SLx/h.rMOoEBYsVXiS/eVVrOQS",
    "$2a$10$zm2FEiNcE/1eho.73q3MQO3IKI9haRud2RxvAs0vmxk/ak62bVn5O",
    "$2a$10$TwJ6XxNqn/4YKacTe0o2jO5nR67oUzM7g49dpEAw6BIE5RUb8WJWy",
    "$2a$10$3pfWg8hYimFnoRppcifC4OhcPAQwL/Wa5pRKa9K.SCOnuuATbNfPy",
    "$2a$10$09npp0.oketOW59OgTXba.bCgAZfHfBIBY2JqoqygrunURzX2eEn.",
    "$2a$10$FVLwxNtVHTk8s8jfIFV82expUZ3/5PSCvPZ.eJsd8jabrSwuVS1WC",
    "$2a$10$rREGiliXsWihyWIC6U6iw.965vbho/cZIfUD.1VNwk/Ny9eSyF5bS",
    "$2a$10$GEvThNpzGCAx4.n9kImtierBGAAehOSdg9oacl2w35W9tHvbQLrIa",
    "$2a$10$22YzVS/uGTMhJjV9W1//XeD1lEed/wXTOz4AiKStbqy4n6og1nN6e",
    "$2a$10$Q/0S9MM5kt0vTwPoYqSoteBkWBlztciYseZaffPzAtcjqjBe8HTl6",
    "$2a$10$GXfLze.UFmLqiUGFUhxgy.etNnA2jPVmIax7AgojArhvRQq1X.yKK",
    "$2a$10$XsLmHIbSE78lsm4OLBqPguOORf5e3ZF0zdjS7cwU5Mm879R8iteKu",
    "$2a$10$jqI3t5symWT1AqmzQtSd6Ot7GXqvZL9AZbfhivOL8/lizCbQO.PSa",
    "$2a$10$KfkvXb5wfbqWg645SlI76OXhgi0TVYnU8EMx/6lAN4PXehAUB8vVi",
    "$2a$10$Hb0ve82aePTN2uX28ueNOu3Nyi1gzGq2U4r7tm7AwVLUTsG7F7GnW"
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
        username: "password_update",
        first_name: "password",
        last_name: "update",
        admin: false
      },
      {
        username: "login",
        first_name: "firstName",
        last_name: "lastName",
        admin: false
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
