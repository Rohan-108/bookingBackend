import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import Conversation from "../models/conversationModel.js";
import { validationResult } from "express-validator";
import User from "../models/userModel.js";
import Vehicle from "../models/vehicleModel.js";
import { runInTransaction } from "../utils/runTransactions.js";
import Chat from "../models/chatModel.js";
/**
 * @description Add conversation (given members and car ids)
 * @route POST /api/v1/conversations
 */
const addConversation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { members, carId } = req.body;
  const membersPopulated = [];
  //start the transaction
  await runInTransaction(async (session) => {
    //populate members
    await Promise.all(
      members.map(async (member) => {
        const memberPopulated = await User.findById(member).session(session);
        if (!memberPopulated) {
          throw new APIError(
            "Not Found",
            HttpStatusCode.NOT_FOUND,
            true,
            `Member with id ${member} not found`
          );
        }
        membersPopulated.push({
          _id: memberPopulated._id,
          username: memberPopulated.username,
          email: memberPopulated.email,
          avatar: memberPopulated.avatar,
        });
      })
    );
    //populate car
    const car = await Vehicle.findById(carId).session(session);
    if (!car) {
      throw new APIError(
        "Not Found",
        HttpStatusCode.NOT_FOUND,
        true,
        `vehicle with id ${carId} not found`
      );
    }
    //create conversation with the members and car
    const conversation = new Conversation({
      members: membersPopulated,
      vehicle: {
        _id: car._id,
        name: car.name,
        plateNumber: car.plateNumber,
        rentalPrice: car.rentalPrice,
        seats: car.seats,
        rentalPriceOutStation: car.rentalPriceOutStation,
        ratePerKm: car.ratePerKm,
        fixedKilometer: car.fixedKilometer,
        owner: car.owner,
      },
    });
    await conversation.save({ session });
  });
  res
    .status(HttpStatusCode.CREATED)
    .json(
      new ApiResponse(
        HttpStatusCode.CREATED,
        null,
        "Conversation added successfully"
      )
    );
});

/**
 * @description Get conversation by car id and member id
 * @route GET /api/v1/conversations?carId=carId&memberId=memberId
 */
const getConversation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { carId, memberId } = req.query;
  console.log(carId, memberId);
  const conversation = await Conversation.findOne({
    "members._id": memberId,
    "vehicle._id": carId,
  });
  if (!conversation) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Conversation not found"
    );
  }
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        conversation,
        "Conversation retrieved successfully"
      )
    );
});

/**
 * @description Get all conversations for a given member
 * @route GET /api/v1/conversations/members/:memberId
 */

const getAllConversationsForMember = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { memberId } = req.params;
  const conversations = await Conversation.find({
    "members._id": memberId,
  });
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        conversations,
        "Conversations retrieved successfully"
      )
    );
});

/**
 * @description Delete conversation by id
 * @route DELETE /api/v1/conversations/:conversationId
 */
const deleteConversation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { conversationId } = req.params;
  if (!conversationId) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide conversation id"
    );
  }
  await runInTransaction(async (session) => {
    await Conversation.findByIdAndDelete(conversationId).session(session);
    //TODO delete the images from the S3 bucket also
    await Chat.deleteMany({ conversationId }).session(session);
  });
  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        {},
        "Conversation deleted successfully"
      )
    );
});

export {
  addConversation,
  getConversation,
  getAllConversationsForMember,
  deleteConversation,
};
