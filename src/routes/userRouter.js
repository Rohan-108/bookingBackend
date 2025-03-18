import { Router } from "express";
import protect from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import * as userController from "../controllers/userController.js";
import * as userValidator from "../validators/userValidator.js";
const router = Router();

router.route("/login").post(userController.login);
router
  .route("/register")
  .post(
    upload.single("avatar"),
    userValidator.registerValidator,
    userController.registerUser
  );
router.route("/renewAccessToken").post(userController.renewAccessToken);
//protected routes
router.route("/logout").post(protect, userController.logout);
router.route("/changePassword").patch(protect, userController.changePassword);
router.route("/updateUsername").patch(protect, userController.updateUsername);
router
  .route("/updateAvatar")
  .patch(protect, upload.single("avatar"), userController.updateAvatar);
export default router;
