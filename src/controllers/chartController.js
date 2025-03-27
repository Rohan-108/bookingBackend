import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import mongoose from "mongoose";
import Vehicle from "../models/vehicleModel.js";
import Bid from "../models/bidModel.js";

/**
 * @description Aggregates booking chart data by a given key for an owner.
 * @route GET /api/v1/charts/bookings/owner?key=yourKey
 */
const getBookingChartDataForOwner = asyncHandler(async (req, res) => {
  const { key, days } = req.query;
  const ownerId = req.user._id;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);
  const result = await Bid.aggregate([
    // Filter by the owner.
    {
      $match: {
        "vehicle.owner._id": new mongoose.Types.ObjectId(ownerId),
        createdAt: {
          $gte: startDate,
          $lte: today,
        },
      },
    },
    // Project only the required fields: status and the dynamic field.
    {
      $project: {
        status: 1,
        [key]: 1,
      },
    },
    // Group by the dynamic key and compute bookings and bids counts.
    {
      $group: {
        _id: "$" + key,
        bookings: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        bids: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "pending"] },
                  { $eq: ["$status", "rejected"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    // Push each grouped result into an array of key-value pairs.
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: { $cond: [{ $eq: ["$_id", null] }, "N/A", "$_id"] },
            v: { bookings: "$bookings", bids: "$bids" },
          },
        },
      },
    },
    // Convert the key-value pairs array into an object.
    {
      $project: {
        _id: 0,
        data: { $arrayToObject: "$data" },
      },
    },
  ]);

  // Retrieve the data object or default to an empty object.
  const data = result[0] ? result[0].data : {};

  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Booking chart data retrieved successfully"
      )
    );
});

/**
 * @description Aggregates booking chart data by a given key for superadmin.
 * @route GET /api/v1/charts/bookings/superAdmin/?key=yourKey
 */
const getBookingChartDataForSuperAdmin = asyncHandler(async (req, res) => {
  const { key, days } = req.query;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);
  // Run aggregation on the Bid model.
  const result = await Bid.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: today,
        },
      },
    },
    // Project only the required fields: status and the dynamic field.
    {
      $project: {
        status: 1,
        [key]: 1,
      },
    },
    // Group by the dynamic key and compute bookings and bids counts.
    {
      $group: {
        _id: "$" + key,
        bookings: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        bids: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$status", "pending"] },
                  { $eq: ["$status", "rejected"] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    //creating key val pair for each group
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: { $cond: [{ $eq: ["$_id", null] }, "N/A", "$_id"] },
            v: { bookings: "$bookings", bids: "$bids" },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: { $arrayToObject: "$data" },
      },
    },
  ]);
  const data = result[0] ? result[0].data : {};

  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Booking chart data retrieved successfully"
      )
    );
});

/**
 * @description Aggregates revenue chart data by a given key for an owner.
 * @route GET /api/v1/charts/revenue/owner?key=yourKey
 * @access Private
 */
const getRevenueChartDataForOwner = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const { key, days } = req.query;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);
  const result = await Bid.aggregate([
    // Filter by owner and approved bids.
    {
      $match: {
        "vehicle.owner._id": new mongoose.Types.ObjectId(ownerId),
        status: "approved",
        createdAt: {
          $gte: startDate,
          $lte: today,
        },
      },
    },
    // Only keep isOutStation, amount, and the dynamic field (provided by key)
    {
      $project: {
        isOutStation: 1,
        amount: 1,
        [key]: 1,
      },
    },
    // Group by the dynamic field and calculate sums
    {
      $group: {
        _id: "$" + key,
        outstation: {
          $sum: {
            $cond: [{ $eq: ["$isOutStation", true] }, "$amount", 0],
          },
        },
        local: {
          $sum: {
            $cond: [{ $eq: ["$isOutStation", false] }, "$amount", 0],
          },
        },
      },
    },
    // Combine the grouped results into a key/value map
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: { $cond: [{ $eq: ["$_id", null] }, "N/A", "$_id"] },
            v: { outstation: "$outstation", local: "$local" },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: { $arrayToObject: "$data" },
      },
    },
  ]);

  const data = result[0] ? result[0].data : {};
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Revenue chart data retrieved successfully"
      )
    );
});

/**
 * @description Aggregates revenue chart data by a given key for superadmin.
 * @route GET /api/v1/charts/revenue/superAdmin?key=yourKey
 * @access Private
 */
const getRevenueChartDataForSuperAdmin = asyncHandler(async (req, res) => {
  const { key, days } = req.query;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);
  const result = await Bid.aggregate([
    // Filter by owner and approved bids.
    {
      $match: {
        status: "approved",
        createdAt: {
          $gte: startDate,
          $lte: today,
        },
      },
    },
    // Only keep isOutStation, amount, and the dynamic field (provided by key)
    {
      $project: {
        isOutStation: 1,
        amount: 1,
        [key]: 1,
      },
    },
    // Group by the dynamic field and calculate sums
    {
      $group: {
        _id: "$" + key,
        outstation: {
          $sum: {
            $cond: [{ $eq: ["$isOutStation", true] }, "$amount", 0],
          },
        },
        local: {
          $sum: {
            $cond: [{ $eq: ["$isOutStation", false] }, "$amount", 0],
          },
        },
      },
    },
    // Combine the grouped results into a key/value map
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: { $cond: [{ $eq: ["$_id", null] }, "N/A", "$_id"] },
            v: { outstation: "$outstation", local: "$local" },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: { $arrayToObject: "$data" },
      },
    },
  ]);

  const data = result[0] ? result[0].data : {};
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Revenue chart data retrieved successfully"
      )
    );
});

/**
 * @description Aggregates car chart data by a given key for superadmin.
 * @route GET /api/v1/charts/cars/superAdmin?key=yourKey
 * @access Private
 */
const getCarChartDataForSuperAdmin = asyncHandler(async (req, res) => {
  const { key } = req.query;
  const result = await Vehicle.aggregate([
    {
      $group: {
        _id: "$" + key,
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: { $cond: [{ $eq: ["$_id", null] }, "N/A", "$_id"] },
            v: "$count",
          },
        },
      },
    },
    {
      $project: {
        data: { $arrayToObject: "$data" },
        _id: 0,
      },
    },
  ]);

  const data = result[0] ? result[0].data : {};

  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Car chart data retrieved successfully"
      )
    );
});

/**
 * @description Aggregates popular vehicle details by no of bids
 * @route GET /api/v1/charts/popular/vehicles
 * @access Private
 */
const getPopularVehicleDetails = asyncHandler(async (req, res) => {
  const result = await Bid.aggregate([
    {
      $facet: {
        popularModel: [
          { $match: { "vehicle.name": { $ne: null } } },
          { $group: { _id: "$vehicle.name", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
        popularVehicleType: [
          { $match: { "vehicle.vehicleType": { $ne: null } } },
          { $group: { _id: "$vehicle.vehicleType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
        popularFuelType: [
          { $match: { "vehicle.fuelType": { $ne: null } } },
          { $group: { _id: "$vehicle.fuelType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
        popularTransmissionType: [
          { $match: { "vehicle.transmission": { $ne: null } } },
          { $group: { _id: "$vehicle.transmission", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
        popularLocation: [
          { $match: { "vehicle.location": { $ne: null } } },
          { $group: { _id: "$vehicle.location", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ],
      },
    },
    {
      $project: {
        popularModel: {
          name: {
            $ifNull: [{ $arrayElemAt: ["$popularModel._id", 0] }, "N/A"],
          },
          count: { $ifNull: [{ $arrayElemAt: ["$popularModel.count", 0] }, 0] },
        },
        popularVehicleType: {
          name: {
            $ifNull: [{ $arrayElemAt: ["$popularVehicleType._id", 0] }, "N/A"],
          },
          count: {
            $ifNull: [{ $arrayElemAt: ["$popularVehicleType.count", 0] }, 0],
          },
        },
        popularFuelType: {
          name: {
            $ifNull: [{ $arrayElemAt: ["$popularFuelType._id", 0] }, "N/A"],
          },
          count: {
            $ifNull: [{ $arrayElemAt: ["$popularFuelType.count", 0] }, 0],
          },
        },
        popularTransmissionType: {
          name: {
            $ifNull: [
              { $arrayElemAt: ["$popularTransmissionType._id", 0] },
              "N/A",
            ],
          },
          count: {
            $ifNull: [
              { $arrayElemAt: ["$popularTransmissionType.count", 0] },
              0,
            ],
          },
        },
        popularLocation: {
          name: {
            $ifNull: [{ $arrayElemAt: ["$popularLocation._id", 0] }, "N/A"],
          },
          count: {
            $ifNull: [{ $arrayElemAt: ["$popularLocation.count", 0] }, 0],
          },
        },
      },
    },
  ]);
  const data = result[0];
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Most revenue making cars retrieved successfully"
      )
    );
});

/**
 * @description Aggregates most revenue making owners
 * @route GET /api/v1/charts/revenue/superAdmin/owners
 * @access Private
 */
const getMostRevenueMakingOwners = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  const result = await Bid.aggregate([
    // Match approved bids within the specified date range.
    {
      $match: {
        status: "approved",
        createdAt: {
          $gte: startDate,
          $lte: today,
        },
      },
    },
    // Group by the vehicle owner's _id while summing up the total revenue and collecting owner details.
    {
      $group: {
        _id: "$vehicle.owner.email",
        totalRevenue: { $sum: "$amount" },
        ownerName: { $first: "$vehicle.owner.username" },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
    {
      $limit: 10,
    },
    {
      $group: {
        _id: null,
        data: {
          $push: {
            k: "$_id",
            v: {
              name: "$ownerName",
              totalRevenue: "$totalRevenue",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        data: { $arrayToObject: "$data" },
      },
    },
  ]);

  // Retrieve the data object or default to an empty object.
  const data = result[0] ? result[0].data : {};

  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Most revenue making owners retrieved successfully"
      )
    );
});

/**
 * @description Aggregates owner average earning against others
 * @route GET /api/v1/charts/owner/average/earning
 * @access Private
 */
const getOwnerAverageEarningAgainstOthers = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const result = await Bid.aggregate([
    {
      $match: {
        status: "approved",
      },
    },
    {
      $facet: {
        ownerEarning: [
          {
            $match: {
              "vehicle.owner._id": new mongoose.Types.ObjectId(ownerId),
            },
          },
          {
            $group: {
              _id: null,
              totalEarning: { $sum: "$amount" },
            },
          },
        ],
        otherOwnersEarning: [
          {
            $match: {
              "vehicle.owner._id": {
                $ne: new mongoose.Types.ObjectId(ownerId),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalEarning: { $avg: "$amount" },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        ownerEarning: {
          $ifNull: [{ $arrayElemAt: ["$ownerEarning.totalEarning", 0] }, 0],
        },
        otherOwnersEarning: {
          $ifNull: [
            { $arrayElemAt: ["$otherOwnersEarning.totalEarning", 0] },
            0,
          ],
        },
      },
    },
  ]);
  const data = result[0];
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        data,
        "Owner average earning against others retrieved successfully"
      )
    );
});

export {
  getBookingChartDataForOwner,
  getRevenueChartDataForOwner,
  getBookingChartDataForSuperAdmin,
  getRevenueChartDataForSuperAdmin,
  getCarChartDataForSuperAdmin,
  getPopularVehicleDetails,
  getMostRevenueMakingOwners,
  getOwnerAverageEarningAgainstOthers,
};
