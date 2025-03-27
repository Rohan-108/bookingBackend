import { Schema, model } from "mongoose";

const configSchema = new Schema(
  {
    transmissionType: {
      type: [String],
      required: [true, "Transmission type is required"],
    },
    fuelType: {
      type: [String],
      required: [true, "Fuel type is required"],
    },
    vehicleType: {
      type: [String],
      required: [true, "Vehicle type is required"],
    },
    cities: {
      type: [String],
      required: [true, "Cities is required"],
    },
    commission: {
      type: Number,
      required: [true, "Commission is required"],
    },
  },
  { timestamps: true }
);

const Config = model("Config", configSchema);

export default Config;
