import { Router } from "express";
import passport from "../../../config/passport";
import config from "../../../config";
import { jwtHelper } from "../../../helpers/jwtHelper";
import sendResponse from "../../../shared/sendResponse";

const router = Router();

// 1️⃣ Google Login Start
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], 
    session: false,              
  })
);

// 2️⃣ Google Callback —  JWT generate 
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false, 
    failureRedirect: `${config.client_url}/login?error=google_auth_failed` 
  }),
  async (req, res) => {
    // req.user verified Google user 
    const user = req.user as any;

    // exact JWT logic 
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = jwtHelper.createToken(
      userData,
      config.jwt.jwt_secret as string,
      config.jwt.jwt_expire_in as string
    );

    const refreshToken = jwtHelper.createToken(
      userData,
      config.jwt.jwt_refresh_secret as string,
      config.jwt.jwt_refresh_expire_in as string
    );

    // Frontend redirect  + tokens 
    const frontendRedirect = `${config.client_url}/auth/google/success?accessToken=${accessToken}`;

    // Refresh token httpOnly cookie তে (secure)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.node_env === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Frontend  redirect
    return res.redirect(frontendRedirect);
  }
);

// 3️⃣ Google login success page (optional)
router.get("/google/success", (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Google login successful",
    data: {
      user: req.user,
    },
  });
});

export const GoogleAuthRoutes = router;
