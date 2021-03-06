import { merge } from "lodash";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { SignOptions as ISignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import * as randToken from "rand-token";

import * as Config from "../config";
import * as Core from "../coreSql";

export interface IJWTPayload {
  username: string;
  admin: boolean;
}

export async function authenticateJWT(
  req: Request,
  res: Response,
  findUser: (username: string) => Promise<Core.User>
): Promise<Core.User | null> {
  const header = req.headers.authorization || null;
  if (header) {
    const token = header.toString().replace("Bearer ", "");
    try {
      const { username } = verifyToken(token);
      return findUser(username);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return Promise.resolve(null);
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
    const expiresIn = Config.isProduction ? "15m" : "1h";
    options = merge({ expiresIn }, options);
  }
  try {
    return jwt.sign(
      { username: params.username, admin: params.admin },
      Config.secretKey,
      options
    );
  } catch (err) {
    throw new Error(`Unable to issue token for ${params.username}: ${err}`);
  }
}

export function verifyToken(token: string): IJWTPayload {
  return jwt.verify(token, Config.secretKey) as IJWTPayload;
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
