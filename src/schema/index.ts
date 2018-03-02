import { resolvers } from "../resolvers";

import { readGraphQLFile, buildSchema } from "./utils";
import { GraphQLSchema } from "graphql";

export const typeDefs = readGraphQLFile("typeDefs.graphql");
export const schema: GraphQLSchema = buildSchema(typeDefs, resolvers);

export default schema;
