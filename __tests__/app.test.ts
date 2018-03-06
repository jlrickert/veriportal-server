import * as request from "supertest";

import { appServer, appServerWithDefaults } from "../src/server";
import { rootResolver } from "../src/resolvers";
import { schema } from "../src/schema";
import { testDb } from "../src/setupTest";

const app = appServerWithDefaults(schema, testDb);

describe("routes : index", () => {
  it("Should get a 404 on invalid page", async () => {
    const res = await request(app).get("/");
    return expect(res.status).toBe(404);
  });
});
