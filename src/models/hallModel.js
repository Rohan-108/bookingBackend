import mongoose, { Schema } from "mongoose";

const hallSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      min: [3, "Hall name must be at least 3 characters"],
      max: [50, "Hall name must be at most 50 characters"],
      required: [true, "Hall name is required"],
    },
    screenType: {
      type: [
        {
          type: String,
          enum: ["IMAX", "4DX", "2D", "3D"],
        },
      ],
      required: [true, "Screen type is required"],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: [true, "Location type is required"],
      },
      coordinates: {
        type: [Number], //longitude, latitude
        required: [true, "Location coordinates are required"],
      },
    },
    seatingArrangements: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "SeatingArrangement",
        },
      ],
    },
  },
  { timestamps: true }
);

hallSchema.index({ location: "2dsphere" });

const Hall = mongoose.model("Hall", hallSchema);

export default Hall;
