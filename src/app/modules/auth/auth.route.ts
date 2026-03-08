import express from "express";

import { AuthController } from "./auth.controller";
import { GoogleAuthRoutes } from "./google-auth.route";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

// ================= AUTH =================
router
  .route("/register")
  .post(
    validateRequest(AuthValidation.createRegisterZodSchema),
    AuthController.registerUser
  );

router
  .route("/login")
  .post(
    validateRequest(AuthValidation.createLoginZodSchema),
    AuthController.loginUser
  );

router
  .route("/refresh-token")
  .post(
    validateRequest(AuthValidation.createRefreshTokenZodSchema),
    AuthController.refreshToken
  );

router
  .route("/logout")
  .post(checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN), AuthController.logout);

// ================= OTP =================
router
  .route("/send-otp")
  .post(
    validateRequest(AuthValidation.createSendOtpZodSchema),
    AuthController.sendOtp
  );

router
  .route("/verify-user")
  .post(
    validateRequest(AuthValidation.createVerifyUserZodSchema),
    AuthController.userVerify
  );

// OTP based password reset
router
  .route("/reset-password")
  .post(
    validateRequest(AuthValidation.createResetPasswordWithOtpZodSchema),
    AuthController.resetPassword
  );

// ================= Google OAuth =================
router.use(GoogleAuthRoutes);

export const AuthRoutes = router;
