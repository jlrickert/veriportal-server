import * as express from "express";

export const newServer = (): express.Express => {
  const app = express();

  app.get("/api/hello", (req, res) => {
    res.send({ express: "Hello World " });
  });
  return app;
};

export default newServer;
