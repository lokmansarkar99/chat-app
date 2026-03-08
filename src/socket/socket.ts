import { Server } from "socket.io";
import http from "http";

export let io: Server;

export const initSocket = (httpServer: http.Server): void => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  console.log(" Socket.IO initialized ");

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
   

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
