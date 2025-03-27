import express from "express";
import * as chartController from "../controllers/chartController.js";
import protect, { isAdmin, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router
  .route("/bookings/owner")
  .get(protect, isAdmin, chartController.getBookingChartDataForOwner);
router
  .route("/revenue/owner")
  .get(protect, isAdmin, chartController.getRevenueChartDataForOwner);
router
  .route("/bookings/superAdmin")
  .get(protect, isSuperAdmin, chartController.getBookingChartDataForSuperAdmin);
router
  .route("/revenue/superAdmin")
  .get(protect, isSuperAdmin, chartController.getRevenueChartDataForSuperAdmin);
router
  .route("/cars/superAdmin")
  .get(protect, isSuperAdmin, chartController.getCarChartDataForSuperAdmin);
router
  .route("/popular/vehicles")
  .get(protect, isSuperAdmin, chartController.getPopularVehicleDetails);
router
  .route("/revenue/superAdmin/owners")
  .get(protect, isSuperAdmin, chartController.getMostRevenueMakingOwners);
router
  .route("/revenue/owner/average")
  .get(protect, isAdmin, chartController.getOwnerAverageEarningAgainstOthers);
export default router;
