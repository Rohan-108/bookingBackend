import mongoose, { Schema } from "mongoose";

const showSchema = new Schema(
  {
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    hallId: {
      type: Schema.Types.ObjectId,
      ref: "Hall",
      required: [true, "Hall is required"],
    },
    screenType: {
      type: String,
      enum: ["IMAX", "4DX", "2D", "3D"],
      required: [true, "Screen type is required"],
    },
    seatingArrangeMentId: {
      type: Schema.Types.ObjectId,
      ref: "SeatingArrangement",
      required: [true, "Seating arrangement is required"],
    },
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);

export default Show;
