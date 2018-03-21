import { graphql } from "graphql";

import { gqlContext, Users, testDb } from "../setupTest";
import { buildSchema, typeDefs, IContext, IUser } from "../schema";

describe("Graphql schema", () => {
  it("should have context information", async () => {
    const schema = buildSchema({
      typeDefs,
      resolvers: {
        Query: {
          me(root, param, ctx: IContext): Promise<IUser> {
            return ctx.user;
          }
        }
      }
    });

    const user = { id: 1, username: "jlrickert", admin: false };
    const query = `query { me { username admin } }`;
    const gql = gqlContext(schema);
    const res = await gql({ query, user: Promise.resolve(user) });
    const me = res.data.me;
    expect(me.username).toEqual(user.username);
    expect(me.admin).toEqual(user.admin);
  });
});