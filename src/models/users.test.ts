import { Users, testDb } from "../setupTest";
import { verifyToken, issueJWT } from "../auth";

describe("Users model", () => {
  it("should be able to fetch a user by username", async () => {
    const user = await Users.fetchUserByUsername("jlrickert");
    expect(user.username).toEqual("jlrickert");
  });

  it("should be able to fetch users from the database", async () => {
    const users = await Users.fetchUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("username");
  });

  it("should be able to signup a user", async () => {
    const newUserParams = {
      username: "jacob",
      firstName: "Jake",
      lastName: "Smith",
      password: "shhh"
    };
    const payload = await Users.signup(newUserParams);
    expect(payload.user.username).toEqual(newUserParams.username);
    expect(payload.token.length).toBeGreaterThan(0);
    expect(payload.user.admin).toEqual(false);
  });

  it("should not be able to signup a user with a non unique name", async () => {
    const newUserParams = {
      username: "jlrickert",
      firstName: "Jared",
      lastName: "Fake",
      password: "shhh"
    };
    expect(Users.signup(newUserParams)).rejects.toContain("already exists");
  });

  it("should be able to login", async () => {
    const username = "rrabbit";
    const password = "shhh";
    const payload = await Users.login(username, password);

    expect(payload.token.length).toBeGreaterThan(0);
    expect(payload.refreshToken.length).toBeGreaterThan(0);
    expect(payload.user.username).toEqual(username);

    const user = await Users.fetchUserByUsername("rrabbit");

    expect(payload.refreshToken).toEqual(user.refresh_token);
  });

  it("should be able to refresh a token", async () => {
    const user = await Users.fetchUserByUsername("jlrickert");

    const refreshToken = user.refresh_token;
    const payload = await Users.refreshToken(refreshToken);
    const contents = verifyToken(payload.token);
    expect(contents.username).toEqual(user.username);
    expect(contents.admin).toEqual(user.admin);
  });

  it("should reject refreshing a token with invalid token", () => {
    const invalidToken = "abcdefg";
    expect(Users.refreshToken(invalidToken)).rejects.toEqual("Invalid token");
  });

  it("should be able to invalidate all tokens", async () => {
    let user = await Users.fetchUserByUsername("gnr");
    user = await Users.revokeTokens(user);
    expect(user.refresh_token).toBeNull();
  });

  it("should be able to update a users password", async () => {
    const oldHash = (async () => {
      const user = await Users.fetchUserByUsername("cjacky");
      const payload = Users.updatePassword(user, "shoo");
      return user.hash;
    })();

    const user = await Users.fetchUserByUsername("cjacky");
    expect(user.hash).not.toEqual(oldHash);
    expect(user.hash.length).toBeGreaterThan(0);
  });
});
