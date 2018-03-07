import { GraphQLSchema } from "graphql";

import { rootResolver } from "../resolvers";
import { readGraphQLFile, buildSchema } from "./utils";

export * from "./types";
export { readGraphQLFile, buildSchema } from "./utils";
export const typeDefs = readGraphQLFile("typeDefs.graphql");
export const schema: GraphQLSchema = buildSchema({
  typeDefs,
  resolvers: rootResolver
});

export default schema;
