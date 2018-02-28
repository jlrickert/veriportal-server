import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

export const isProduction: boolean = process.env.NODE_ENV === "production";
export const isTest: boolean = process.env.NODE_ENV === "testing";
export const port: number = parseInt(process.env.APP_PORT) || 3001;
export const endpoint: string = "/graphql";

const isCert = secret => fs.existsSync(secret);
const readCert = path => fs.readFileSync(path).toString();
const parseSecretKey = (key = "devkey") => (isCert(key) ? readCert(key) : key);
const getSecretKey = key => {
  if (isProduction && !key) {
    throw new Error("Secret key needs to be set for production");
  } else if (isTest) {
    return "test secret key";
  }
  return parseSecretKey(key);
};

export const secretKey: string = getSecretKey(process.env.SECRET_KEY);
