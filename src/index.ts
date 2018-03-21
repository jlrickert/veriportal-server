import * as Config from "./config";

import { schema } from "./schema";
import { SqlConnection } from "./connector";
import { appServerWithDefaults } from "./server";

const app = appServerWithDefaults(schema);

app.listen(Config.port, () => console.log(`Listening on port ${Config.port}`));
