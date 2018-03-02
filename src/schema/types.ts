export interface IUser {
  id: number;
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
