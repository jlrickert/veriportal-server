import * as request from "supertest";

import { newGraphqlServer } from "../src/server";
import { resolvers } from "../src/resolvers";
import { schema } from "../src/schema";

const app = newGraphqlServer(schema);

describe("routes : index", () => {
  it("Should get a 404 on invalid page", async () => {
    const res = await request(app).get("/");
    return expect(res.status).toBe(404);
  });
});
