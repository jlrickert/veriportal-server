import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";

import * as config from "./config";

export const newGraphqlServer = (schema): express.Express => {
  const app = express();

  const endpoint = app.use(
    config.endpoint,
    bodyParser.json(),
    graphqlExpress(req => {
      return {
        schema,
        context: {
          user: req.body
        }
      };
    })
  );

  if (!config.isProduction) {
    app.use("/graphiql", graphiqlExpress({ endpointURL: config.endpoint }));
  }

  app.get("/api/hello", (req, res) => {
    res.send({ express: "Hello World " });
  });
  return app;
};

export default newGraphqlServer;
