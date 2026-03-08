

import { Server, Socket } from "socket.io";
import { logger, errorLogger } from "../shared/logger";
import colors from "colors";
import { getSocketId } from "./onlineUsers";


export const registerHandlers = (io: Server, socket: Socket): void => {
  const userId   = socket.userId;
  const userName = socket.userName;


  socket.on("join:conversation", (conversationId: string) => {
    if (!conversationId) return;

    socket.join(conversationId);
    logger.info(
      colors.cyan(
        `🚪 [Room] ${userName} joined → room: ${conversationId}`
      )
    );

    // Confirm to client: room-এ join হয়েছো
    socket.emit("room:joined", {
      conversationId,
      message: `Joined conversation ${conversationId}`,
    });
  });


  socket.on("leave:conversation", (conversationId: string) => {
    if (!conversationId) return;

    socket.leave(conversationId);
    logger.info(
      colors.yellow(
        `🚪 [Room] ${userName} left → room: ${conversationId}`
      )
    );
  });


  socket.on(
    "message:send",
    async (data: {
      conversationId: string;
      receiverId: string;
      text: string;
      tempId?: string;
    }) => {
      try {
        const { conversationId, receiverId, text, tempId } = data;

        if (!conversationId || !receiverId || !text?.trim()) {
          socket.emit("message:error", {
            tempId,
            message: "conversationId, receiverId and text are required",
          });
          return;
        }

        logger.info(
          colors.blue(
            `💬 [Message] ${userName} → room: ${conversationId} | text: "${text.slice(0, 30)}"`
          )
        );
        const mockMessage = {
          _id:            `temp_${Date.now()}`,
          conversation:   conversationId,
          sender: {
            _id:          userId,
            name:         userName,
            profileImage: "",
          },
          text,
          isRead:         false,
          createdAt:      new Date(),
          tempId,       
        };


        io.to(conversationId).emit("message:new", mockMessage);

        // ── Receiver online কিনা check ─────────────────────────────
        const receiverSocketId = getSocketId(receiverId);

        if (!receiverSocketId) {
          // Receiver offline → Phase 5-এ Notification save হবে
          logger.info(
            colors.yellow(
              `📵 [Message] Receiver ${receiverId} is offline — notification pending (Phase 5)`
            )
          );
        }
      } catch (error: any) {
        errorLogger.error(
          `[message:send] Error → user: ${userName}: ${error.message}`
        );
        socket.emit("message:error", {
          message: "Failed to send message. Try again.",
        });
      }
    }
  );


  socket.on("typing:start", (conversationId: string) => {
    if (!conversationId) return;

  
    socket.to(conversationId).emit("typing:indicator", {
      userId,
      userName,
      conversationId,
      isTyping: true,
    });
  });



  socket.on("typing:stop", (conversationId: string) => {
    if (!conversationId) return;

    socket.to(conversationId).emit("typing:indicator", {
      userId,
      userName,
      conversationId,
      isTyping: false,
    });
  });

  socket.on(
    "message:read",
    async (data: {
      conversationId: string;
      senderId: string;
    }) => {
      try {
        const { conversationId, senderId } = data;
        if (!conversationId || !senderId) return;

        logger.info(
          colors.green(
            `✅ [Read] ${userName} read messages in room: ${conversationId}`
          )
        );

        const senderSocketId = getSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message:read-receipt", {
            conversationId,
            readBy:   userId,
            readByName: userName,
            readAt:   new Date(),
          });
        }
      } catch (error: any) {
        errorLogger.error(
          `[message:read] Error → user: ${userName}: ${error.message}`
        );
      }
    }
  );


  socket.on("notification:test", ({ targetUserId }: { targetUserId: string }) => {
    const targetSocketId = getSocketId(targetUserId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("notification:new", {
        type:    "system",
        message: `Test notification from ${userName}`,
        sentAt:  new Date(),
      });
      logger.info(
        colors.magenta(
          `🔔 [Notification Test] ${userName} → ${targetUserId}`
        )
      );
    } else {
      socket.emit("notification:error", {
        message: `User ${targetUserId} is offline`,
      });
    }
  });
};
