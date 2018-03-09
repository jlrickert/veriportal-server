import { IUsers } from "../models";

export interface ISchemaContext {
  user?: Promise<IUser>;
  Users?: IUsers;
}

export interface ISchemaType {
  [name: string]: any;
}

export class GraphqlModel {
  schema: string[] = [];
  toObject(): Object {
    let data;
    this.schema.forEach(item => {
      data["item"] = this["item"];
    });
    return data;
  }
}

export interface IUser extends ISchemaType {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  admin: boolean;

  refreshToken?: string;
  hash?: string;
  created_at?: any;
  updated_at?: any;
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
