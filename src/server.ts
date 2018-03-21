import { GraphQLSchema } from "graphql";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";

import * as Util from "./utils";
import * as Config from "./config";
import * as Core from "./coreSql";
import * as Schema from "./schema";

export type IGraphqlServerOptions = {
  debug?: boolean;
  authenticate: (
    req: express.Request,
    res: express.Response
  ) => Promise<Core.User>;
};

export const appServer = (
  schema: GraphQLSchema,
  opts: IGraphqlServerOptions
): express.Express => {
  const app = express();

  const endpoint = app.use(
    Config.endpoint,
    bodyParser.json(),
    graphqlExpress((req, res) => ({
      schema,
      debug: opts.debug,
      context: {
        user: opts.authenticate(req, res)
      } as Schema.IContext
    }))
  );

  if (!Config.isProduction) {
    app.use("/graphiql", graphiqlExpress({ endpointURL: Config.endpoint }));
  }

  return app;
};

export const appServerWithDefaults = (
  schema: GraphQLSchema
): express.Express => {
  return appServer(schema, {
    debug: !Config.isProduction,
    authenticate: (req, res) =>
      Util.authenticateJWT(req, res, async username =>
        Core.User.fromUsername(username)
      )
  });
};
