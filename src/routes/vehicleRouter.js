import { Router } from "express";
import protect from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import * as vehicleController from "../controllers/vehicleController.js";
import * as vehicleValidator from "../validators/vehicleValidator.js";
const router = Router();

//protected routes
router
  .route("/")
  .post(
    protect,
    upload.array("images", 3),
    vehicleValidator.addVehicleValidator,
    vehicleController.addVehicle
  );
router
  .route("/:id")
  .delete(
    protect,
    vehicleValidator.archiveVehicleValidator,
    vehicleController.archiveVehicle
  );
router
  .route("/:id")
  .patch(
    protect,
    upload.array("images", 3),
    vehicleValidator.updateVehicleValidator,
    vehicleController.updateVehicle
  );

//public routes
router.route("/").get(vehicleController.getVehicles);
router.route("/:id").get(vehicleController.getVehicle);

export default router;
