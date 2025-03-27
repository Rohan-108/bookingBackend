import { checkSchema } from "express-validator";

// Add chat validator
export const addChat = checkSchema({
  message: {
    in: ["body"],
    exists: true,
    isString: {
      errorMessage: "Please provide message",
    },
    errorMessage: "Message should be a string",
  },
  conversationId: {
    in: ["params"],
    exists: true,
    isMongoId: {
      errorMessage: "Please provide conversation id",
    },
    errorMessage: "Conversation id required",
  },
});

// Delete chat validator
export const deleteChat = checkSchema({
  chatId: {
    in: ["params"],
    exists: true,
    isMongoId: {
      errorMessage: "Invalid chat id",
    },
    errorMessage: "Chat id required",
  },
});

// Get all chats validator
export const getChats = checkSchema({
  conversationId: {
    in: ["params"],
    exists: true,
    isMongoId: {
      errorMessage: "Invalid conversation id",
    },
    errorMessage: "Conversation id required",
  },
});

// Add image validator
export const addImage = checkSchema({
  conversationId: {
    in: ["params"],
    exists: true,
    isMongoId: {
      errorMessage: "Invalid conversation id",
    },
    errorMessage: "Conversation id required",
  },
  image: {
    in: ["file"],
    exists: true,
    errorMessage: "Please provide image",
  },
});

// Edit chat validator
export const editChat = checkSchema({
  chatId: {
    in: ["params"],
    exists: true,
    isMongoId: {
      errorMessage: "Invalid chat id",
    },
    errorMessage: "Chat id required",
  },
  message: {
    in: ["body"],
    exists: true,
    isString: {
      errorMessage: "Please provide message",
    },
    errorMessage: "Message should be a string",
  },
});

// Get signed URL validator
export const getSignedUrl = checkSchema({
  key: {
    in: ["query"],
    exists: true,
    isString: {
      errorMessage: "Please provide key",
    },
    errorMessage: "Key should be a string",
  },
  contentType: {
    in: ["query"],
    exists: true,
    isString: {
      errorMessage: "Please provide contentType",
    },
    errorMessage: "contentType should be a string",
  },
});
