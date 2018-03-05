import { SqlConnection } from "./connector";
import * as Config from "./config";

export const testDb = new SqlConnection(Config.knexConfig);

beforeAll(async () => {
  await testDb.migrate();
  await testDb.seed();
});

afterAll(async () => {
  await testDb.rollback();
  await testDb.knex.destroy();
});
