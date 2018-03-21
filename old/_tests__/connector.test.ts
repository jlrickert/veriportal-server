import * as Config from "../config";
import { testDb } from "../setupTest";
import { SqlConnectionOptions } from "../connector";

describe("SqlConnector", () => {
  const fetchTables = db =>
    db.knex
      .select("table_name")
      .from("information_schema.tables")
      .where("table_schema", "public");

  it("should get correct config from the environment", async () => {
    const conf = Config.knexConfig;
    expect(Config.environment).toEqual("test");
    expect(conf.client).toEqual("pg");
    expect(conf.connection["database"]).toContain("test");
  });

  it("should be able to migrate tables", async () => {
    expect((await fetchTables(testDb)).length).toBeGreaterThan(0);
  });

  it("should create user table after migrating", async () => {
    expect(JSON.stringify(await fetchTables(testDb))).toContain("users");
  });
});
