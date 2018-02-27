import * as config from "./config";
import { makeExecutableSchema, addMockFunctionsToSchema } from "graphql-tools";

import { schema } from "./schema";
import newServer from "./server";

addMockFunctionsToSchema({ schema, mocks: {} });
const app = newServer(schema);

app.listen(config.port, () => console.log(`Listening on port ${config.port}`));
