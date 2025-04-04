import { Router } from "express";
import protect, { isAdmin } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import * as vehicleController from "../controllers/vehicleController.js";
import * as vehicleValidator from "../validators/vehicleValidator.js";
import cacheMiddleware from "../middleware/cache.js";
const router = Router();

//protected routes
router
  .route("/")
  .post(
    protect,
    isAdmin,
    upload.array("images", 3),
    vehicleValidator.addVehicleValidator,
    vehicleController.addVehicle
  );
router
  .route("/:id")
  .delete(
    protect,
    isAdmin,
    vehicleValidator.archiveVehicleValidator,
    cacheMiddleware("vehicle:single"),
    vehicleController.archiveVehicle
  );
router
  .route("/:id")
  .patch(
    protect,
    isAdmin,
    upload.array("images", 3),
    vehicleValidator.updateVehicleValidator,
    cacheMiddleware("vehicle:single"),
    vehicleController.updateVehicle
  );

//public routes
router
  .route("/")
  .get(cacheMiddleware("vehicle:all"), vehicleController.getVehicles);
router
  .route("/:id")
  .get(cacheMiddleware("vehicle:single"), vehicleController.getVehicle);

export default router;
