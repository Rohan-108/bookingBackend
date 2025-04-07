import { checkSchema } from "express-validator";

export const configValidator = checkSchema({
  transmissionType: {
    in: ["body"],
    isArray: true,
    errorMessage: "Transmission type must be an array of strings",
    custom: {
      options: (value) => value.every((item) => typeof item === "string"),
      errorMessage: "Each transmission type must be a string",
    },
  },
  fuelType: {
    in: ["body"],
    isArray: true,
    errorMessage: "Fuel type must be an array of strings",
    custom: {
      options: (value) => value.every((item) => typeof item === "string"),
      errorMessage: "Each fuel type must be a string",
    },
  },
  vehicleType: {
    in: ["body"],
    isArray: true,
    errorMessage: "Vehicle type must be an array of strings",
    custom: {
      options: (value) => value.every((item) => typeof item === "string"),
      errorMessage: "Each vehicle type must be a string",
    },
  },
  cities: {
    in: ["body"],
    isArray: true,
    errorMessage: "Cities must be an array of strings",
    custom: {
      options: (value) => value.every((item) => typeof item === "string"),
      errorMessage: "Each city must be a string",
    },
  },
  commission: {
    in: ["body"],
    isNumeric: true,
    errorMessage: "Commission must be a number",
  },
});
