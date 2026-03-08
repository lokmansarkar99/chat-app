
import express from "express";
import { checkAuth }               from "../../middlewares/checkAuth";
import validateRequest             from "../../middlewares/validateRequest";
import { USER_ROLES }              from "../../../enums/user";
import { ConversationController }  from "./conversation.controller";
import { ConversationValidation }  from "./conversation.validation";

const router = express.Router();

router
  .route("/start")
  .post(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(ConversationValidation.startConversationSchema),
    ConversationController.startConversation
  );


router
  .route("/my")
  .get(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    ConversationController.getMyConversations
  );


router
  .route("/:id")
  .get(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    validateRequest(ConversationValidation.getConversationParamsSchema),
    ConversationController.getSingleConversation
  );

export const ConversationRoutes = router;
