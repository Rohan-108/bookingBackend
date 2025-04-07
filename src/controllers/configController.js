import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import Config from "../models/configModel.js";
import { validationResult } from "express-validator";

/**
 * Create a new config
 * @route POST /api/v1/config
 */
const addConfig = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const allConfigs = await Config.find({});
  if (allConfigs.length > 0) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Config already exists"
    );
  }
  const config = await Config.create({ ...req.body });
  await config.save();
  return res
    .status(HttpStatusCode.CREATED)
    .json(
      new ApiResponse(HttpStatusCode.CREATED, {}, "Config created successfully")
    );
});

/**
 * Get the platform config
 * @route GET /api/v1/config
 */
const getConfig = asyncHandler(async (req, res) => {
  const config = await Config.find({});
  if (!config) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Config not found"
    );
  }
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        config[0],
        "Config fetched successfully"
      )
    );
});

/**
 * Update the platform config
 * @route PUT /api/v1/config
 */
const updateConfig = asyncHandler(async (req, res) => {
  const config = await Config.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  if (!config) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Config not found"
    );
  }
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(HttpStatusCode.OK, config, "Config updated successfully")
    );
});

export { addConfig, getConfig, updateConfig };
