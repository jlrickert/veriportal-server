import { Users, testDb } from "../setupTest";
import { verifyToken, issueJWT } from "../auth";

describe("Users queries", () => {
  it("should be able to fetch a user by username", async () => {
    const user = await Users.fetchUserByUsername("jlrickert");
    expect(user.username).toEqual("jlrickert");
  });

  it("should be able to fetch users", async () => {
    const users = await Users.fetchUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("username");
  });
});

describe("Users authentication", () => {
  it("should be able to signup a user", async () => {
    const newUserParams = {
      username: "jacob",
      firstName: "Jake",
      lastName: "Smith",
      password: "mr smithy"
    };
    const payload = await Users.signup(newUserParams);
    expect(payload.user.username).toEqual(newUserParams.username);
    expect(payload.token.length).toBeGreaterThan(0);
    expect(payload.user.admin).toEqual(false);

    const user = await Users.fetchUserByUsername(newUserParams.username);
    expect(payload.user).toEqual(user);
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
    const user = await Users.fetchUserByUsername("rrabbit");
    const oldRefreshToken = user.refreshToken;

    const username = "rrabbit";
    const password = "shhh";
    const payload = await Users.login(username, password);

    expect(payload.token.length).toBeGreaterThan(0);
    expect(payload.refreshToken.length).toBeGreaterThan(0);
    expect(payload.user.username).toEqual(username);

    expect(payload.refreshToken).not.toEqual(oldRefreshToken);
  });

  it("should reject login for bad credentials", async () => {
    const username = "rrabbit";
    const password = "rawr";
    expect(Users.login(username, password)).rejects.toEqual(
      "Incorrect username or password"
    );
  });

  it("should be able to refresh a token", async () => {
    const user = await Users.fetchUserByUsername("jlrickert");
    const oldRefreshToken = user.refreshToken;

    const payload = await Users.refreshToken(user.refreshToken);

    expect(payload.refreshToken).not.toEqual(oldRefreshToken);

    const contents = verifyToken(payload.token);
    expect(contents.username).toEqual(user.username);
    expect(contents.admin).toEqual(user.admin);
  });

  it("should reject an invalid refresh token", () => {
    const invalidToken = "abcdefg";
    expect(Users.refreshToken(invalidToken)).rejects.toEqual("Invalid token");
  });

  it("should be able to invalidate all tokens", async () => {
    let user = await Users.fetchUserByUsername("gnr");
    user = await Users.revokeTokens(user);
    expect(user.refreshToken).toBeNull();
  });

  it("should be able to update a users password", async () => {
    const user = await Users.fetchUserByUsername("cjacky");
    const oldHash = user.hash;
    const payload = await Users.updatePassword(user, "shoo");

    expect(payload.user.hash).not.toEqual(oldHash);
    expect(payload.user.hash.length).toBeGreaterThan(0);
  });
});
