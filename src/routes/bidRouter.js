import { Router } from "express";
import protect from "../middleware/auth.js";
import * as bidController from "../controllers/bidController.js";
import * as bidValidator from "../validators/bidValidator.js";

const router = Router();

//protected routes
router
  .route("/:carId")
  .post(protect, bidValidator.addBidValidator, bidController.addBid);

router
  .route("/user")
  .get(protect, bidValidator.filterBids, bidController.getAllByUser);
router
  .route("/owner")
  .get(protect, bidValidator.filterBids, bidController.getAllByOwner);

router
  .route("/approve/:id")
  .patch(protect, bidValidator.checkId, bidController.approveBid);
router
  .route("/reject/:id")
  .patch(protect, bidValidator.checkId, bidController.rejectBid);

//public routes
router.route("/bookedDates/:carId").get(bidController.getBookedDates);
export default router;
