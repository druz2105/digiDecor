import { Document } from "mongodb";

export interface UserModelInterface extends Document {
  active: boolean;
  createdAt: number;
  email: string;
  firstName?: string;
  lastLogin: number | null;
  lastName?: string;
  password: string;
  username: string;
}

export interface CreateUserInterface {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  username: string;
  [key: string]: any;
}

export interface UpdateUserInterface {
  active?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  username?: string;
  [key: string]: any;
}

export interface CreateJWTTokenInterface {
  _id: string;
  email?: string;
  lastLogin: string;
  password?: string;
  username?: string;
  [key: string]: any;
}

export interface UserLoginInterface {
  email?: string;
  password: string;
  username?: string;
  [key: string]: any;
}
