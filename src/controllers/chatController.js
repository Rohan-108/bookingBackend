import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteFile } from "../services/awsS3.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import { validationResult } from "express-validator";
import Chat from "../models/chatModel.js";

/**
 * @description Add chat to the given conversation
 * @route POST /api/v1/chats/:conversationId
 * @access Private
 */
const addChat = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { message } = req.body;
  const { conversationId } = req.params;
  if (!message) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide message"
    );
  }
  if (!conversationId) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide conversation id"
    );
  }
  const chat = new Chat({
    sender: {
      _id: req.user._id,
      name: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
    },
    message,
    conversationId: conversationId,
  });
  await chat.save();
  res.status(201).json(new ApiResponse(201, chat, "Chat added successfully"));
});

/**
 * @description Delete chat by id
 * @route DELETE /api/v1/chats/:chatId
 * @access Private
 */
const deleteChat = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { chatId } = req.params;
  if (!chatId) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide chat id"
    );
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new APIError(
      "Not Found",
      HttpStatusCode.NOT_FOUND,
      true,
      "Chat not found"
    );
  }
  if (chat.image) {
    await deleteFile(chat.image);
  }
  await Chat.findByIdAndDelete(chatId);
  res.status(200).json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

/**
 * @description Get all chats for the given conversation
 * @route GET /api/v1/chats/:conversationId
 * @access Private
 * @param {Request} req
 * @param {Response} res
 */
const getAllChats = asyncHandler(async (req, res) => {
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
  // Fetch all chats for the given conversation & sort them by createdAt
  const chats = await Chat.find({ conversationId }).sort({ createdAt: 1 });
  res
    .status(200)
    .json(new ApiResponse(200, { chats }, "Chats fetched successfully"));
});

/**
 * @description Add image to the given conversation
 * @route POST /api/v1/chats/image/:conversationId
 * @access Private
 */
const addImage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const imageUrl = req.file.location;
  const { conversationId } = req.params;
  if (!imageUrl) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide image"
    );
  }
  if (!conversationId) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide conversation id"
    );
  }
  const chat = new Chat({
    sender: {
      _id: req.user._id,
      name: req.user.username,
      email: req.user.email,
      adhaar: req.user.adhaar,
      tel: req.user.tel,
      avatar: req.user.avatar,
    },
    message: "",
    image: imageUrl,
    conversationId: conversationId,
  });
  await chat.save();
  res
    .status(HttpStatusCode.CREATED)
    .json(
      new ApiResponse(HttpStatusCode.CREATED, chat, "Image added successfully")
    );
});
/**
 * @description Edit chat
 * @route PATCH /api/v1/chats/:chatId
 */
const editChat = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { chatId } = req.params;
  const { message } = req.body;
  await Chat.findByIdAndUpdate(chatId, { message });
  return res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, {}, "Chat updated successfully"));
});

export { addChat, deleteChat, getAllChats, addImage, editChat };
