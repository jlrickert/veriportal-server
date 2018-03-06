import * as fs from "fs";
import { GraphQLSchema } from "graphql";
import { addMockFunctionsToSchema, makeExecutableSchema } from "graphql-tools";

export const readGraphQLFile = (graphqlFile): string =>
  fs.readFileSync(`${__dirname}/${graphqlFile}`).toString();

export const buildSchema = (typeDefs, resolvers): GraphQLSchema => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  addMockFunctionsToSchema({ schema, mocks: {}, preserveResolvers: true });
  return schema;
};
