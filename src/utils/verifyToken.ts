import jwt, {JwtPayload, Secret} from "jsonwebtoken"

export const verifyToken = (token: string, secret:Secret):JwtPayload => {
    return jwt.verify(token, secret ) as JwtPayload
}
