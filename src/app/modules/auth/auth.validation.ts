import { z } from "zod";
import { USER_ROLES } from "../../../enums/user";

const createRegisterZodSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum([USER_ROLES.ADMIN, USER_ROLES.USER]).default(USER_ROLES.USER),
    profileImage: z.string().optional(),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address"),
    password: z
      .string({ message: "Password is required" })
      .min(8, "Password must be at least 8 characters long"),
  }),
});

const createRefreshTokenZodSchema = z.object({
  body: z.object({
    refreshToken: z.string({ message: "Refresh token is required" }),
  }),
});

const createSendOtpZodSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email"),
    // verify user OTP vs reset password OTP
    isResetPassword: z.boolean().optional().default(false),
  }),
});

const createVerifyUserZodSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email"),
    otp: z.union([z.string(), z.number()]),
  }),
});

// OTP based reset password (your current pattern)
const createResetPasswordWithOtpZodSchema = z.object({
  body: z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email"),
    otp: z.union([z.string(), z.number()]),
    password: z
      .string({ message: "Password is required" })
      .min(8, "Password must be at least 8 characters long"),
  }),
});

export const AuthValidation = {
  createRegisterZodSchema,
  createLoginZodSchema,
  createRefreshTokenZodSchema,
  createSendOtpZodSchema,
  createVerifyUserZodSchema,
  createResetPasswordWithOtpZodSchema,
};

// Payload types (same pattern you used)
export type RegisterPayload = z.infer<typeof createRegisterZodSchema>["body"];
export type LoginPayload = z.infer<typeof createLoginZodSchema>["body"];
export type RefreshTokenPayload = z.infer<typeof createRefreshTokenZodSchema>["body"];
export type SendOtpPayload = z.infer<typeof createSendOtpZodSchema>["body"];
export type VerifyUserPayload = z.infer<typeof createVerifyUserZodSchema>["body"];
export type ResetPasswordWithOtpPayload =  z.infer<typeof createResetPasswordWithOtpZodSchema>["body"];
