import * as Auth from "./auth";

describe("json web token based authentication", () => {
  const user = {
    id: 6,
    username: "jackrabbit",
    firstName: "Jack",
    lastName: "Rabbit",
    admin: false
  };

  const jwtString =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphY2tyYWJiaXQiLCJhZG1pbiI6ZmFsc2V9.48rXUG3XSffuXtNg3-AjTcJoi3Dx-IKCZsAGAP0MO7U";
  it("should be able to issue a jwt for a user", () => {
    const token = Auth.issueJWT(user, { expiresIn: 0, noTimestamp: true });
    expect(token).toEqual(jwtString);
  });

  it("should be able to create a token", () => {});

  it("should be able verify a token", () => {
    const payload = Auth.verifyToken(jwtString);
    expect(payload).toEqual({ username: user.username, admin: user.admin });
  });

  it("should be able to generate a unique refresh token", () => {
    const token1 = Auth.newRefreshToken();
    const token2 = Auth.newRefreshToken();
    expect(token1).not.toEqual(token2);
  });

  it("should be able to generate a refresh token of length", () => {
    expect(Auth.newRefreshToken().length).toBeGreaterThanOrEqual(128);
  });
});

describe("Hashing functions", () => {
  const password = "secret";
  const hashPromise = Auth.hashPassword(password);

  it("should be able to hash a password", async () => {
    const hash = await hashPromise;
    expect((await hash).length).not.toEqual(0);
    expect(await hash).not.toEqual(password);
  });

  it("should be able to verify matching passwords", async () => {
    const hash = await hashPromise;
    const result = await Auth.comparePasswords(password, hash);
    expect(result).toBeTruthy();
  });

  it("should not verify non matching passwords", async () => {
    const hash = await hashPromise;
    const result = await Auth.comparePasswords("mojojojo", hash);
    expect(result).toBeFalsy();
  });
});
