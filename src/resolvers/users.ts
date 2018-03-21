import { IUser, IContext, IAuthPayload, ISignupInput } from "../schema";

////////////////////////////////////////////////////////////////////////////////
// Query
////////////////////////////////////////////////////////////////////////////////
export async function me(root, params, ctx: IContext): Promise<IUser> {
  return ctx.user;
}

export async function user(root, { id }, ctx: IContext): Promise<IUser> {
  return ctx.Users.fetchUserById(id);
}

export async function users(root, params, ctx: IContext): Promise<IUser[]> {
  return ctx.Users.fetchUsers();
}

////////////////////////////////////////////////////////////////////////////////
// Mutation
////////////////////////////////////////////////////////////////////////////////
export async function login(
  root,
  { username, password },
  ctx: IContext
): Promise<IAuthPayload> {
  return ctx.Users.login(username, password);
}

export async function signup(
  root,
  { params },
  ctx: IContext
): Promise<IAuthPayload> {
  return ctx.Users.signup(params);
}

export async function refreshToken(
  root,
  { token },
  ctx: IContext
): Promise<IAuthPayload> {
  return ctx.Users.refreshToken(token);
}

export async function revokeToken(root, params, ctx: IContext): Promise<IUser> {
  if (!await ctx.user) {
    return ctx.Users.revokeTokens(await ctx.user);
  }
}

export async function updatePassword(
  root,
  { password },
  ctx: IContext
): Promise<IAuthPayload> {
  if (!ctx.user) {
    throw new Error("Not authorized to change password");
  }
  return ctx.Users.updatePassword(await ctx.user, password);
}