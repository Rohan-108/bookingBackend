import redisService from "../services/redisService.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @description Middleware to cache GET requests
 * @param {String} type - Type of key (e.g., vehicle:single)
 */
const cacheMiddleware = (type) =>
  asyncHandler(async (req, res, next) => {
    const key = keyGenerator(req, type);
    if (req.method !== "GET") {
      req.cacheKey = key;
      return next();
    }
    const cachedData = await redisService.get(key);

    if (cachedData) {
      console.log("Cache hit", key);
      return res
        .status(HttpStatusCode.OK)
        .json(
          new ApiResponse(
            HttpStatusCode.OK,
            cachedData,
            "Data fetched successfully"
          )
        );
    }
    req.cacheKey = key;
    next();
  });

function keyGenerator(req, type) {
  switch (type) {
    case "vehicle:single":
      return `vehicle:${req.params.id}`;
    case "vehicle:all":
      return `vehicles:${req.originalUrl}`;
    case "bid:user":
      return `bid:user:${req.user._id}:${req.originalUrl}`;
    default:
      return `${type}:${req.originalUrl}`;
  }
}
export default cacheMiddleware;
