import { IUser } from "../schema/types";

export const rootResolver = {
  Query: {
    me: (root, params, ctx) => ctx.user
  },
  Mutation: {
    signup: (_, params: IUser, ctx) => ctx.Users.signup(params)
  }
};
