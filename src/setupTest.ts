import { graphql, ExecutionResult } from "graphql";

import { SqlConnection } from "./connector";
import * as Config from "./config";
import { SqlUsers } from "./models";
import { IUser, ISchemaContext } from "./schema/types";

export const testDb = new SqlConnection(Config.knexConfig);
export const Users = new SqlUsers(testDb);

export const gql = (
  schema,
  source,
  ctx?: ISchemaContext
): Promise<ExecutionResult> => {
  return graphql({
    schema,
    source,
    contextValue: ctx
  });
};

beforeAll(async () => {
  await testDb.migrate();
  await testDb.seed();
});

afterAll(async () => {
  await testDb.rollback();
  await testDb.knex.destroy();
});
