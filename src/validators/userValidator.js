import { checkSchema } from "express-validator";
import { roles } from "../constants/constants.js";

export const registerValidator = checkSchema({
  username: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Username is required",
    isLength: {
      options: {
        min: 3,
        max: 50,
      },
    },
  },
  email: {
    in: ["body"],
    isEmail: true,
    exists: true,
    errorMessage: "Email is required",
  },
  password: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Password is required",
    isLength: {
      options: {
        min: 8,
      },
    },
  },
  adhaar: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Adhaar is required",
    isLength: {
      options: {
        min: 12,
        max: 12,
      },
    },
  },
  tel: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Tel is required",
    isLength: {
      options: {
        min: 10,
        max: 10,
      },
      errorMessage: "Phone number should be of length 10.",
    },
  },
  role: {
    in: ["body"],
    isIn: roles,
    isString: true,
    errorMessage: "Invalid role",
    default: "user",
  },
});
