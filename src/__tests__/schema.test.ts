import { graphql } from "graphql";

import { gql, Users, testDb } from "../setupTest";
import { buildSchema, typeDefs, ISchemaContext, IUser } from "../schema";

describe("Graphql schema", () => {
  it("should have context information", async () => {
    const schema = buildSchema({
      typeDefs,
      resolvers: {
        Query: {
          me(root, param, ctx: ISchemaContext): Promise<IUser> {
            return ctx.user;
          }
        }
      }
    });

    const user = { id: 1, username: "jlrickert", admin: false };
    const query = `query { me { id username } }`;
    const res = await gql(schema, query, { user: Promise.resolve(user) });
    const me = res.data.me;
    expect(me.id).toEqual("1");
    expect(me).toContain("username");
    expect(me).toContain("admin");
  });
});
