import { IUsers } from "../models";

export interface ISchemaContext {
  user?: Promise<IUser>;
  Users?: IUsers;
}

export interface IGraphQLType {
  [name: string]: any;
}

export interface IUser extends IGraphQLType {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;
}

export interface IAuthPayload extends IGraphQLType {
  user: IUser;
  token: string;
  refreshToken: string;
}
