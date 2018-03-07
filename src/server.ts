import { GraphQLSchema } from "graphql";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";

import { authenticateJWT } from "./auth";
import * as config from "./config";
import { IUser, ISchemaContext } from "./schema";
import { TConnection } from "./connector";
import { SqlUsers, IUsers } from "./models";

export type IGraphqlServerOptions = {
  connector: TConnection;
  authenticate: (
    req: express.Request,
    res: express.Response,
    findUser: (id: number) => Promise<IUser>
  ) => Promise<IUser>;
};

export const appServer = (
  schema: GraphQLSchema,
  opts: IGraphqlServerOptions
): express.Express => {
  const app = express();

  const Users_: IUsers = new SqlUsers(opts.connector);

  const getAuthenticatedUser = async (id: number): Promise<IUser> =>
    await Users_.fetchUserById(id);

  const endpoint = app.use(
    config.endpoint,
    bodyParser.json(),
    graphqlExpress((req, res) => ({
      schema,
      context: {
        user: opts.authenticate(req, res, getAuthenticatedUser),
        Users: Users_
      } as ISchemaContext
    }))
  );

  if (!config.isProduction) {
    app.use("/graphiql", graphiqlExpress({ endpointURL: config.endpoint }));
  }

  return app;
};

export const appServerWithDefaults = (
  schema: GraphQLSchema,
  conn: TConnection
): express.Express => {
  return appServer(schema, {
    connector: conn,
    authenticate: async (req, res) => {
      return authenticateJWT(req, async id => {
        const user = await conn.knex
          .select("*")
          .from("users")
          .where("id", id)
          .first();
        return user as IUser;
      });
    }
  });
};
