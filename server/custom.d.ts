import { TUser } from "./src/models/usersModel";
declare global {
   namespace Express {
    export interface Request {
      user?: TUser;
    }
  }

  interface Error {
    code?: number;
    stack?: any;
    name?: string;
    errors?: Error;
    statusCode: number;
    message: string;
    path?: string;
    value?: string;
  }
}

export {};