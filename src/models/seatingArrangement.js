import mongoose, { Schema } from "mongoose";

const seatSchema = new Schema({
  seatNumber: {
    type: Number,
    max: [80, "Seat number must be at most 80"],
    required: [true, "Seat number is required"],
  },
  isCorner: {
    type: Boolean,
    required: [true, "Is corner is required"],
  },
});

const rowSchema = new Schema({
  rowNumber: {
    type: String,
    trim: true,
    lowercase: true,
    max: [1, "Row number must be at most 1 character"],
    required: [true, "Row number is required"],
  },
  rowType: {
    type: String,
    enum: ["Royal", "Club", "Executive"],
    required: [true, "Row type is required"],
  },
  seats: [seatSchema],
});
const seatingArrangementSchema = new Schema(
  {
    hallId: {
      type: Schema.Types.ObjectId,
      ref: "Hall",
      required: [true, "Hall is required"],
    },
    rows: [rowSchema],
  },
  { timestamps: true }
);

const SeatingArrangement = mongoose.model(
  "SeatingArrangement",
  seatingArrangementSchema
);

export default SeatingArrangement;
