import express from "express";
import * as chatController from "../controllers/chatController.js";
import * as chatValidator from "../validators/chatValidator.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/multer.js";
const router = express.Router();

//protected routes

router
  .route("/:conversationId")
  .post(protect, chatValidator.addChat, chatController.addChat);

router
  .route("/:chatId")
  .delete(protect, chatValidator.deleteChat, chatController.deleteChat);

router
  .route("/:conversationId")
  .get(protect, chatValidator.getChats, chatController.getAllChats);

router
  .route("/image/:conversationId")
  .post(
    protect,
    upload.single("image"),
    chatValidator.addImage,
    chatController.addImage
  );

router
  .route("/:chatId")
  .patch(protect, chatValidator.editChat, chatController.editChat);

export default router;
