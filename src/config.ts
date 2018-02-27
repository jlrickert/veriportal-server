import * as dotenv from "dotenv";

dotenv.config();

export const port = parseInt(process.env.APP_PORT) || 3001;
export const isProduction = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "testing";
export const endpoint = "/graphql";
export const secretKey = (() => {
  if (isProduction && !process.env.SECRET_KEY) {
    throw new Error("Secret key needs to be set for production");
  }
  return process.env.SECRET_KEY || "devkey";
})();
