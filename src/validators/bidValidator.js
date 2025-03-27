import { checkSchema } from "express-validator";
import { MIN_BID_AMOUNT, MAX_BID_AMOUNT } from "../constants/constants.js";

// Bid validation schema for adding the bid
export const addBidValidator = checkSchema({
  carId: {
    in: ["params"],
    isMongoId: true,
    exists: true,
    errorMessage: "Invalid car id",
  },
  amount: {
    in: ["body"],
    exists: true,
    isInt: {
      options: { min: MIN_BID_AMOUNT, max: MAX_BID_AMOUNT },
      errorMessage: "Amount must be greater than 0",
    },
  },
  startDate: {
    in: ["body"],
    isDate: {
      errorMessage: "Start date must be a date",
    },
    exists: true,
    errorMessage: "Start date is required",
  },
  endDate: {
    in: ["body"],
    exists: true,
    isDate: {
      errorMessage: "End date must be a date",
    },
    custom: {
      options: (value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error("End date must be greater than start date");
        }
        return true;
      },
    },
  },
  isOutStation: {
    in: ["body"],
    isBoolean: true,
    exists: true,
    errorMessage: "Is outstation is required",
  },
  tripCompleted: {
    in: ["body"],
    isBoolean: true,
    exists: true,
    errorMessage: "Trip completed is required",
  },
  status: {
    in: ["body"],
    isString: true,
    exists: true,
    isIn: {
      options: [["pending", "approved", "rejected"]],
      errorMessage: "Invalid status",
    },
    errorMessage: "Invalid status",
  },
});

//check the id for the bid
export const checkId = checkSchema({
  id: {
    in: ["params"],
    isMongoId: true,
    errorMessage: "Invalid bid id",
  },
});

//filter bids by status
export const filterBids = checkSchema({
  pageNumber: {
    in: ["query"],
    isInt: {
      errorMessage: "Page number must be an integer",
    },
    optional: true,
  },
  pageSize: {
    in: ["query"],
    isInt: {
      errorMessage: "Page size must be an integer",
    },
    optional: true,
  },
  filter: {
    in: ["query"],
    isJSON: true,
    optional: true,
  },
  sort: {
    in: ["query"],
    isJSON: true,
    optional: true,
  },
});

//validate odometer
export const odometerValidator = checkSchema({
  id: {
    in: ["params"],
    isMongoId: true,
    errorMessage: "Invalid bid id",
  },
  currentOdometer: {
    in: ["body"],
    isInt: {
      errorMessage: "current odometer must be an integer",
    },
    exists: true,
    errorMessage: "current odometer is required",
  },
});
