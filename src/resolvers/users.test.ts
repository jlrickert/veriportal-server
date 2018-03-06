import { rootResolver } from "./index";
import { gql, Users, testDb } from "../setupTest";
import { schema } from "../schema";

describe("User resolver", () => {
  it("should be able to fetch current user info", async () => {
    const query = `query { me { username } }`;
    const context = {
      user: await Users.fetchUserById(1)
    };
    const res = await gql(schema, query, context);
    expect(res).toContain(context.user);
  });

  it("should not fetch a user if not authenticated", async () => {
    const query = `query { me { username } }`;
    const res = await gql(schema, query);
    expect(res).toContain("fasdf");
  });

  it("should be able to signup", () => {});

  it("should be able to login", () => {});

  it("should be able to refresh token", () => {});

  it("should be able to revoke token", () => {});

  it("should be able to update password", () => {});

  it("should be able to query a user", () => {});

  it("should be able to query users", async () => {
    const query = `query { users {id username firstName lastName admin } }`;
    const res = await gql(schema, query);
    const dataStr = JSON.stringify(res);
    expect(res).toHaveProperty("data");
    ["id", "username", "firstName", "lastName", "admin"].forEach(column => {
      expect(dataStr).toContain(column);
    });
  });
});
