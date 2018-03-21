import * as Core from "../coreSql";

export interface IContext {
  user: Promise<Core.User>;
}

export interface IUser {
  username: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;
}

export interface IAuthPayload {
  user: IUser;
  token: string;
  refreshToken: string;
}

export interface ISignupInput {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
