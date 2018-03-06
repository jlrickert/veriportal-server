import { graphql } from "graphql";
import { gql, Users, testDb } from "./setupTest";
import { buildSchema, typeDefs } from "./schema";
import { IUser } from "./schema";

const schema = buildSchema(typeDefs, {});

describe("Graphql schema", () => {
  it("should have context information", async () => {
    const schema = buildSchema(typeDefs, {
      Query: {
        me(root, param, ctx): Promise<IUser> {
          return ctx.user;
        }
      }
    });
    const authenticatedUser = await Users.fetchUserById(1);
    const query = `query { me { id username } }`;
    const res = await gql(schema, query, authenticatedUser);
    const me = res.data.me;
    expect(me.id).toEqual(1);
    expect(me).toContain("username");
  });
});
