import { IUser, ISchemaContext, IAuthPayload, ISignupInput } from "./schema";
import { Promise } from "bluebird";

export const rootResolver = {
  Query: {
    me: async (root, params, ctx: ISchemaContext): Promise<IUser> => {
      return ctx.user;
    },
    user: async (root, { id }, ctx: ISchemaContext): Promise<IUser> => {
      return ctx.Users.fetchUserById(id);
    },
    users: async (root, params, ctx: ISchemaContext): Promise<IUser[]> => {
      return ctx.Users.fetchUsers();
    }
  },
  Mutation: {
    login: async (
      root,
      { username, password },
      ctx: ISchemaContext
    ): Promise<IAuthPayload> => {
      return ctx.Users.login(username, password);
    },

    signup: async (
      root,
      { params },
      ctx: ISchemaContext
    ): Promise<IAuthPayload> => {
      return ctx.Users.signup(params);
    },

    refreshToken: async (
      root,
      { token },
      ctx: ISchemaContext
    ): Promise<IAuthPayload> => {
      return ctx.Users.refreshToken(token);
    },

    revokeToken: async (root, params, ctx: ISchemaContext): Promise<IUser> => {
      return ctx.Users.revokeTokens(await ctx.user);
    },

    updatePassword: async (
      root,
      { password },
      ctx: ISchemaContext
    ): Promise<IAuthPayload> => {
      if (!ctx.user) {
        throw new Error("Not authorized to change password");
      }
      return ctx.Users.updatePassword(await ctx.user, password);
    }
  },
  User: {}
};
