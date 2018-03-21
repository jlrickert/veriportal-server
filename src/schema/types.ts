import * as Core from "../coreSql";

export interface IContext {
  user: Promise<Core.User>;
}

export interface ISchemaUser {
  username: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;
}

export interface ISchemaAuthPayload {
  user: ISchemaUser;
  token: string;
  refreshToken: string;
}

export interface ISchemaSignupInput {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
