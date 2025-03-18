import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteFile } from "../utils/awsS3.js";
import { HttpStatusCode } from "../types/httpCode.js";
import Chat from "../models/chatModel.js";

/**
 * @description Add chat to the given conversation
 * @route POST /api/v1/chats/:conversationId
 * @access Private
 * @param {Request} req
 * @param {Response} res
 */
const addChat = asyncHandler(async (req, res) => {
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
    sender: req.user,
    message,
    conversationId: conversationId,
  });
  await chat.save();
  res.status(201).json(new ApiResponse(201, chat, "Chat added successfully"));
});

/**
 * @description Delete chat by id
 * @route DELETE /api/v1/chats/:chatId
 */
const deleteChat = asyncHandler(async (req, res) => {
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
    .json(new ApiResponse(200, chats, "Chats fetched successfully"));
});

const addImage = asyncHandler(async (req, res) => {
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
    sender: req.user,
    message: "",
    image: imageUrl,
    conversationId: conversationId,
  });
  await chat.save();
  res.status(201).json(new ApiResponse(201, chat, "Image added successfully"));
});

export { addChat, deleteChat, getAllChats, addImage };
