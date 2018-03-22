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
    expect(user.id).toEqual(id);
    expect(user.username).toEqual(username);
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
    expect(user.id).toEqual(id);
    expect(user.username).toEqual(username);
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
    const res = await sql("users")
      .select()
      .where("users.id", user.id)
      .join("auth", "auth.user_id", "users.id")
      .first()
      .then(user => Promise.resolve(user as ISqlUser));

    expect(res.id).toEqual(user.id);
    expect(res.username).toEqual(user.username);
  });

  it("should reject on invalid password", async () => {
    const username = "login";
    const password = "meowwww";
    expect(User.login(username, password)).rejects.toContain(
      "Invalid credentials"
    );
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
    const user = await User.fromUsername(newUser.username);
    expect(newUser.equals(user)).toBeTruthy();
    expect(newUser.id).toEqual(user.id);
    expect(newUser.firstName).toEqual(signupInput.firstName);
    expect(newUser.lastName).toEqual(signupInput.lastName);
    expect(newUser.admin).toBeFalsy();
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

    expect(user.equals(user)).toBeTruthy();
    expect(user.id).toEqual(user.id);
    expect(user.firstName).toEqual(expectedUser.firstName);
    expect(user.lastName).toEqual(expectedUser.lastName);
    expect(user.admin).toEqual(expectedUser.admin);
  });
});

describe("User.toGqlSchema", () => {
  it("should export its contents", async () => {
    const username = "jlrickert";
    const user = await User.fromUsername(username);
    const payload = await user.toGqlSchema();
    expect(payload.username).toEqual(user.username);
    expect(payload.firstName).toEqual(user.firstName);
    expect(payload.lastName).toEqual(user.lastName);
    expect(payload.admin).toEqual(user.admin);
  });
});

describe("User.updatePassword", () => {
  it("should update a users password", async () => {
    const username = "password_update";
    const password = "rawr";
    const user = await User.fromUsername(username);
    await user.updatePassword(password);
    const res = await sql("auth")
      .select()
      .where("user_id", user.id)
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
      .where("user_id", user.id)
      .first();
    const { refresh_token } = res;
    expect(refresh_token).toBeNull();
    expect(user.refreshToken).toBeNull();
  });
});
