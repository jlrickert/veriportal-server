import { User, sql, ISqlUser } from "../coreSql";
import {
  ISchemaUser,
  IContext,
  ISchemaAuthPayload,
  ISchemaSignupInput,
  ISchemaUsersFilterInput
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
  { params }: { params: ISchemaUsersFilterInput },
  ctx: IContext
): Promise<ISchemaUser[]> {
  const lowestRowId = 1;
  const defaultLimit = 20;
  const limit =
    params.limit === undefined || params.limit < lowestRowId
      ? defaultLimit
      : params.limit;

  const defaultOffset = lowestRowId;
  const offset =
    params.offset === undefined || params.offset < lowestRowId
      ? defaultOffset
      : params.offset + lowestRowId;

  const query = sql
    .with("user_table", qb => {
      qb
        .select("*", sql.raw("ROW_NUMBER() OVER (ORDER BY username) as row_id"))
        .join("auth", "auth.user_id", "users.id")
        .from("users");
    })
    .limit(limit)
    .where("user_table.row_id", ">=", offset)
    .from("user_table");

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
  { params }: { params: ISchemaSignupInput },
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
    user: user.toGqlSchema(),
    token: user.token,
    refreshToken: user.refreshToken as string
  });
}
