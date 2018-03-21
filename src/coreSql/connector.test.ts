import "../utils/setupTest";
import * as Config from "../config";
import { sql, Managment } from "./connector";

const tablesQuery = () =>
  sql("information_schema.tables")
    .select("table_name")
    .where("table_schema", "public")
    .clone();

describe("Core sql migrations", () => {
  it("should get correct config from the environment", async () => {
    const conf = Config.knexConfig;
    expect(Config.environment).toEqual("test");
    expect(conf.client).toEqual("pg");
    expect(conf.connection["database"]).toContain("test");
  });

  it("should be able to migrate tables", async () => {
    const tables = await tablesQuery();
    expect(tables.length).toBeGreaterThan(0);
  });

  it("should create user table after migrating", async () => {
    const tables = await tablesQuery();
    expect(JSON.stringify(tables)).toContain("users");
  });
});
