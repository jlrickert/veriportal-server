import * as dotenv from "dotenv";

import newServer from "./server";

dotenv.config();

console.log(process.env.APP_PORT);

const port = process.env.APP_PORT || 3001;

const app = newServer();

app.listen(port, () => console.log(`Listening on port ${port}`));
