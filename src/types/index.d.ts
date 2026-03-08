import "express-serve-static-core";
import { USER_ROLES } from "../enums/user";
type AuthJwtPayload = JwtPayload & {
  _id: string;
  email: string;
  name: string;
  role: USER_ROLES;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthJwtPayload;
  }
}
