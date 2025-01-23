import { Router } from "express";
import protect from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  login,
  registerUser,
  logout,
  renewAccessToken,
  changePassword,
  updateAvatar,
  updateUsername,
} from "../controllers/userController.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/renewAccessToken").post(renewAccessToken);
//protected routes
router.route("/logout").post(protect, logout);
router.route("/changePassword").patch(protect, changePassword);
router.route("/updateUsername").patch(protect, updateUsername);
router
  .route("/updateAvatar")
  .patch(protect, upload.single("avatar"), updateAvatar);
export default router;
