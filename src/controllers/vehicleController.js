import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import Vehicle from "../models/vehicleModel.js";
import { validationResult } from "express-validator";

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
      name: req.user?.username,
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
        vehicle,
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
  const { pageNumber = 1, pageSize = 10 } = req.query;
  const { filter = {}, sort = {} } = req.body;
  const finalFilter = { ...filter, show: true };
  const finalSort = { ...sort, createdAt: -1 };
  // Aggregate query to get total count and paginated vehicles
  const [
    {
      total: [total = 0],
      vehicles,
    },
  ] = await Vehicle.aggregate([
    { $match: finalFilter },
    {
      $facet: {
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        vehicles: [
          { $sort: finalSort },
          { $skip: pageSize * (pageNumber - 1) },
          { $limit: pageSize },
        ],
      },
    },
    {
      $project: {
        total: "$total.count",
        vehicles: "$vehicles",
      },
    },
  ]);

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { total, vehicles },
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
        vehicle,
        "Vehicle retrieved successfully"
      )
    );
});

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
