import * as Config from "./config";

import { schema } from "./schema";
import { SqlConnection } from "./connector";
import { appServerWithDefaults } from "./server";

const conn = new SqlConnection(Config.knexConfig);
const app = appServerWithDefaults(schema, conn);

app.listen(Config.port, () => console.log(`Listening on port ${Config.port}`));
