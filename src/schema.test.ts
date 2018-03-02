import { graphql } from "graphql";
import { executeGraphql } from "./testUtils";
import schema from "./schema";

describe("Graphql schema", () => {
  it("should have a context", async () => {
    const query = `query { users {id author title } }`;
    const res = await executeGraphql(schema, query);
    expect(res.data.books[0].author).toEqual("user");
  });

  it("should have user", async () => {
    const query = `query { books {id author title } }`;
    const res = await executeGraphql(schema, query);
    expect(res).toHaveProperty("data");
  });
});
