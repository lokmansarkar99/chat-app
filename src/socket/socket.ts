import { Server, Socket } from "socket.io";
import http from "http";
import colors from "colors";
import { jwtHelper } from "../helpers/jwtHelper";
import config from "../config";
import { logger, errorLogger } from "../shared/logger";
import { User } from "../app/modules/user/user.model";
import { STATUS } from "../enums/user";
import {
  addUser,
  removeUser,
  getSocketId,
  getAllOnlineUserIds,
} from "./onlineUsers";

export let io: Server;
export const initSocket = (httpServer: http.Server): void => {

  io = new Server(httpServer, {
    cors: {
      origin: config.client_url || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  logger.info(colors.cyan(" Socket.IO Server initialized"));


  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(
          new Error("Authentication failed: Access token is missing")
        );
      }


      const decoded = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as string
      ) as {
        id: string;
        email: string;
        name: string;
        role: string;
      };

 
      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return next(
          new Error("Authentication failed: User not found")
        );
      }

      if (user.status === STATUS.INACTIVE) {
        return next(
          new Error("Authentication failed: Your account is inactive")
        );
      }

  
      socket.userId    = decoded.id;
      socket.userName  = decoded.name;
      socket.userEmail = decoded.email;
      socket.userRole  = decoded.role;

      logger.info(
        colors.green(
          `🔑 [Socket Auth] Authenticated → user: ${decoded.name} (${decoded.id})`
        )
      );

      next();
    } catch (error: any) {
   
      errorLogger.error(
        `[Socket Auth] JWT verification failed: ${error.message}`
      );

      if (error.name === "TokenExpiredError") {
        return next(new Error("Session expired. Please login again."));
      }

      if (error.name === "JsonWebTokenError") {
        return next(new Error("Invalid token. Please login again."));
      }

      return next(new Error("Authentication failed"));
    }
  });



  io.on("connection", async (socket: Socket) => {
    const userId   = socket.userId;
    const userName = socket.userName;

    logger.info(
      colors.green(
        `🟢 [Socket] Connected → user: ${userName} (${userId}) | socketId: ${socket.id}`
      )
    );


    addUser(userId, socket.id);


    await User.findByIdAndUpdate(userId, { isOnline: true });


    socket.broadcast.emit("user:online", {
      userId,
      userName,
    });

    const currentOnlineIds = getAllOnlineUserIds().filter((id) => id !== userId);
    socket.emit("online:users-list", currentOnlineIds);


    socket.on("join:conversation", (conversationId: string) => {
    
      socket.join(conversationId);
      logger.info(
        colors.cyan(
          `🚪 [Socket] ${userName} joined room → ${conversationId}`
        )
      );
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(conversationId);
      logger.info(
        colors.yellow(
          `🚪 [Socket] ${userName} left room → ${conversationId}`
        )
      );
    });


    socket.on("disconnect", async (reason: string) => {
      logger.info(
        colors.yellow(
          `🔴 [Socket] Disconnected → user: ${userName} (${userId}) | reason: ${reason}`
        )
      );

      removeUser(userId);


      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen,
      });

      socket.broadcast.emit("user:offline", {
        userId,
        userName,
        lastSeen,
      });
    });

  
    socket.on("error", (error: Error) => {
      errorLogger.error(
        `[Socket Error] user: ${userName} (${userId}) → ${error.message}`
      );
    });
  });
};
