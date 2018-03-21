import { User, sql, ISqlUser } from "../coreSql";
import {
  ISchemaUser,
  IContext,
  ISchemaAuthPayload,
  ISchemaSignupInput
} from "../schema";

////////////////////////////////////////////////////////////////////////////////
// Query
////////////////////////////////////////////////////////////////////////////////
export async function me(
  root: any,
  params: {},
  ctx: IContext
): Promise<ISchemaUser> {
  return ctx.user.then(user => user.toGqlSchema());
}

export async function user(
  root: any,
  { id }: { id: number },
  ctx: IContext
): Promise<ISchemaUser> {
  return User.fromId(id).then(user => user.toGqlSchema());
}

export async function users(
  root: any,
  params: {},
  ctx: IContext
): Promise<ISchemaUser[]> {
  const query = sql("users")
    .select("*")
    .join("auth", "users.id", "auth.userId");

  return query.then(res => {
    const users: Promise<ISchemaUser>[] = res.map((userData: ISqlUser) =>
      new User(userData).toGqlSchema()
    );
    return Promise.all(users);
  });
}

////////////////////////////////////////////////////////////////////////////////
// Mutation
////////////////////////////////////////////////////////////////////////////////
export async function login(
  root: any,
  { username, password }: { username: string; password: string },
  ctx: IContext
): Promise<ISchemaAuthPayload> {
  return User.login(username, password).then(createIAuthPayload);
}

export async function signup(
  root: any,
  params: ISchemaSignupInput,
  ctx: IContext
): Promise<ISchemaAuthPayload> {
  return User.signup(params).then(createIAuthPayload);
}

export async function refreshToken(
  root: any,
  { token }: { token: string },
  ctx: IContext
): Promise<ISchemaAuthPayload> {
  return User.fromToken(token).then(createIAuthPayload);
}

export async function revokeToken(
  root: any,
  params: any,
  ctx: IContext
): Promise<ISchemaUser> {
  return ctx.user
    .then(user => user.revokeToken())
    .then(user => user.toGqlSchema());
}

export async function updatePassword(
  root: any,
  { password }: { password: string },
  ctx: IContext
): Promise<ISchemaAuthPayload> {
  return ctx.user
    .then(user => user.updatePassword(password))
    .then(createIAuthPayload);
}

async function createIAuthPayload(user: User): Promise<ISchemaAuthPayload> {
  return Promise.resolve({
    user: await user.toGqlSchema(),
    token: user.token,
    refreshToken: await user.getData("refreshToken")
  });
}
