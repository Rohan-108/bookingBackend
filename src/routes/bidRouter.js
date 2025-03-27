import { Router } from "express";
import protect, { isAdmin } from "../middleware/auth.js";
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
  .get(protect, isAdmin, bidValidator.filterBids, bidController.getAllByOwner);

router
  .route("/approve/:id")
  .patch(protect, isAdmin, bidValidator.checkId, bidController.approveBid);
router
  .route("/reject/:id")
  .patch(protect, isAdmin, bidValidator.checkId, bidController.rejectBid);

router
  .route("/uniqueVehicles")
  .get(protect, isAdmin, bidController.getUniqueVehicles);

router
  .route("/startOdometer/:id")
  .patch(
    protect,
    isAdmin,
    bidValidator.odometerValidator,
    bidController.addStartOdometer
  );
router
  .route("/finalOdometer/:id")
  .patch(
    protect,
    isAdmin,
    bidValidator.odometerValidator,
    bidController.addFinalOdometer
  );
router
  .route("/endTrip/:id")
  .patch(
    protect,
    isAdmin,
    bidValidator.checkId,
    bidController.endTripAndGenerateInvoice
  );
//public routes
router.route("/bookedDates/:carId").get(bidController.getBookedDates);
export default router;
