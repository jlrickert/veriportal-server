import * as fs from "fs";
import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";

export const readGraphQLFile = graphqlFile =>
  fs.readFileSync(`${__dirname}/${graphqlFile}`).toString();

export const buildSchema = (typeDefs, resolvers) => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  addMockFunctionsToSchema({ schema, mocks: {}, preserveResolvers: true });
  return schema;
};
