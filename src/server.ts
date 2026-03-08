import mongoose from "mongoose";
import http from "http";         
import app from "./app";
import config from "./config";
import { logger, errorLogger } from "./shared/logger";
import colors from "colors";
import seedAdmin from "./DB";
import { initSocket } from "./socket/socket"; 

// ─────────────────────────────────────────────────────────────
// Uncaught Exception Handler — Synchronous Errors
// ─────────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  errorLogger.error(`Uncaught Exception: ${err.message}`);
  logger.info(colors.red("Shutting down the server due to Uncaught Exception"));
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────
// 🆕 httpServer — Socket.IO-এর জন্য http.Server দিয়ে wrap
//    আগে ছিল: server = app.listen(port)
//    এখন:    http.createServer(app) → httpServer
//             Socket.IO httpServer-এ attach হয়
//             একই port-এ HTTP + WebSocket চলে
// ─────────────────────────────────────────────────────────────
let server: http.Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    logger.info(colors.green("Database connected successfully!"));

    seedAdmin();

    const port = Number(config.port);

    // 🆕 Step 1: http.Server তৈরি করো (Express app কে wrap করো)
    const httpServer = http.createServer(app);

    // 🆕 Step 2: Socket.IO initialize করো httpServer-এ attach করে
    //    initSocket() → io = new Server(httpServer) ভেতরে করে
    initSocket(httpServer);

    // 🆕 Step 3: app.listen() নয়, httpServer.listen()
    server = httpServer.listen(port, () => {
      logger.info(colors.green(`Server is running on port ${port}`));
      logger.info(colors.cyan(`Socket.IO is ready on ws://localhost:${port}`)); // 🆕
    });
  } catch (error) {
    errorLogger.error(
      colors.red(`Error starting the server: ${(error as Error).message}`)
    );
  }
}

main();

// ─────────────────────────────────────────────────────────────
// Unhandled Rejection Handler — Asynchronous Errors
// (server variable এখন httpServer — বাকি সব same)
// ─────────────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  if (server) {
    server.close(() => {
      errorLogger.error(`Unhandled Rejection: ${err}`);
      logger.info(
        colors.red("Shutting down the server due to Unhandled Rejection")
      );
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// ─────────────────────────────────────────────────────────────
// SIGINT Handler — Graceful Shutdown
// ─────────────────────────────────────────────────────────────
process.on("SIGINT", () => {
  logger.info(
    colors.yellow("SIGTERM Received. Shutting down the server gracefully...")
  );
  if (server) server.close();
});
