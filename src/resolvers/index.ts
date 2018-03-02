import { IUser } from "../schema/types";

export const resolvers = {
  Query: {},
  Mutation: {
    signup: (_, params: IUser, ctx) => ctx.Users.signup(params)
  }
};

export default resolvers;
