import { Schema, model } from "mongoose";

import {
  MIN_SEATS,
  MAX_SEATS,
  MIN_RENTAL_PRICE,
  MAX_RENTAL_PRICE,
  MIN_RENTAL_PERIOD,
  MAX_RENTAL_PERIOD,
  MIN_Fixed_KILOMETER,
  MAX_Fixed_KILOMETER,
  MIN_RATE_PER_KM,
  MAX_RATE_PER_KM,
  transmissionEnum,
  fuelEnum,
  vehicleTypeEnum,
} from "../constants/constants.js";

// Regex for plate number
const PlateNumberRegex =
  /^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/;

// Owner schema (embedding the document)
const ownerSchema = {
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
// Vehicle schema
const vehicleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    plateNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return PlateNumberRegex.test(v);
        },
        message: "Invalid plate number",
      },
      required: [true, "Plate number is required"],
    },
    seats: {
      type: Number,
      min: [MIN_SEATS, "Number of seats must be greater than 0"],
      max: [MAX_SEATS, "Number of seats must be less than 20"],
      required: [true, "Number of seats is required"],
    },
    rentalPrice: {
      type: Number,
      min: [MIN_RENTAL_PRICE, "Rental price must be greater than 0"],
      max: [MAX_RENTAL_PRICE, "Rental price must be less than 100000"],
      required: [true, "Rental price is required"],
    },
    rentalPriceOutStation: {
      type: Number,
      min: [MIN_RENTAL_PRICE, "Rental price must be greater than 0"],
      max: [MAX_RENTAL_PRICE, "Rental price must be less than 100000"],
      required: [true, "Rental price is required"],
    },
    ratePerKm: {
      type: Number,
      min: [MIN_RATE_PER_KM, "Rate per km must be greater than 0"],
      max: [MAX_RATE_PER_KM, "Rate per km must be less than 100"],
      required: [true, "Rate per km is required"],
    },
    show: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [String],
      required: [true, "Images are required"],
    },
    fixedKilometer: {
      type: Number,
      min: [MIN_Fixed_KILOMETER, "Fixed kilometer must be greater than 0"],
      max: [MAX_Fixed_KILOMETER, "Fixed kilometer must be less than 1000"],
      required: [true, "Fixed kilometer is required"],
    },
    transmission: {
      type: String,
      enum: {
        values: transmissionEnum,
        message: "Invalid transmission type",
      },
      required: [true, "Transmission is required"],
    },
    fuelType: {
      type: String,
      enum: {
        values: fuelEnum,
        message: "Invalid fuel type",
      },
      required: [true, "Fuel is required"],
    },
    vehicleType: {
      type: String,
      enum: {
        values: vehicleTypeEnum,
        message: "Invalid vehicle type",
      },
      required: [true, "Vehicle type is required"],
    },
    minRentalPeriod: {
      type: Number,
      min: [MIN_RENTAL_PERIOD, "Minimum rental period must be greater than 0"],
      max: [MAX_RENTAL_PERIOD, "Minimum rental period must be less than 30"],
      required: [true, "Minimum rental period is required"],
    },
    maxRentalPeriod: {
      type: Number,
      min: [MIN_RENTAL_PERIOD, "Maximum rental period must be greater than 0"],
      max: [MAX_RENTAL_PERIOD, "Maximum rental period must be less than 30"],
      validate: {
        validator: function (v) {
          return v >= this.minRentalPeriod;
        },
        message:
          "Maximum rental period must be greater than or equal to minimum rental period",
      },
      required: [true, "Maximum rentable days is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    owner: {
      type: ownerSchema,
      required: [true, "Owner is required"],
    },
  },
  { timestamps: true }
);

const Vehicle = model("Vehicle", vehicleSchema);

export default Vehicle;
