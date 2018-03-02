import { readGraphQLFile, buildSchema } from "./utils";

describe("Utilities for schema", () => {
  it("should be able to read graphql schema", () => {
    const typeDefs = readGraphQLFile("typeDefs.graphql");
    expect(typeDefs).toContain("Query");
  });
});
