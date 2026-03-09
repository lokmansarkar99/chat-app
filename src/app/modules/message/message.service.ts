// src/app/modules/message/message.service.ts

import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Message } from "./message.model";
import { Conversation } from "../conversation/conversation.model";

const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string,
  attachment?: string | null
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === senderId
  );
  if (!isParticipant) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not a participant of this conversation");
  }

  // ✅ attachment: undefined পাঠাও, null নয় — schema default: null handle করবে
  const message = await Message.create({
    conversation: conversationId,
    sender:       senderId,
    text:         text?.trim() || "",
    ...(attachment && { attachment }),
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage:   message._id,
    lastMessageAt: new Date(),
  });

  // ✅ Non-null assert — create-এর পরে findById null হওয়ার কথা নয়
  const populated = await Message.findById(message._id)
    .populate("sender", "name email profileImage");

  if (!populated) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to retrieve saved message");
  }

  return populated;  // ✅ এখন type: Document (never নয়)
};

const getMessages = async (
  conversationId: string,
  myId: string,
  page: number = 1,
  limit: number = 30
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === myId
  );
  if (!isParticipant) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not a participant of this conversation");
  }

  const skip  = (page - 1) * limit;
  const total = await Message.countDocuments({ conversation: conversationId });

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name email profileImage")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  return {
    messages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore:    page * limit < total,
    },
  };
};

const markAsRead = async (conversationId: string, myId: string) => {
  const result = await Message.updateMany(
    {
      conversation: conversationId,
      sender:       { $ne: myId },
      isRead:       false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  return result.modifiedCount;
};

const deleteMessage = async (messageId: string, myId: string) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
  }

  if (message.sender.toString() !== myId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own messages");
  }

  await Message.findByIdAndDelete(messageId);

  return { deleted: true };
};

export const MessageService = {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
};
