import express from "express";
import protect, { isSuperAdmin } from "../middleware/auth.js";
import * as approvalController from "../controllers/approvalController.js";
import * as approvalValidator from "../validators/approvalValidator.js";
const router = express.Router();

router
  .route("/approve/:id")
  .patch(
    protect,
    isSuperAdmin,
    approvalValidator.checkId,
    approvalController.approveApprovalRequest
  );

router
  .route("/reject/:id")
  .patch(
    protect,
    isSuperAdmin,
    approvalValidator.checkId,
    approvalController.rejectApprovalRequest
  );

router.route("/add").post(protect, approvalController.addApprovalRequest);

router.route("/user").get(protect, approvalController.getApprovalByUserId);

router
  .route("/")
  .get(protect, isSuperAdmin, approvalController.getAllApprovalRequests);

export default router;
