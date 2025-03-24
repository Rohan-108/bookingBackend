import express from "express";

import * as conversationController from "../controllers/conversationController.js";
import protect from "../middleware/auth.js";
import * as conversationValidator from "../validators/conversationValidator.js";

const router = express.Router();

//protected routes

// GET /api/v1/conversations?memberId=123&carId=123
router
  .route("/")
  .get(
    protect,
    conversationValidator.getConversation,
    conversationController.getConversation
  );

router
  .route("/")
  .post(
    protect,
    conversationValidator.addConversation,
    conversationController.addConversation
  );

router
  .route("/:conversationId")
  .delete(
    protect,
    conversationValidator.deleteConversation,
    conversationController.deleteConversation
  );

router
  .route("/members/:memberId")
  .get(
    protect,
    conversationValidator.getAllConversationsForMember,
    conversationController.getAllConversationsForMember
  );

export default router;
