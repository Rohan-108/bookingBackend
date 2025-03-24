import { checkSchema } from "express-validator";

// Add conversation schema validator
export const addConversation = checkSchema({
  members: {
    in: ["body"],
    isArray: {
      options: {
        min: 2,
        max: 2,
      },
      errorMessage: "Members must be an array",
    },
    errorMessage: "Members are required",
  },
  carId: {
    in: ["body"],
    isMongoId: {
      errorMessage: "Invalid car id",
    },
    errorMessage: "Car id is required",
  },
});

// Get conversation schema validator
export const getConversation = checkSchema({
  memberId: {
    in: ["query"],
    isMongoId: {
      errorMessage: "Invalid member id",
    },
    errorMessage: "Member id is required",
  },
  carId: {
    in: ["query"],
    isMongoId: {
      errorMessage: "Invalid car id",
    },
    errorMessage: "Car id is required",
  },
});

// Delete conversation schema validator
export const deleteConversation = checkSchema({
  conversationId: {
    in: ["params"],
    isMongoId: {
      errorMessage: "Invalid conversation id",
    },
    errorMessage: "Conversation id is required",
  },
});

// Get all conversations for a given member schema validator
export const getAllConversationsForMember = checkSchema({
  memberId: {
    in: ["params"],
    isMongoId: {
      errorMessage: "Invalid member id",
    },
    errorMessage: "Member id is required",
  },
});
