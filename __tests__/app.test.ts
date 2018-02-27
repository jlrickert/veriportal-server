import * as request from "supertest";
import { makeExecutableSchema } from "graphql-tools";

import { newGraphqlServer } from "../src/server";
import { resolvers } from "../src/resolvers";
import { typeDefs } from "../src/schema";

const schema = makeExecutableSchema({ typeDefs, resolvers });
const app = newGraphqlServer(schema);

describe("routes : index", () => {
  it("Should get a 404 on invalid page", async () => {
    const res = await request(app).get("/");
    return expect(res.status).toBe(404);
  });
});
