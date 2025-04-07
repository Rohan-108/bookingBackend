import express from "express";

import { configValidator } from "../validators/configValidator.js";
import * as configController from "../controllers/configController.js";
import protect, { isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Route to create a new config
router.post(
  "/",
  protect,
  isSuperAdmin,
  configValidator,
  configController.addConfig
);
// Route to get the platform config
router.get("/", configController.getConfig);
// Route to update the platform config
router.put(
  "/",
  protect,
  isSuperAdmin,
  configValidator,
  configController.updateConfig
);

export default router;
