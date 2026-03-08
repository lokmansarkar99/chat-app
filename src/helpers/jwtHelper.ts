
import config from "../config"
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken"
import { User } from "../app/modules/user/user.model"
import ApiError from "../errors/ApiErrors"

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, { expiresIn: expireTime } as SignOptions)
}

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload
}

const createNewAccessTokenWithRefeshToken = async (refreshToken:string) => {
  const verifiedRefreshToken = verifyToken(refreshToken, config.jwt.jwt_refresh_secret as Secret) as JwtPayload
  
  const isUserExist = await User.findOne( {email: verifiedRefreshToken.email})
  if(!isUserExist) {
    throw new ApiError(404, "User not found")
  }

  const newAccessToken = createToken({
    _id: isUserExist._id,
    email: isUserExist.email,
    name: isUserExist.name,
    role: isUserExist.role
  }, config.jwt.jwt_secret as Secret, config.jwt.jwt_expire_in as string)

  return newAccessToken
}


export const jwtHelper = { createToken, verifyToken, createNewAccessTokenWithRefeshToken }
