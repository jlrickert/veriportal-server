import { IUsers } from "../models";

export interface ISchemaContext {
  user?: Promise<IUser>;
  Users?: IUsers;
}

export interface ISchemaType {
  [name: string]: any;
}

export interface IUser extends ISchemaType {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;
}

export interface IAuthPayload extends ISchemaType {
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
