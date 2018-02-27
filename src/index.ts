import * as config from "./config";

import { schema } from "./schema";
import newServer from "./server";

const app = newServer(schema);

app.listen(config.port, () => console.log(`Listening on port ${config.port}`));
