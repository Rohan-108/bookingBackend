import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import Bid from "../models/bidModel.js";
import Vehicle from "../models/vehicleModel.js";
import { validationResult } from "express-validator";
import { runInTransaction } from "../utils/runTransactions.js";
import mongoose from "mongoose";
import createTripInvoice from "../services/invoiceGeneratorService.js";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { uploadPdfBufferToS3 } from "../services/awsS3.js";
import getDaysDiff from "../utils/getDaysDiff.js";

// Configure the SQS client (AWS credentials and region can be set via environment variables)
const REGION = process.env.AWS_REGION; // e.g., 'us-west-2'
const queueUrl = `https://sqs.${REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${process.env.SQS_QUEUE_NAME}`;
const sqsClient = new SQSClient({ region: REGION });
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
  const carId = req.params.carId;
  const vehicle = await Vehicle.findById(carId);
  const bid = await Bid.create({
    ...req.body,
    user: {
      _id: req.user._id,
      username: req.user?.username,
      email: req.user?.email,
      adhaar: req.user?.adhaar,
      tel: req.user?.tel,
      avatar: req.user?.avatar,
    },
    vehicle: {
      _id: vehicle._id,
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      rentalPrice: vehicle.rentalPrice,
      seats: vehicle.seats,
      rentalPriceOutStation: vehicle.rentalPriceOutStation,
      ratePerKm: vehicle.ratePerKm,
      fixedKilometer: vehicle.fixedKilometer,
      location: vehicle.location,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      vehicleType: vehicle.vehicleType,
      owner: vehicle.owner,
    },
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
  let { filter = {}, sort = { createdAt: -1 } } = req.query;
  filter = JSON.parse(filter);
  sort = JSON.parse(sort);
  const userId = req.user._id;
  const pageSizeInt = parseInt(pageSize);
  const pageNumberInt = parseInt(pageNumber);
  //aggregate query to get all bids by user
  const [{ total, bids, pages }] = await Bid.aggregate([
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
          { $skip: pageSizeInt * (pageNumberInt - 1) },
          { $limit: pageSizeInt },
        ],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        bids: 1,
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
        { total, bids, pages },
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
  let { filter = {}, sort = { createdAt: -1 } } = req.query;
  filter = JSON.parse(filter);
  sort = JSON.parse(sort);
  if (filter["vehicle._id"]) {
    filter["vehicle._id"] = new mongoose.Types.ObjectId(filter["vehicle._id"]);
  }
  if (filter["startDate"]) {
    filter["startDate"] = { $lte: new Date(filter["startDate"]) };
  }
  const userId = req.user._id;
  const pageNumberInt = parseInt(pageNumber);
  const pageSizeInt = parseInt(pageSize);
  //aggregate query to get all bids by owner
  const [{ total, bids, pages }] = await Bid.aggregate([
    {
      $match: {
        "vehicle.owner._id": new mongoose.Types.ObjectId(userId),
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
          { $skip: pageSizeInt * (pageNumberInt - 1) },
          { $limit: pageSizeInt },
        ],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        bids: 1,
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
        { total, bids, pages },
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
  //check if the user is authorized to reject the bid
  if (bid.vehicle.owner._id.toString() !== req.user._id.toString()) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "You are not authorized to reject this bid"
    );
  }
  //reject the bid
  bid.status = "rejected";
  await bid.save();
  //send email to user
  const params = {
    MessageBody: JSON.stringify({
      email: bid.user.email,
      subject: "Bid Rejection",
      Body: `Your bid for the vehicle ${bid.vehicle.name} from ${bid.startDate} to ${bid.endDate} with amount ${bid.amount} has been rejected`,
    }),
    QueueUrl: queueUrl,
  };
  await sqsClient.send(new SendMessageCommand(params));
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
  //check if the user is the owner of the vehicle
  if (bid.vehicle.owner._id.toString() !== req.user._id.toString()) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "You are not authorized to approve this bid"
    );
  }
  await runInTransaction(async (session) => {
    //approve the bid
    await Bid.findByIdAndUpdate(bidId, { status: "approved" }, { session });
    //reject all other bids that overlap with the approved bid
    await Bid.updateMany(
      {
        startDate: { $lte: bid.endDate }, // Bid starts on or before the provided end
        endDate: { $gte: bid.startDate }, // Bid ends on or after the provided start
        status: "pending",
      },
      { $set: { status: "rejected" } },
      { session }
    );
  });
  //send email to user
  const params = {
    MessageBody: JSON.stringify({
      email: bid.user.email,
      subject: "Bid Approval",
      Body: `Your bid has been approved for the vehicle ${bid.vehicle.name} from ${bid.startDate} to ${bid.endDate} with amount ${bid.amount}`,
    }),
    QueueUrl: queueUrl,
  };
  await sqsClient.send(new SendMessageCommand(params));
  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, bid, "Bid approved successfully"));
});

/**
 * @description Get booked dates for a car
 * @route GET /api/v1/bids/bookedDates/:carId
 */
const getBookedDates = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const carId = req.params.carId;
  const bids = await Bid.find({
    "vehicle._id": carId,
    status: "approved",
  });
  const bookedDates = bids.map((bid) => ({
    startDate: bid.startDate,
    endDate: bid.endDate,
  }));
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { bookedDates },
        "Booked dates retrieved successfully"
      )
    );
});

/**
 * @description Get unique vehicles for given status
 * @route GET /api/v1/bids/uniqueVehicles
 */
const getUniqueVehicles = asyncHandler(async (req, res) => {
  const result = await Bid.aggregate([
    {
      $match: {
        "vehicle.owner._id": new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $project: {
        vehicle: 1,
      },
    },
    {
      $group: {
        _id: "$vehicle._id",
        name: { $first: "$vehicle.name" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
      },
    },
  ]);
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { vehicles: result },
        "Unique vehicles retrieved successfully"
      )
    );
});

/**
 * @description Add start odometer to the bid
 * @route PATCH /api/v1/bids/startOdometer/:id
 */
const addStartOdometer = asyncHandler(async (req, res) => {
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
  const { currentOdometer } = req.body;
  const bid = await Bid.findByIdAndUpdate(
    bidId,
    { startOdometer: currentOdometer },
    { new: true }
  );
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        bid,
        "Start odometer added successfully"
      )
    );
});

/**
 * @description Add final odometer to the bid
 * @route PATCH /api/v1/bids/finalOdometer/:id
 */
const addFinalOdometer = asyncHandler(async (req, res) => {
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
  const { currentOdometer } = req.body;
  const bid = await Bid.findByIdAndUpdate(
    bidId,
    { finalOdometer: currentOdometer },
    { new: true }
  );
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        bid,
        "Final odometer added successfully"
      )
    );
});

/**
 * @description End trip and generate invoice
 * @route PATCH /api/v1/bids/endTrip/:id
 */
const endTripAndGenerateInvoice = asyncHandler(async (req, res) => {
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
  //calculate the total amount
  const tripDetails = {};
  tripDetails.id = bid._id;
  const startDate = bid.startDate.toISOString().split("T")[0];
  const endDate = bid.endDate.toISOString().split("T")[0];
  const noOfDays = getDaysDiff(startDate, endDate);
  tripDetails.startOdometer = bid.startOdometer;
  tripDetails.finalOdometer = bid.finalOdometer;
  tripDetails.fixedKilometer = bid.vehicle.fixedKilometer;
  tripDetails.ratePerKm = bid.vehicle.ratePerKm;
  tripDetails.amount = bid.amount;
  tripDetails.noOfDays = noOfDays;
  tripDetails.startDate = bid.startDate;
  tripDetails.endDate = bid.endDate;
  tripDetails.totalDistance = bid.finalOdometer - bid.startOdometer;
  //calculate extra kilometers
  tripDetails.extraKilometer = Math.max(
    bid.finalOdometer -
      bid.startOdometer -
      bid.vehicle.fixedKilometer * noOfDays,
    0
  );
  //calculate extra amount
  tripDetails.extraAmount = tripDetails.extraKilometer * tripDetails.ratePerKm;
  //calculate total amount
  tripDetails.totalAmount = tripDetails.amount + tripDetails.extraAmount;
  //set car owner, user and vehicle details
  tripDetails.carOwner = bid.vehicle.owner;
  tripDetails.user = bid.user;
  tripDetails.vehicle = bid.vehicle;
  //generate invoice
  const pdfBuffer = await createTripInvoice(tripDetails);
  const key = `invoice-${bid._id}.pdf`;
  //upload invoice to S3
  const location = await uploadPdfBufferToS3(pdfBuffer, key);
  //update invoice location in the bid
  await Bid.updateOne(
    { _id: bid._id },
    { invoice: location, tripCompleted: true, amount: tripDetails.totalAmount }
  );
  //send email to user
  const params = {
    MessageBody: JSON.stringify({
      email: bid.user.email,
      subject: "Bid Approval",
      Body: `Your trip has been completed for the vehicle ${bid.vehicle.name} from ${bid.startDate} to ${bid.endDate}. Please find the invoice attached.
      Invoice Link: ${location}`,
    }),
    QueueUrl: queueUrl,
  };
  await sqsClient.send(new SendMessageCommand(params));
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { location },
        "Trip ended and invoice generated successfully"
      )
    );
});

export {
  addBid,
  getAllByUser,
  getAllByOwner,
  rejectBid,
  approveBid,
  getBookedDates,
  getUniqueVehicles,
  addStartOdometer,
  addFinalOdometer,
  endTripAndGenerateInvoice,
};
