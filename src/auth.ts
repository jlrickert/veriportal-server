import { merge } from "lodash";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { SignOptions as ISignOptions } from "jsonwebtoken";
import { Request } from "express";
import * as randToken from "rand-token";

import * as config from "./config";
import { IUser } from "./schema/types";
import { IUsers } from "./models";

export interface IJWTPayload {
  username: string;
  admin: boolean;
}

export async function authenticateJWT(
  req: Request,
  findUser: (username: string) => Promise<IUser>
): Promise<IUser | null> {
  const header = req.headers.authorization || null;
  if (header) {
    const token = header.toString().replace("Bearer ", "");
    try {
      const { username } = verifyToken(token);
      return await findUser(username);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return null;
      }
      throw err;
    }
  }

  return null;
}

export function issueJWT(
  params: { username: string; admin: boolean },
  options?: ISignOptions
): string {
  if (options && options.expiresIn === 0) {
    delete options.expiresIn;
  } else {
    options = merge({ expiresIn: "15m" }, options);
  }
  try {
    return jwt.sign(
      { username: params.username, admin: params.admin },
      config.secretKey,
      options
    );
  } catch (err) {
    throw new Error(`Unable to issue token for ${params.username}: ${err}`);
  }
}

export function verifyToken(token: string): IJWTPayload {
  return jwt.verify(token, config.secretKey) as IJWTPayload;
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function newRefreshToken(): string {
  return randToken.uid(255);
}
