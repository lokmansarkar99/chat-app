import express from "express";

const router = express.Router();

import { checkAuth } from "../../middlewares/checkAuth";
import { USER_ROLES } from "../../../enums/user";
import { userController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { UserValidation } from "./user.validation";

router.get(
  "/profile",
  checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
  userController.getMe,
);

router
  .route("/my-profile")
  .get(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    userController.getMyProfile,
  )
  .patch(
    checkAuth(USER_ROLES.USER, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(UserValidation.updateMyProfileSchema),
    userController.updateProfile,
  );


  router.route("/users").get(checkAuth(USER_ROLES.ADMIN), userController.allUsers)

  router.route("/users/:id").patch(checkAuth(USER_ROLES.ADMIN), validateRequest(UserValidation.updateUserStatusSchema), userController.updateUserStatus)

export const UserRoutes = router;
