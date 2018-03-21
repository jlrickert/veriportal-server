import "../utils/setupTest";
import { sql } from "./connector";
import { User, ISqlUser } from "./userModel";
import * as Schema from "../schema";
import { refreshToken } from "../resolvers/users";
import { hashPassword, comparePasswords, verifyToken } from "../utils";

const dataKeys = [
  "id",
  "username",
  "firstName",
  "lastName",
  "admin",
  "hash",
  "refreshToken"
];

describe("User.fromUsername", () => {
  const id = 1;
  const username = "jlrickert";
  it("should be able to retrieve user from database", async () => {
    const user = await User.fromUsername(username);
    expect(user.getData("id")).toEqual(id);
    expect(user.getData("username")).toEqual(username);
  });

  it("should reject retrieving a non existing user", async () => {
    const username = "invalid user";
    const user = User.fromUsername(username);
    expect(user).rejects.toContain(`User "${username}" does not exist`);
  });
});

describe("User.fromId", () => {
  it("should be able to retrieve user from database", async () => {
    const username = "jlrickert";
    const id = 1;
    const user = await User.fromId(id);
    expect(user.getData("id")).toEqual(id);
    expect(user.getData("username")).toEqual(username);
  });

  it("should reject retrieving a non existing user", async () => {
    const username = "invalid user";
    const id = 666;
    expect(User.fromId(id)).rejects.toContain(
      `User with id "${id}" does not exist`
    );
  });
});

describe("User.login", () => {
  it("should login user with valid credentials", async () => {
    const username = "login";
    const password = "shhh";
    const user = await User.login(username, password);
    expect(verifyToken(user.token)).toBeTruthy();
    const res = await sql("auth")
      .select()
      .where("userId", user.getData("id"))
      .first();
  });
});

describe("User.signup", () => {
  it("should create a new user with unique username", async () => {
    const signupInput: Schema.ISignupInput = {
      username: "jackn52",
      firstName: "Jack",
      lastName: "Rabbit",
      password: "shhh"
    };
    const newUser = await User.signup(signupInput);
    const user = await User.fromUsername(newUser.getData("username"));
    dataKeys.forEach(key =>
      expect(newUser.getData(key)).toEqual(user.getData(key))
    );
  });

  it("should reject create a user with a non unique username", () => {
    const signupInput: Schema.ISignupInput = {
      username: "jlrickert",
      firstName: "Jared",
      lastName: "Rickert",
      password: "shhh"
    };
    expect(User.signup(signupInput)).rejects.toContain(
      `User "${signupInput.username}" already exists`
    );
  });
});

describe("User.fromToken", () => {
  it("should reject on invalid token", () => {
    const token = "bucket";
    expect(User.fromToken(token)).rejects.toContain("Invalid token");
  });

  it("should be able to get user from a valid token", async () => {
    const token = "abc";
    const username = "jlrickert";
    const user = await User.fromToken(token);
    const expectedUser = await User.fromUsername(username);
    dataKeys.forEach(key =>
      expect(expectedUser.getData(key)).toEqual(user.getData(key))
    );
  });
});

describe("User.toSchema", () => {
  it("should export its contents", async () => {
    const username = "jlrickert";
    const user = await User.fromUsername(username);
    const payload = user.toGqlSchema();
    expect(payload.username).toEqual(username);
    expect(payload.firstName).toEqual("Jared");
    expect(payload.lastName).toEqual("Rickert");
    expect(payload.admin).toEqual(true);
  });
});

describe("User.updatePassword", () => {
  it("should update a users password", async () => {
    const username = "password_update";
    const password = "rawr";
    const user = await User.fromUsername(username);
    const oldHash = user.getData("hash");
    user.updatePassword(password);
    const res = await sql("auth")
      .select()
      .where("userId", user.getData("id"))
      .first();

    const { hash } = res;
    expect(comparePasswords(password, hash)).toBeTruthy();
  });
});

describe("User.revokeToken", () => {
  it("should remove token from database", async () => {
    const username = "password_update";
    const user = await User.fromUsername(username);
    await user.revokeToken();
    const res = await sql("auth")
      .select()
      .where("userId", user.getData("id"))
      .first();
    expect(res.refreshToken).toBeNull();
  });
});
