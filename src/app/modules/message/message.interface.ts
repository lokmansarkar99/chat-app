// src/app/modules/message/message.interface.ts

import { Types } from "mongoose";

export type IMessage = {
  conversation: Types.ObjectId;
  sender:       Types.ObjectId;
  text:         string;
  attachment?:  string | null;  
  isRead:       boolean;
  readAt?:      Date | null;
  createdAt?:   Date;
  updatedAt?:   Date;
};
