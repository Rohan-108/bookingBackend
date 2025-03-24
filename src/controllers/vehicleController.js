import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import Vehicle from "../models/vehicleModel.js";
import { validationResult } from "express-validator";
import { Types } from "mongoose";

/**
 * @description Add vehicle to the database
 * @route POST /api/v1/vehicles
 */
const addVehicle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const images = req.files.map((file) => file.location);
  const vehicle = await Vehicle.create({
    ...req.body,
    images: images,
    owner: {
      _id: req.user._id,
      username: req.user?.username,
      email: req.user?.email,
      adhaar: req.user?.adhaar,
      tel: req.user?.tel,
      avatar: req.user?.avatar,
    },
  });
  await vehicle.save();
  res
    .status(HttpStatusCode.CREATED)
    .json(
      new ApiResponse(
        HttpStatusCode.CREATED,
        { vehicle },
        "Vehicle added successfully"
      )
    );
});

/**
 * @description Archive vehicle
 * @route DELETE /api/v1/vehicles/:id
 * @access Private
 * @param {String} id - Vehicle id
 */
const archiveVehicle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Vehicle not found"
    );
  }
  // Check if the user is the owner of the vehicle
  if (vehicle.owner._id !== req.user._id) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "You are not authorized to archive this vehicle"
    );
  }
  vehicle.show = false;
  await vehicle.save();
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        vehicle,
        "Vehicle archived successfully"
      )
    );
});

/**
 * @description Get all vehicles(paginated) and by filters
 * @route GET /api/v1/vehicles?pageNumber=1&pageSize=10
 */
const getVehicles = asyncHandler(async (req, res) => {
  const { pageNumber = 1, pageSize = 10, searchText = "" } = req.query;
  let { filter = {}, sort = {} } = req.query;
  filter = JSON.parse(filter);
  sort = JSON.parse(sort);

  // Remove filters with the value "ALL"
  let minPrice, maxPrice;
  Object.keys(filter).forEach((key) => {
    if (filter[key] === "All") {
      delete filter[key];
    } else if (key === "minPrice") {
      minPrice = filter[key];
      delete filter[key];
    } else if (key === "maxPrice") {
      maxPrice = filter[key];
      delete filter[key];
    }
  });
  console.log(filter, minPrice, maxPrice);
  // Build the final filter object; always ensure that show is true.
  const finalFilter = { ...filter, show: true };

  // Apply rentalPrice range if both minPrice and maxPrice are provided
  if (minPrice !== undefined && maxPrice !== undefined) {
    finalFilter.rentalPrice = { $gte: minPrice, $lte: maxPrice };
  }

  // Apply search text filter for vehicle name if provided
  if (searchText && searchText.length > 0) {
    finalFilter.name = { $regex: searchText, $options: "i" };
  }

  // Convert any filter key ending with _id to ObjectId type
  for (const key in finalFilter) {
    if (key.includes("_id") && typeof finalFilter[key] === "string") {
      finalFilter[key] = new Types.ObjectId(finalFilter[key]);
    }
  }

  // Prepare pagination values
  const pageSizeInt = parseInt(pageSize);
  const pageNumberInt = parseInt(pageNumber);
  // Aggregate query to get total count and paginated vehicles
  const [{ total, vehicles, pages }] = await Vehicle.aggregate([
    { $match: finalFilter },
    {
      $facet: {
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        vehicles: [
          { $sort: { ...sort, createdAt: -1 } },
          { $skip: pageSizeInt * (pageNumberInt - 1) },
          { $limit: pageSizeInt },
        ],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        vehicles: 1,
        pages: {
          $ceil: {
            $divide: [
              { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
              pageSizeInt,
            ],
          },
        },
      },
    },
  ]);

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { total, vehicles, pages },
        "Vehicles retrieved successfully"
      )
    );
});

/**
 * @description Get vehicle by id
 * @route GET /api/v1/vehicles/:id
 */
const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Vehicle not found"
    );
  }
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { vehicle },
        "Vehicle retrieved successfully"
      )
    );
});

/**
 * @description Update vehicle by id
 * @route PATCH /api/v1/vehicles/:id
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Vehicle not found"
    );
  }
  const images = req.files?.map((file) => file.location) || vehicle.images;
  const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, {
    ...req.body,
    images: images,
  });
  await updatedVehicle.save();
  res
    .status(HttpStatusCode.CREATED)
    .json(
      new ApiResponse(
        HttpStatusCode.CREATED,
        updatedVehicle,
        "Vehicle updated successfully"
      )
    );
});

export { addVehicle, archiveVehicle, getVehicles, getVehicle, updateVehicle };
