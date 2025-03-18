import { Schema, model } from "mongoose";

// Member schema (embedding the document)
const memberSchema = {
  _id: {
    type: Schema.Types.ObjectId,
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
// Car schema
const carSchema = {
  _id: {
    type: Schema.Types.ObjectId,
    index: true,
    required: [true, "Car id is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  plateNumber: {
    type: String,
    required: [true, "Plate number is required"],
  },
  rentalPrice: {
    type: Number,
    required: [true, "Rental price is required"],
  },
  seats: {
    type: Number,
    required: [true, "Number of seats is required"],
  },
  rentalPriceOutStation: {
    type: Number,
    required: [true, "Rental price for outstation is required"],
  },
  ratePerKm: {
    type: Number,
    required: [true, "Rate per km is required"],
  },
  fixedKilometer: {
    type: Number,
    required: [true, "Fixed kilometer is required"],
  },
  owner: {
    type: memberSchema,
    required: [true, "Owner is required"],
  },
};
const conversationSchema = new Schema(
  {
    members: {
      type: [memberSchema],
      required: [true, "Members are required"],
    },
    car: {
      type: carSchema,
      required: [true, "Car is required"],
    },
  },
  { timestamps: true }
);

const Conversation = model("Conversation", conversationSchema);

export default Conversation;
