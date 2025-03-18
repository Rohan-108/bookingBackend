import { Schema, model } from "mongoose";

// Sender schema (embedding the document)
const sender = {
  _id: {
    type: Schema.Types.ObjectId,
    index: true,
    required: [true, "Owner id is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  tel: {
    type: String,
    required: [true, "Tel is required"],
  },
  adhaar: {
    type: String,
    required: [true, "Adhaar is required"],
  },
  avatar: {
    type: String,
    required: [true, "Avatar is required"],
  },
};
const chatSchema = new Schema(
  {
    sender: {
      type: sender,
      required: [true, "Sender is required"],
    },
    message: {
      type: String,
      minLength: [1, "Message is too short"],
      maxLength: [1000, "Message is too long"],
    },
    image: {
      type: String,
      default: null,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation id is required"],
    },
  },
  { timestamps: true }
);

const Chat = model("Chat", chatSchema);
export default Chat;
