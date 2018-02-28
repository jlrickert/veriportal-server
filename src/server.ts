import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";

import * as config from "./config";
import { IUser } from "./schema/types";
import { Connector } from "./connector";
import { authenticateJWT } from "./auth";
import Users from "./models/Users";

export interface IGraphqlServerOptions {
  connector: any;
  authenticate: (
    req: express.Request,
    findUser: (id: number) => Promise<IUser>
  ) => Promise<IUser | null>;
}

export const newGraphqlServer = (
  schema,
  opts: IGraphqlServerOptions = {
    connector: new Connector("rawr"),
    authenticate: authenticateJWT
  }
): express.Express => {
  const app = express();

  const Users_ = new Users(opts.connector);
  const getAuthenticatedUser = async (id: number): Promise<IUser> =>
    await Users_.getUser(id);

  const endpoint = app.use(
    config.endpoint,
    bodyParser.json(),
    graphqlExpress(req => {
      return {
        schema,
        context: {
          user: opts.authenticate(req, getAuthenticatedUser),
          Users: Users_
        }
      };
    })
  );

  if (!config.isProduction) {
    app.use("/graphiql", graphiqlExpress({ endpointURL: config.endpoint }));
  }

  return app;
};

export default newGraphqlServer;
