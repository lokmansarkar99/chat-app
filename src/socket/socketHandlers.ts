// src/socket/socketHandlers.ts

import { Server, Socket } from "socket.io";
import { logger, errorLogger } from "../shared/logger";
import colors from "colors";
import { getSocketId } from "./onlineUsers";
import { MessageService } from "../app/modules/message/message.service";

export const registerHandlers = (io: Server, socket: Socket): void => {
  const userId   = socket.userId;
  const userName = socket.userName;

  // ── join:conversation ────────────────────────────────────────
  socket.on("join:conversation", (conversationId: string) => {
    if (!conversationId) return;
    socket.join(conversationId);
    logger.info(colors.cyan(`🚪 [Room] ${userName} joined → ${conversationId}`));
    socket.emit("room:joined", { conversationId });
  });

  // ── leave:conversation ───────────────────────────────────────
  socket.on("leave:conversation", (conversationId: string) => {
    if (!conversationId) return;
    socket.leave(conversationId);
    logger.info(colors.yellow(`🚪 [Room] ${userName} left → ${conversationId}`));
  });

  // ── message:send ─────────────────────────────────────────────
  // Flow:
  //   1. DB save
  //   2. room emit → message:new (receiver দেখবে)
  //   3. sender-কে delivery status:
  //      receiver online  → message:delivered (✓✓ gray)
  //      receiver offline → message:saved     (✓  gray)
  // ─────────────────────────────────────────────────────────────
  socket.on(
    "message:send",
    async (data: {
      conversationId: string;
      receiverId:     string;
      text:           string;
      attachment?:    string;
      tempId?:        string;
    }) => {
      const { conversationId, receiverId, text, attachment, tempId } = data;

      try {
        if (!conversationId || !receiverId) {
          socket.emit("message:error", {
            tempId,
            message: "conversationId and receiverId are required",
          });
          return;
        }

        if (!text?.trim() && !attachment) {
          socket.emit("message:error", {
            tempId,
            message: "Message must have text or attachment",
          });
          return;
        }

        // ── ✅ Real DB save ──────────────────────────────────────
        const savedMessage = await MessageService.sendMessage(
          conversationId,
          userId,
          text || "",
          attachment
        );

        const messagePayload = {
          ...savedMessage.toObject(),
          tempId,
        };

        // ── Room emit → receiver-এর browser-এ message:new ───────
        // socket.to() — sender বাদে room-এর সবাই পাবে
        // sender নিজের message:new শুনবে না কারণ:
        //   sender ইতোমধ্যে optimistic bubble দেখছে
        //   delivery status আলাদা event-এ পাবে
        socket.to(conversationId).emit("message:new", messagePayload);

        logger.info(
          colors.blue(`💬 [Message] Saved → ${userName} | conv: ${conversationId}`)
        );

        // ── ✅ Delivery status → শুধু sender পাবে ───────────────
        const receiverSocketId = getSocketId(receiverId);

        if (receiverSocketId) {
          // Receiver online → ✓✓ gray (delivered)
          socket.emit("message:delivered", {
            tempId,
            messageId:      savedMessage._id,
            conversationId,
          });

          logger.info(
            colors.green(`✅ [Delivered] → ${receiverId} | conv: ${conversationId}`)
          );
        } else {
          // Receiver offline → ✓ gray (saved, not yet delivered)
          socket.emit("message:saved", {
            tempId,
            messageId:      savedMessage._id,
            conversationId,
          });

          logger.info(
            colors.yellow(`📵 [Saved] Receiver ${receiverId} offline — Phase 5 notification`)
          );
        }
      } catch (error: any) {
        errorLogger.error(`[message:send] ${userName}: ${error.message}`);
        socket.emit("message:error", {
          tempId,
          message: error.message || "Failed to send message",
        });
      }
    }
  );

  // ── typing:start ─────────────────────────────────────────────
  socket.on("typing:start", (conversationId: string) => {
    if (!conversationId) return;
    socket.to(conversationId).emit("typing:indicator", {
      userId,
      userName,
      conversationId,
      isTyping: true,
    });
  });

  // ── typing:stop ──────────────────────────────────────────────
  socket.on("typing:stop", (conversationId: string) => {
    if (!conversationId) return;
    socket.to(conversationId).emit("typing:indicator", {
      userId,
      userName,
      conversationId,
      isTyping: false,
    });
  });

  // ── message:read ─────────────────────────────────────────────
  // Flow:
  //   1. DB update — isRead: true, readAt: now
  //   2. sender-কে read-receipt → ✓✓ blue
  // ─────────────────────────────────────────────────────────────
  socket.on(
    "message:read",
    async (data: { conversationId: string; senderId: string }) => {
      try {
        const { conversationId, senderId } = data;
        if (!conversationId || !senderId) return;

        // ── ✅ Real DB update ────────────────────────────────────
        const modifiedCount = await MessageService.markAsRead(conversationId, userId);

        if (modifiedCount === 0) return; // নতুন কিছু read হয়নি → emit করার দরকার নেই

        // ── Sender online থাকলে read receipt পাঠাও ──────────────
        const senderSocketId = getSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message:read-receipt", {
            conversationId,
            readBy:     userId,
            readByName: userName,
            readAt:     new Date(),
          });

          logger.info(
            colors.green(`✅ [Read] ${userName} read conv: ${conversationId} | notified sender`)
          );
        }
      } catch (error: any) {
        errorLogger.error(`[message:read] ${userName}: ${error.message}`);
      }
    }
  );

  // ── notification:test ────────────────────────────────────────
  socket.on("notification:test", ({ targetUserId }: { targetUserId: string }) => {
    const targetSocketId = getSocketId(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("notification:new", {
        type:    "system",
        message: `Test notification from ${userName}`,
        sentAt:  new Date(),
      });
      logger.info(
        colors.magenta(`🔔 [Notification Test] ${userName} → ${targetUserId}`)
      );
    } else {
      socket.emit("notification:error", {
        message: `User ${targetUserId} is offline`,
      });
    }
  });
};
