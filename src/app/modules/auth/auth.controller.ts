import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";

import config from "../../../config";
import { setAuthCookie } from "../../../utils/setCookie";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerToDB(req.body);

  sendResponse(res, {
    success: true,
    message: "User registered successfully",
    statusCode: StatusCodes.CREATED,
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.logintoDB(req.body);

  // only refreshToken in cookie (your pattern)
  setAuthCookie(res, { refreshToken: result.refreshToken });

  sendResponse(res, {
    success: true,
    message: "Login Successful",
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User refresh token successfully",
    data: result, // { accessToken: "..." }
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.node_env === "production",
    sameSite: "lax",
  });

  return sendResponse(res, {
    success: true,
    message: "Logout successful",
    statusCode: StatusCodes.OK,
    data: null,
  });
});

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.sendOtp(req.body);

  return sendResponse(res, {
    success: true,
    message: "OTP sent successfully",
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const userVerify = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.userVerify(req.body);

  return sendResponse(res, {
    success: true,
    message: "User verified successfully",
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPasswordWithOtp(req.body);

  return sendResponse(res, {
    success: true, 
    message: "Password reset successfully",
    statusCode: StatusCodes.OK,
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logout,
  sendOtp,
  userVerify,
  resetPassword,
};
