import * as fs from "fs";
import { GraphQLSchema } from "graphql";
import { addMockFunctionsToSchema, makeExecutableSchema } from "graphql-tools";

export const readGraphQLFile = (graphqlFile): string =>
  fs.readFileSync(`${__dirname}/${graphqlFile}`).toString();

export const buildSchema = (args: {
  typeDefs: string;
  resolvers: any;
}): GraphQLSchema => {
  const schema = makeExecutableSchema({
    typeDefs: args.typeDefs,
    resolvers: args.resolvers
  });
  addMockFunctionsToSchema({ schema, mocks: {}, preserveResolvers: true });
  return schema;
};
