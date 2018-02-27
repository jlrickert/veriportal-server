export const resolvers = {
  Query: {
    books(root, params, ctx) {
      return [
        {
          id: 1,
          title: "example title",
          author: ctx.user
        }
      ];
    }
  },
  Mutation: {}
};

export default resolvers;
