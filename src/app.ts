import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { StatusCodes } from "http-status-codes";
import path from "path"; 
import { Morgan } from "./shared/morgan";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { globalRateLimiter } from "./app/middlewares/rateLimiter";
import config from "./config";

import passport from "./config/passport";

const app: Application = express();

// ─────────────────────────────────────────────────────────────
// 🆕 EJS View Engine Setup
//    EJS শুধু initial HTML render করবে (login, register, chat pages)
//    Real-time data → Socket.IO client JS handle করবে
// ─────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views")); // src/../views = root/views

// ─────────────────────────────────────────────────────────────
// Logger - Morgan
// ─────────────────────────────────────────────────────────────
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// Rate Limiter
app.use(globalRateLimiter);

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.client_url,
    credentials: true,
  })
);

// Parsers

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// Passport

app.use(passport.initialize());

// ─────────────────────────────────────────────────────────────
// 🆕 Static Files — Browser-side JS/CSS serve করবে
//    public/js/chat.js, public/css/chat.css এখান থেকে serve হবে
//    Browser-এ: <script src="/js/chat.js"> → কাজ করবে
// ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// ─────────────────────────────────────────────────────────────
// Uploads Static
// ─────────────────────────────────────────────────────────────
app.use("/api/v1/uploads", express.static("uploads"));

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Server is running",
  });
});

// ─────────────────────────────────────────────────────────────
// 🆕 EJS Page Routes — API routes-এর আগে রাখতে হবে
//    এগুলো HTML page serve করে, JSON নয়
//    চ্যাট page-এ পরে auth check যোগ করা হবে (Phase 9-এ)
// ─────────────────────────────────────────────────────────────
app.get("/login", (_req: Request, res: Response) => {
  res.render("login");
});

app.get("/register", (_req: Request, res: Response) => {
  res.render("register");
});

app.get("/chat", (_req: Request, res: Response) => {
  // Phase 9-এ এখানে JWT cookie check যোগ হবে
  // এখন সরাসরি render করি development-এর জন্য
  res.render("chat");
});

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use("/api/v1", router);

// ─────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      { path: req.originalUrl, message: "API Doesn't Exist" },
    ],
  });
});

// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
