import {
  ISchemaUser,
  IContext,
  ISchemaAuthPayload,
  ISchemaSignupInput
} from "../schema";
import * as UserResolver from "./users";

export type Resolver<T, P = {}> = (
  root: any,
  params: any,
  ctx: IContext,
  next: any
) => Promise<T>;

export function mustBeAuthenticated<T>(resolver: Resolver<T>): Resolver<T> {
  return async (root, params, ctx, next) => {
    if (await ctx.user) {
      return resolver(root, params, ctx, next);
    } else {
      return Promise.reject("Not authenticated");
    }
  };
}

export function mustBeAdmin<T>(resolver: Resolver<T>): Resolver<T> {
  return async (root, params, ctx, next) => {
    const user = await ctx.user;
    if (user.admin) {
      return resolver(root, params, ctx, next);
    } else {
      return Promise.reject("Not authorized");
    }
  };
}

export const rootResolver = {
  Query: {
    me: mustBeAuthenticated(UserResolver.me),
    user: mustBeAuthenticated(UserResolver.me),
    users: mustBeAuthenticated(UserResolver.users)
  },

  Mutation: {
    login: UserResolver.login,
    signup: UserResolver.signup,
    refreshToken: UserResolver.refreshToken,
    revokeToken: mustBeAuthenticated(UserResolver.revokeToken),
    updatePassword: mustBeAuthenticated(UserResolver.updatePassword)
  },
  User: {}
};
