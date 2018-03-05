import * as fs from "fs";
import * as dotenv from "dotenv";
import { KnexConfig } from "./connector";

dotenv.config();

export const environment: string = process.env.NODE_ENV || "development";
export const isProduction: boolean = environment === "production";
export const isTest: boolean = environment === "test";
export const port: number = parseInt(process.env.APP_PORT) || 3001;
export const endpoint: string = "/graphql";

const isACertificate = secret => fs.existsSync(secret);
const readCertificate = path => fs.readFileSync(path).toString();
const parseSecretKey = (key = "devkey") =>
  isACertificate(key) ? readCertificate(key) : key;
const getSecretKey = key => {
  if (isProduction && !key) {
    throw new Error("Secret key needs to be set for production");
  } else if (isTest) {
    return "test secret key";
  }
  return parseSecretKey(key);
};

export const secretKey: string = getSecretKey(process.env.SECRET_KEY);

export const knexConfig: KnexConfig = require("../knexfile")[environment];
