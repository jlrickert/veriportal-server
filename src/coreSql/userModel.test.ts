import "../utils/setupTest";
import { sql } from "./connector";
import { User, ISqlUser } from "./userModel";
import * as Schema from "../schema";
import { hash } from "bcryptjs";
import { refreshToken } from "../resolvers/users";

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
