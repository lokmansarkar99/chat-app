// src/app/modules/message/message.route.ts

import express from "express";
import { checkAuth }         from "../../middlewares/checkAuth";
import validateRequest       from "../../middlewares/validateRequest";
import fileUploadHandler     from "../../middlewares/fileUploadHandler";
import { USER_ROLES }        from "../../../enums/user";
import { MessageController } from "./message.controller";
import { MessageValidation } from "./message.validation";

const router = express.Router();

// POST /api/v1/message
// multipart/form-data: text + optional attachment file
router
  .route("/")
  .post(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    fileUploadHandler(),                                          // ✅ multer
    validateRequest(MessageValidation.sendMessageSchema),
    MessageController.sendMessage
  );

// GET /api/v1/message/:conversationId
router
  .route("/:conversationId")
  .get(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(MessageValidation.getMessagesSchema),
    MessageController.getMessages
  );

// PATCH /api/v1/message/read/:conversationId
router
  .route("/read/:conversationId")
  .patch(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(MessageValidation.markAsReadSchema),
    MessageController.markAsRead
  );

// DELETE /api/v1/message/delete/:id
router
  .route("/delete/:id")
  .delete(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(MessageValidation.deleteMessageSchema),
    MessageController.deleteMessage
  );

export const MessageRoutes = router;
