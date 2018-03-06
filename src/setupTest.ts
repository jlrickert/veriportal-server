import { graphql } from "graphql";

import { SqlConnection } from "./connector";
import * as Config from "./config";
import { SqlUsers } from "./models";

export const testDb = new SqlConnection(Config.knexConfig);

export const gql = (schema, source) =>
  graphql({
    schema,
    source,
    contextValue: {
      user: "user",
      Users: new SqlUsers(testDb)
    }
  });

beforeAll(async () => {
  await testDb.migrate();
  await testDb.seed();
});

afterAll(async () => {
  await testDb.rollback();
  await testDb.knex.destroy();
});
