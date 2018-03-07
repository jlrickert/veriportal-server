import { merge } from "lodash";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import { Request } from "express";
import * as randToken from "rand-token";

import * as config from "./config";
import { IUser } from "./schema/types";

export const authenticateJWT = async (
  req: Request,
  findUser: (id: number) => Promise<IUser>
): Promise<IUser | null> => {
  const header = req.headers.authorization || null;
  if (header) {
    const token = header.toString().replace("Bearer ", "");
    try {
      const { id } = jwt.verify(token, config.secretKey) as IUser;
      return await findUser(id);
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        return null;
      }
      throw err;
    }
  }

  return null;
};

export const issueJWT = (user: IUser, options?: SignOptions): string => {
  if (options.expiresIn === 0) {
    delete options.expiresIn;
  } else {
    options = merge({ expiresIn: "15m" }, options);
  }
  return jwt.sign(user, config.secretKey, options);
};

export const verifyToken = (token: string): IUser => {
  return jwt.verify(token, config.secretKey) as IUser;
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const newRefreshToken = (): string => {
  return randToken.uid(255);
};
