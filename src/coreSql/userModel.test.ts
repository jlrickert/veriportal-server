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
    expect(await user.getData("id")).toEqual(id);
    expect(await user.getData("username")).toEqual(username);
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
    expect(await user.getData("id")).toEqual(id);
    expect(await user.getData("username")).toEqual(username);
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
      .where("userId", await user.getData("id"))
      .first();
  });
});

describe("User.signup", () => {
  it("should create a new user with unique username", async () => {
    const signupInput: Schema.ISchemaSignupInput = {
      username: "jackn52",
      firstName: "Jack",
      lastName: "Rabbit",
      password: "shhh"
    };
    const newUser = await User.signup(signupInput);
    const user = await User.fromUsername(await newUser.getData("username"));
    dataKeys.forEach(async key =>
      expect(await newUser.getData(key)).toEqual(await user.getData(key))
    );
  });

  it("should reject create a user with a non unique username", () => {
    const signupInput: Schema.ISchemaSignupInput = {
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
    dataKeys.forEach(async key =>
      expect(await expectedUser.getData(key)).toEqual(await user.getData(key))
    );
  });
});

describe("User.toSchema", () => {
  it("should export its contents", async () => {
    const username = "jlrickert";
    const user = await User.fromUsername(username);
    const payload = await user.toGqlSchema();
    expect(payload.username).toEqual(user.getData("username"));
    expect(payload.firstName).toEqual(user.getData("firstName"));
    expect(payload.lastName).toEqual(user.getData("lastName"));
    expect(payload.admin).toEqual(user.getData("admin"));
  });
});

describe("User.updatePassword", () => {
  it("should update a users password", async () => {
    const username = "password_update";
    const password = "rawr";
    const user = await User.fromUsername(username);
    const oldHash = await user.getData("hash");
    await user.updatePassword(password);
    const res = await sql("auth")
      .select()
      .where("userId", await user.getData("id"))
      .first();

    const { hash } = res;
    expect(await comparePasswords(password, hash)).toBeTruthy();
  });
});

describe("User.revokeToken", () => {
  it("should remove token from database", async () => {
    const username = "password_update";
    const user = await User.fromUsername(username);
    await user.revokeToken();
    const res = await sql("auth")
      .select()
      .where("userId", await user.getData("id"))
      .first();
    expect(res.refreshToken).toBeNull();
  });
});
