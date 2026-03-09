import express from "express"

import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { ConversationRoutes } from "../modules/conversation/conversation.route";
import { MessageRoutes } from "../modules/message/message.route";

const router = express.Router()

// Auth Routes
router.use("/auth", AuthRoutes)

router.use("/user", UserRoutes)

router.use("/conversation", ConversationRoutes)

router.use("/message", MessageRoutes)


export default router;