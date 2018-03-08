import { rootResolver } from "../resolvers";
import { gql, Users, testDb } from "../setupTest";
import { schema, ISchemaContext } from "../schema";

describe("User resolver", () => {
  const context = {
    Users: Users
  } as ISchemaContext;
  it("should be able to fetch current user info", async () => {
    const user = Promise.resolve({
      id: 5,
      username: "jlrickert",
      firstName: "Jared",
      lastName: "Rickert",
      admin: true
    });

    const res = await rootResolver.Query.me(
      {},
      {},
      {
        user
      }
    );
    expect(res).toEqual(await user);
  });

  it("should not fetch a user if not authenticated", async () => {
    const res = await rootResolver.Query.me({}, {}, {});
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
    expect(res.data.length).toBeGreaterThan(0);
    ["id", "username", "firstName", "lastName", "admin"].forEach(column => {
      expect(dataStr).toContain(column);
    });
  });
});
