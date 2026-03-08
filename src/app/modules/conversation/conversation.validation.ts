

import { z } from "zod";

const startConversationSchema = z.object({
  body: z.object({
    receiverId: z
      .string()
      .min(1, "Receiver ID cannot be empty"),
  }),
});


const getConversationParamsSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const ConversationValidation = {
  startConversationSchema,
  getConversationParamsSchema,
};
