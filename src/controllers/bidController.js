import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import Bid from "../models/bidModel.js";
import Vehicle from "../models/vehicleModel.js";
import { validationResult } from "express-validator";
import { runInTransaction } from "../utils/runTransactions.js";

/**
 * @description Add bid to the database
 * @route POST /api/v1/bids/:id
 */
const addBid = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const carId = req.params.id;
  const vehicle = await Vehicle.findById(carId);
  const bid = await Bid.create({
    ...req.body,
    user: {
      _id: req.user._id,
      name: req.user?.username,
      email: req.user?.email,
      adhaar: req.user?.adhaar,
      tel: req.user?.tel,
      avatar: req.user?.avatar,
    },
    vehicle: vehicle,
  });
  await bid.save();
  res
    .status(HttpStatusCode.CREATED)
    .json(
      new ApiResponse(HttpStatusCode.CREATED, bid, "Bid added successfully")
    );
});

/**
 * @description Get all bids By User
 * @route GET /api/v1/bids/user
 */
const getAllByUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }

  const { pageNumber = 1, pageSize = 10 } = req.query;
  const { filter = {}, sort = { createdAt: -1 } } = req.query;
  const userId = req.user._id;
  const [
    {
      total: [total = 0],
      bids,
    },
  ] = await Bid.aggregate([
    {
      $match: {
        "user._id": userId,
      },
    },
    {
      $match: filter,
    },
    {
      $facet: {
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        bids: [
          { $sort: sort },
          { $skip: pageSize * (pageNumber - 1) },
          { $limit: pageSize },
        ],
      },
    },
    {
      $project: {
        total: "$total.count",
        bids: "$bids",
      },
    },
  ]);
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { total, bids },
        "Bids retrieved successfully"
      )
    );
});

/**
 * @description Get all bids By Owner
 * @route GET /api/v1/bids/owner
 */
const getAllByOwner = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }

  const { pageNumber = 1, pageSize = 10 } = req.query;
  const { filter = {}, sort = { createdAt: -1 } } = req.body;
  const userId = req.user._id;
  const [
    {
      total: [total = 0],
      bids,
    },
  ] = await Bid.aggregate([
    {
      $match: {
        "vehicle.owner._id": userId,
      },
    },
    {
      $match: filter,
    },
    {
      $facet: {
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        bids: [
          { $sort: sort },
          { $skip: pageSize * (pageNumber - 1) },
          { $limit: pageSize },
        ],
      },
    },
    {
      $project: {
        total: "$total.count",
        bids: "$bids",
      },
    },
  ]);
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { total, bids },
        "Bids retrieved successfully"
      )
    );
});

/**
 * @description Reject bid by Id
 * @route PATCH /api/v1/bids/reject/:id
 */
const rejectBid = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const bidId = req.params.id;
  const bid = await Bid.findById(bidId);
  if (!bid) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Bid not found"
    );
  }
  bid.status = "rejected";
  await bid.save();
  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, bid, "Bid approved successfully"));
});

/**
 * @description Approve bid by Id
 * @route PATCH /api/v1/bids/approve/:id
 */
const approveBid = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const bidId = req.params.id;
  const bid = await Bid.findById(bidId);
  await runInTransaction(async (session) => {
    //approve the bid
    await Bid.findByIdAndUpdate(bidId, { status: "rejected" }, { session });
    //reject all other bids that overlap with the approved bid
    await Bid.updateMany(
      {
        startDate: { $lte: bid.endDate }, // Bid starts on or before the provided end
        endDate: { $gte: bid.startDate }, // Bid ends on or after the provided start
      },
      { $set: { status: "rejected" } },
      { session }
    );
    //TODO: Notify the user that their bid has been rejected and approved
  });
  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, bid, "Bid approved successfully"));
});

export { addBid, getAllByUser, getAllByOwner, rejectBid, approveBid };
