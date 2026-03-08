import { USER_ROLES, STATUS } from "../../../enums/user";

import { Model } from "mongoose";
export type IUser = {
  name:string,
  role:USER_ROLES,
  email:string,
  profileImage: string,
  isDeleted: Boolean,
  password: string,
  verified:boolean,
  phone?:string,
  status: STATUS,
  authentication?: {
    isResetPassword: boolean,
    oneTimeCode: number,
    expiredAt: Date
  }
}


export type UserModal = {
  isExistUserById (id: string): any,
  isExistUserByEmail (email: string): any,
  isAccountCreated (id: string): any,
  isMatchPassword(password: string, hashPassword: string): boolean
} & Model<IUser>