import { graphql, ExecutionResult } from "graphql";

import { SqlConnection } from "./connector";
import * as Config from "./config";
import { SqlUsers, IUsers } from "./models";
import { IUser, ISchemaContext } from "./schema/types";

export interface IgqlContextArgs {
  query: string;
  root?: any;
  user?: Promise<IUser>;
  variables?: { [key: string]: any };
}

export const gqlContext = (
  schema
): ((args: IgqlContextArgs) => Promise<ExecutionResult>) => {
  return args =>
    graphql({
      schema,
      source: args.query,
      contextValue: { user: args.user || Promise.resolve(null), Users },
      variableValues: args.variables
    });
};

export let testDb: SqlConnection;
export let Users: IUsers;

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
