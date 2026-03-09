
// src/app/modules/message/message.validation.ts

import { z } from "zod";


const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string(),
    text: z
      .string()
      .max(5000, "Message too long")
      .optional()
  }),
});

const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
  query: z.object({
    page:  z.string().optional().default("1"),
    limit: z.string().optional().default("30"),
  }),
});

const markAsReadSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
});

const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const MessageValidation = {
  sendMessageSchema,
  getMessagesSchema,
  markAsReadSchema,
  deleteMessageSchema,
};
