import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import { validationResult } from "express-validator";
import { runInTransaction } from "../utils/runTransactions.js";
import Approval from "../models/approvalModel.js";
import User from "../models/userModel.js";

/**
 * @description Approve an approval request
 * @route PATCH /api/v1/approvals/approve/:id
 */
const approveApprovalRequest = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Validation Error",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { id } = req.params;
  await runInTransaction(async (session) => {
    const approvalRequest = await Approval.findById(id).session(session);
    if (!approvalRequest) {
      throw new APIError(
        "Approval request not found",
        HttpStatusCode.NOT_FOUND,
        true
      );
    }
    if (approvalRequest.status !== "pending") {
      throw new APIError(
        "Approval request already processed",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Approval request already processed"
      );
    }
    approvalRequest.status = "approved";
    await approvalRequest.save({ session });
    await User.findByIdAndUpdate(approvalRequest.user._id, {
      role: "admin",
    }).session(session);
  });
  const approvalRequest = await Approval.findById(id);
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        approvalRequest,
        "Approval request approved successfully"
      )
    );
});
/**
 * @description Approve an approval request
 * @route PATCH /api/v1/approvals/reject/:id
 */
const rejectApprovalRequest = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Validation Error",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { id } = req.params;
  const approvalRequest = await Approval.findById(id);
  if (!approvalRequest) {
    throw new APIError(
      "Approval request not found",
      HttpStatusCode.NOT_FOUND,
      true
    );
  }
  if (approvalRequest.status === "rejected") {
    throw new APIError(
      "Approval request already processed",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Approval request already processed"
    );
  }
  approvalRequest.status = "rejected";
  await approvalRequest.save();
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        approvalRequest,
        "Approval request approved successfully"
      )
    );
});

/**
 * @description Add an approval request
 * @route POST /api/v1/approvals/add
 */
const addApprovalRequest = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Validation Error",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const approvalRequest = await Approval.create({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      tel: req.user.tel,
      adhaar: req.user.adhaar,
      avatar: req.user.avatar,
    },
    status: "pending",
  });
  await approvalRequest.save();
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        approvalRequest,
        "Approval request added successfully"
      )
    );
});

/**
 * @description Get an approval request by user id
 * @route GET /api/v1/approvals/user
 */
const getApprovalByUserId = asyncHandler(async (req, res) => {
  const approvalRequest = await Approval.findOne({ "user._id": req.user._id });
  if (!approvalRequest) {
    throw new APIError(
      "Approval request not found",
      HttpStatusCode.NOT_FOUND,
      true
    );
  }
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        approvalRequest,
        "Approval request found successfully"
      )
    );
});

/**
 * @description Get all approval requests
 * @route GET /api/v1/approvals?pageNumber=1&pageSize=10&filter={"status":"pending"}&sort={"createdAt":1}
 */
const getAllApprovalRequests = asyncHandler(async (req, res) => {
  let { pageNumber, pageSize } = req.query;
  pageNumber = parseInt(pageNumber) || 1;
  pageSize = parseInt(pageSize) || 10;
  let { filter, sort } = req.query;
  filter = filter ? JSON.parse(filter) : {};
  sort = sort ? JSON.parse(sort) : { createdAt: -1 };

  const [{ total, requests, pages }] = await Approval.aggregate([
    {
      $match: filter,
    },
    {
      $facet: {
        total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        requests: [
          { $sort: sort },
          { $skip: pageSize * (pageNumber - 1) },
          { $limit: pageSize },
        ],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        requests: 1,
        pages: {
          $ceil: {
            $divide: [
              { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
              pageSize,
            ],
          },
        },
      },
    },
  ]);
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { total, requests, pages },
        "Approval requests retrieved successfully"
      )
    );
});
export {
  approveApprovalRequest,
  rejectApprovalRequest,
  addApprovalRequest,
  getApprovalByUserId,
  getAllApprovalRequests,
};
