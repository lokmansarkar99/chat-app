// src/app/modules/message/message.controller.ts

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MessageService } from "./message.service";
import { io } from "../../../socket/socket";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { getSocketId } from "../../../socket/onlineUsers";
import { Conversation } from "../conversation/conversation.model";
import ApiError from "../../../errors/ApiErrors";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId                          = req.user!.id as string;
  const { conversationId, text, tempId } = req.body;

  // ── Attachment: multipart/form-data থেকে path নাও ───────────
  // getSingleFilePath → "/attachments/file.jpg"
  // Frontend: "/api/v1/uploads" + "/attachments/file.jpg"
  const attachment = getSingleFilePath(req.files, "attachment");

  if (!text?.trim() && !attachment) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Message must have text or attachment");
  }

  // ── DB save ───────────────────────────────────────────────────
  const message = await MessageService.sendMessage(
    conversationId,
    senderId,
    text || "",
    attachment
  );

  // ── Socket emit payload ───────────────────────────────────────
  const msgPayload = {
    ...message.toObject(),
    tempId: tempId || null,
  };

  // ── Room emit → receiver দেখবে ────────────────────────────────
  // socket.to() নয়, io.to() — REST controller-এ socket নেই
  // io.to(room) sender সহ সবাইকে পাঠায়
  // কিন্তু sender chat.ejs-এ message:new সরাসরি UI-তে add করে না
  // (sender optimistic bubble ইতোমধ্যে দেখছে)
  io.to(conversationId).emit("message:new", msgPayload);

  // ── Delivery status → শুধু sender পাবে ───────────────────────
  if (tempId) {
    const conv = await Conversation.findById(conversationId).lean();
    const receiverId = conv?.participants
      .find((p) => p.toString() !== senderId)
      ?.toString();

    const senderSocketId   = getSocketId(senderId);
    const receiverSocketId = receiverId ? getSocketId(receiverId) : null;

    if (senderSocketId) {
      if (receiverSocketId) {
        // Receiver online → ✓✓ gray
        io.to(senderSocketId).emit("message:delivered", {
          tempId,
          messageId:      message._id,
          conversationId,
        });
      } else {
        // Receiver offline → ✓ gray
        io.to(senderSocketId).emit("message:saved", {
          tempId,
          messageId:      message._id,
          conversationId,
        });
      }
    }
  }

  sendResponse(res, {
    success:    true,
    statusCode: StatusCodes.CREATED,
    message:    "Message sent successfully",
    data:       msgPayload,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const myId           = req.user!.id as string;
  const conversationId = req.params.conversationId as string;
  const page           = parseInt(req.query.page  as string) || 1;
  const limit          = parseInt(req.query.limit as string) || 30;

  const result = await MessageService.getMessages(conversationId, myId, page, limit);

  sendResponse(res, {
    success:    true,
    statusCode: StatusCodes.OK,
    message:    "Messages fetched successfully",
    data:       result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const myId           = req.user!.id as string;
  const conversationId = req.params.conversationId as string;

  const modifiedCount = await MessageService.markAsRead(conversationId, myId);

  sendResponse(res, {
    success:    true,
    statusCode: StatusCodes.OK,
    message:    `${modifiedCount} messages marked as read`,
    data:       { modifiedCount },
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const myId      = req.user!.id as string;
  const messageId = req.params.id as string;

  const result = await MessageService.deleteMessage(messageId, myId);

  sendResponse(res, {
    success:    true,
    statusCode: StatusCodes.OK,
    message:    "Message deleted successfully",
    data:       result,
  });
});

export const MessageController = {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
};
