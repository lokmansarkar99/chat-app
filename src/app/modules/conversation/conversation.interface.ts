

import { Types } from "mongoose";

export type IConversation = {
  participants: Types.ObjectId[];     
  lastMessage?: Types.ObjectId;    
  lastMessageAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
