import * as request from "supertest";

import { appServer, appServerWithDefaults } from "../server";
import { rootResolver } from "../resolvers";
import { schema } from "../schema";
import { testDb } from "../setupTest";

const app = appServerWithDefaults(schema, testDb);

describe("routes : index", () => {
  it("Should get a 404 on invalid page", async () => {
    const res = await request(app).get("/");
    return expect(res.status).toBe(404);
  });
});
