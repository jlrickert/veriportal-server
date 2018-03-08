import { graphql, ExecutionResult } from "graphql";

import { SqlConnection } from "./connector";
import * as Config from "./config";
import { SqlUsers, IUsers } from "./models";
import { IUser, ISchemaContext } from "./schema/types";

export let testDb: SqlConnection;
export let Users: IUsers;

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
  testDb = new SqlConnection(Config.knexConfig);
  Users = new SqlUsers(testDb);
  await testDb.migrate();
  await testDb.seed();
});

afterAll(async () => {
  await testDb.rollback();
  await testDb.knex.destroy();
});
