

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ConversationService } from "./conversation.service";

const startConversation = catchAsync(async (req: Request, res: Response) => {
  const myId       = req.user!.id as string;
  const { receiverId } = req.body;

  const result = await ConversationService.getOrCreateConversation(
    myId,
    receiverId
  );

  sendResponse(res, {
    success:    true,
    statusCode: StatusCodes.OK,
    message:    "Conversation retrieved successfully",
    data:       result,
  });
});


const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const myId = req.user!.id as string;

  const result = await ConversationService.getMyConversations(myId);

  sendResponse(res, {
    success:    true,
    statusCode: StatusCodes.OK,
    message:    "Conversations fetched successfully",
    data:       result,
  });
});


const getSingleConversation = catchAsync(
  async (req: Request, res: Response) => {
    const myId           = req.user!.id as string;
    const conversationId = req.params.id as string;

    const result = await ConversationService.getSingleConversation(
      conversationId,
      myId
    );

    sendResponse(res, {
      success:    true,
      statusCode: StatusCodes.OK,
      message:    "Conversation fetched successfully",
      data:       result,
    });
  }
);

export const ConversationController = {
  startConversation,
  getMyConversations,
  getSingleConversation,
};
