import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";

import * as config from "./config";
import { IUser } from "./schema/types";
import { MemConnection, SqlConnection } from "./connector";

import { authenticateJWT } from "./auth";
import { SqlUsers, MemUsers, connectToUsers } from "./models/Users";
import { GraphQLSchema } from "graphql";

export type IGraphqlServerOptions = {
  connector: MemConnection | SqlConnection;
  authenticate: (
    req: express.Request,
    findUser: (id: number) => Promise<IUser>
  ) => Promise<IUser>;
};

export const newGraphqlServer = (
  schema: GraphQLSchema,
  opts: IGraphqlServerOptions = {
    connector: {} as MemConnection,
    authenticate: authenticateJWT
  }
): express.Express => {
  const app = express();

  const Users_ = connectToUsers(opts.connector);

  const getAuthenticatedUser = async (id: number): Promise<IUser> =>
    await Users_.fetchUser(id);

  const endpoint = app.use(
    config.endpoint,
    bodyParser.json(),
    graphqlExpress(req => ({
      schema,
      context: {
        user: opts.authenticate(req, getAuthenticatedUser),
        Users: Users_
      }
    }))
  );

  if (!config.isProduction) {
    app.use("/graphiql", graphiqlExpress({ endpointURL: config.endpoint }));
  }

  return app;
};

export default newGraphqlServer;
