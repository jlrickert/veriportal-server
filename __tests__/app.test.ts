import * as request from "supertest";

import { newServer } from "../src/server";

const app = newServer();

describe("routes : index", () => {
  it("Should get a 404 on invalid page", async () => {
    const res = await request(app).get("/");
    return expect(res.status).toBe(404);
  });
});
