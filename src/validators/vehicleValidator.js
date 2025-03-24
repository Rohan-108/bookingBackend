import { checkSchema } from "express-validator";
import {
  MIN_RENTAL_PERIOD,
  MAX_RENTAL_PERIOD,
  MIN_RENTAL_PRICE,
  MAX_RENTAL_PRICE,
  MIN_SEATS,
  MAX_SEATS,
  MIN_Fixed_KILOMETER,
  MAX_Fixed_KILOMETER,
  MIN_RATE_PER_KM,
  MAX_RATE_PER_KM,
  transmissionEnum,
  vehicleTypeEnum,
  fuelEnum,
} from "../constants/constants.js";
/**
 * @description Validate vehicle addition request
 */
export const addVehicleValidator = checkSchema({
  name: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Name is required",
    isLength: {
      options: {
        min: 3,
        max: 50,
      },
    },
  },
  plateNumber: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Plate number is required",
  },
  seats: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_SEATS,
        max: MAX_SEATS,
      },
    },
    exists: true,
    errorMessage: "Number of seats is required",
  },
  rentalPrice: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PRICE,
        max: MAX_RENTAL_PRICE,
      },
    },
    exists: true,
    errorMessage: "Rental price is required",
  },
  rentalPriceOutStation: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PRICE,
        max: MAX_RENTAL_PRICE,
      },
    },
    exists: true,
    errorMessage: "Rental price is required",
  },
  ratePerKm: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RATE_PER_KM,
        max: MAX_RATE_PER_KM,
      },
    },
    exists: true,
    errorMessage: "Rate per km is required",
  },
  fixedKilometer: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_Fixed_KILOMETER,
        max: MAX_Fixed_KILOMETER,
      },
    },
    exists: true,
    errorMessage: "Fixed kilometer is required",
  },
  transmission: {
    in: ["body"],
    isString: true,
    isIn: { options: [transmissionEnum] },
    exists: true,
    errorMessage: "Transmission is required",
  },
  fuelType: {
    in: ["body"],
    isString: true,
    isIn: { options: [fuelEnum] },
    exists: true,
    errorMessage: "Fuel type is required",
  },
  vehicleType: {
    in: ["body"],
    isString: true,
    isIn: { options: [vehicleTypeEnum] },
    exists: true,
    errorMessage: "Vehicle type is required",
  },
  minRentalPeriod: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PERIOD,
        max: MAX_RENTAL_PERIOD,
      },
    },
    exists: true,
    errorMessage: "Minimum rental period is required",
  },
  maxRentalPeriod: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PERIOD,
        max: MAX_RENTAL_PERIOD,
      },
    },
    exists: true,
    errorMessage: "Maximum rental period is required",
  },
  location: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Location is required",
  },
});

/**
 * @description Validate vehicle id and update request
 */
export const updateVehicleValidator = checkSchema({
  id: {
    in: ["params"],
    isMongoId: true,
    exists: true,
    errorMessage: "Vehicle id is required",
  },
  rentalPrice: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PRICE,
        max: MAX_RENTAL_PRICE,
      },
      errorMessage: "Rental price isn't in range",
    },
    exists: true,
    errorMessage: "Rental price is required",
  },
  rentalPriceOutStation: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PRICE,
        max: MAX_RENTAL_PRICE,
      },
      errorMessage: "Rental price isn't in range",
    },
    exists: true,
    errorMessage: "Rental price is required",
  },
  ratePerKm: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RATE_PER_KM,
        max: MAX_RATE_PER_KM,
      },
      errorMessage: "Rate per km isn't in range",
    },
    exists: true,
    errorMessage: "Rate per km is required",
  },
  fixedKilometer: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_Fixed_KILOMETER,
        max: MAX_Fixed_KILOMETER,
      },
    },
    exists: true,
    errorMessage: "Fixed kilometer is required",
  },
  minRentalPeriod: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PERIOD,
        max: MAX_RENTAL_PERIOD,
      },
    },
    exists: true,
    errorMessage: "Minimum rental period is required",
  },
  maxRentalPeriod: {
    in: ["body"],
    isInt: {
      options: {
        min: MIN_RENTAL_PERIOD,
        max: MAX_RENTAL_PERIOD,
      },
    },
    exists: true,
    errorMessage: "Maximum rental period is required",
  },
  location: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Location is required",
  },
});

/**
 * @description Validate vehicle id
 */
export const archiveVehicleValidator = checkSchema({
  id: {
    in: ["params"],
    isMongoId: true,
    exists: true,
    errorMessage: "Vehicle id is required",
  },
});
