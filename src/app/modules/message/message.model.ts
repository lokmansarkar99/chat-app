// src/app/modules/message/message.model.ts

import { Schema, model } from "mongoose";
import { IMessage } from "./message.interface";

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type:     Schema.Types.ObjectId,
      ref:      "Conversation",
      required: true,
    },
    sender: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    text: {
      type:    String,
      default: "",
    },
    attachment: {
      type:    String,
      default: null,
    },
    isRead: {
      type:    Boolean,
      default: false,
    },
    readAt: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isRead: 1 });

export const Message = model<IMessage>("Message", messageSchema);
