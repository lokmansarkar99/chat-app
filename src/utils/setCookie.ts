import { Response } from "express";
import config from "../config";

interface AuthTokens {
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    if(tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: config.node_env === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })
    }
}

