// src/app/modules/conversation/conversation.service.ts

import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Conversation } from "./conversation.model";
import { User } from "../user/user.model";

const getOrCreateConversation = async (myId: string, receiverId: string) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Receiver not found");
  }

  if (myId === receiverId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot start a conversation with yourself");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myId, receiverId] },
  })
    .populate("participants", "name email profileImage isOnline lastSeen")
    .populate("lastMessage", "text attachment createdAt sender");  // ✅ restored

  if (conversation) return conversation;

  const newConversation = await Conversation.create({
    participants:  [myId, receiverId],
    lastMessageAt: new Date(),
  });

  const populated = await Conversation.findById(newConversation._id)
    .populate("participants", "name email profileImage isOnline lastSeen")
    .populate("lastMessage", "text attachment createdAt sender");  // ✅ restored

  if (!populated) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create conversation");
  }

  return populated;
};

const getMyConversations = async (myId: string) => {
  return await Conversation.find({ participants: myId })
    .populate("participants", "name email profileImage isOnline lastSeen")
    .populate("lastMessage", "text attachment createdAt sender")   // ✅ restored
    .sort({ lastMessageAt: -1 });
};

const getSingleConversation = async (conversationId: string, myId: string) => {
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "name email profileImage isOnline lastSeen")
    .populate("lastMessage", "text attachment createdAt sender");  // ✅ restored

  if (!conversation) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
  }

  // ✅ (p: any) → participant populate হয়েছে, তাই _id আছে
  const isParticipant = conversation.participants.some(
    (p: any) => p._id.toString() === myId
  );

  if (!isParticipant) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not a participant of this conversation");
  }

  return conversation;
};

export const ConversationService = {
  getOrCreateConversation,
  getMyConversations,
  getSingleConversation,
};
