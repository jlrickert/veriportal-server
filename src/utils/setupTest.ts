import { graphql, ExecutionResult } from "graphql";

import * as Config from "../config";
import * as Core from "../coreSql";

export interface IGqlArgs {
  query: string;
  root?: any;
  user?: Promise<Core.User>;
  variables?: { [key: string]: any };
}

export const gqlContext = (
  schema
): ((args: IGqlArgs) => Promise<ExecutionResult>) => {
  return args =>
    graphql({
      schema,
      source: args.query,
      contextValue: { user: args.user || Promise.resolve(null) },
      variableValues: args.variables
    });
};

beforeAll(async () => {
  await Core.Managment.migrate();
  await Core.Managment.seed();
});

afterAll(async () => {
  await Core.Managment.rollback();
  await Core.sql.destroy();
});
