import { rootResolver } from "../resolvers";
import { gqlContext } from "../utils/setupTest";
import { schema, IContext, ISchemaUser } from "../schema";
import { verifyToken } from "../utils/auth";
import { User } from "../coreSql";

const gql = gqlContext(schema);

describe("User Query", () => {
  it("should be able to query current logged in user with `query me {...}`", async () => {
    const user = User.fromId(1);
    const query = `query { me { username admin firstName lastName } }`;
    const res = await gql({ query, user });
    expect(res!.data!.me!.username).toEqual(
      await user.then(user => user.getData("username"))
    );
  });

  it("should not query current user when no logged in with `query me {...}`", async () => {
    const query = `query { me { username admin firstName lastName } }`;
    const res = await gql({ query });
    expect(res.data).toEqual(null);
    expect(res!.errors!.toString()).toContain("Not authenticated");
  });

  it("should be able to query a user", async () => {
    const user = User.fromId(1);
    const query = `query { user(username: "jlrickert") { username admin firstName lastName } }`;
    const res = await gql({ query, user });
    expect(res!.data!.user!.username).toEqual(
      await user.then(user => user.getData("username"))
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
    const query = `query { users { username admin firstName lastName } }`;
    const res = await gql({ query, user });
    expect(res!.data!.users!.length).toBeGreaterThanOrEqual(2);
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
    const { user, refreshToken, token } = res!.data!.login;
    expect(user.username).toEqual(username);
    expect(refreshToken.length).toBeGreaterThan(0);
    const tokenPayload = verifyToken(token);
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

  it("should be able to get a new token with a valid token", async () => {
    const user = await User.fromUsername("jlrickert");
    // const query = `refreshToken(token: ``)`;
  });
});
