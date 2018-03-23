import { rootResolver } from "../resolvers";
import { gqlContext } from "../utils/setupTest";
import { schema, IContext, ISchemaUser } from "../schema";
import { verifyToken } from "../utils/auth";
import { User, sql } from "../coreSql";

const gql = gqlContext(schema);

describe("User Query", () => {
  it("should be able to query current logged in user with `query me {...}`", async () => {
    const user = User.fromId(1);
    const query = `query { me { username admin firstName lastName } }`;
    const res = await gql({ query, user });
    expect(res!.data!.me!.username).toEqual(
      await user.then(user => Promise.resolve(user.username))
    );
  });

  it("should not query current user when no logged in with `query me {...}`", async () => {
    const query = `query { me { username admin firstName lastName } }`;
    const res = await gql({ query });
    expect(res.data).toBeNull();
    expect(res!.errors!.toString()).toContain("Not authenticated");
  });

  it("should be able to query a user", async () => {
    const user = User.fromId(1);
    const query = `query { user(username: "jlrickert") { username admin firstName lastName } }`;
    const res = await gql({ query, user });
    expect(res!.data!.user!.username).toEqual(
      await user.then(user => Promise.resolve(user.username))
    );
  });

  it("should not be able to query a user when unauthenticated", async () => {
    const user = User.fromId(1);
    const query = `query { user(username: "jlrickert") { username admin firstName lastName } }`;
    const res = await gql({ query });
    expect(res.data).toEqual(null);
    expect(res!.errors!.toString()).toContain("Not authenticated");
  });

  it("should be able to query users", async () => {
    const user = User.fromId(1);
    const query = (limit: number, offset: number): string => `
query {
  users(params: { limit: ${limit}, offset: ${offset} }) {
    username
    admin
    firstName
    lastName
  }
}`;
    const users = await sql("users")
      .orderBy("username")
      .then(res => res as ISchemaUser[]);

    [0, 1, 2, 3, 4, 5].forEach(async baseOffset => {
      [1, 2, 3, 4, 5, 20].forEach(async limit => {
        for (let i = 0; i < Math.ceil(users.length / limit); i += 1) {
          const offset_ = baseOffset + limit * i;
          const res = await gql({ query: query(limit, offset_), user }).then(
            res => res.data!.users as ISchemaUser[]
          );
          const expectedLength = (() => {
            if (offset_ >= users.length) {
              return 0;
            }
            const diff = users.length - offset_;
            return diff < limit ? diff : limit;
          })();
          expect(expectedLength).toEqual(res.length);
          if (offset_ < users.length) {
            expect(res[0].username).toEqual(users[offset_].username);
          } else {
            expect(users[offset_]).toBeUndefined();
          }
        }
      });
    });
  });
});

describe("User Mutation", () => {
  const loginQuery = `
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    user {
      username
      firstName
      lastName
      admin
    }
    refreshToken
    token
  }
}`;

  it("should be able to login with valid credentials", async () => {
    const username = "jlrickert";
    const password = "shhh";
    const res = await gql({
      query: loginQuery,
      variables: { username, password }
    });
    const user = await User.fromUsername(username);
    const payload = res!.data!.login;
    expect(payload.user.username).toEqual(user.username);
    expect(payload.refreshToken).toEqual(user.refreshToken);
    const tokenPayload = verifyToken(payload.token);
    expect(tokenPayload.username).toEqual(username);
  });

  it("should not be able to login with invalid credentials", async () => {
    const username = "jlrickert";
    const password = "invalid password";
    const res = await gql({
      query: loginQuery,
      variables: { username, password }
    });
    expect(res!.errors!.toString()).toContain("Invalid credentials");
  });
});
