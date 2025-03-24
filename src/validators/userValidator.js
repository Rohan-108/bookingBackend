import { checkSchema } from "express-validator";
import { roles } from "../constants/constants.js";
const strongRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const emailRegex =
  /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

//validator for registering a user
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
    matches: {
      options: emailRegex,
      errorMessage: "Please provide a valid email",
    },
    errorMessage: "Email is required",
  },
  password: {
    in: ["body"],
    isString: true,
    exists: true,
    matches: {
      options: strongRegex,
      errorMessage:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    },
    errorMessage: "Password is required",
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
    isIn: {
      options: [roles],
      errorMessage: `Invalid role. Must be one of ${roles.join(", ")}`,
    },
    isString: true,
    errorMessage: "Invalid role",
    default: "user",
  },
});

//validator for login a user
export const loginValidator = checkSchema({
  email: {
    in: ["body"],
    isEmail: true,
    exists: true,
    matches: {
      options: emailRegex,
      errorMessage: "Please provide a valid email",
    },
    errorMessage: "Email is required",
  },
  password: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Password is required",
  },
});

//validator for changing password
export const changePassword = checkSchema({
  oldPassword: {
    in: ["body"],
    isString: true,
    exists: true,
    errorMessage: "Old password is required",
  },
  newPassword: {
    in: ["body"],
    isString: true,
    exists: true,
    matches: {
      options: strongRegex,
      errorMessage:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.",
    },
    errorMessage: "New password is required",
  },
});

//validator for updating user
export const updateUser = checkSchema({
  username: {
    in: ["body"],
    isString: true,
    optional: true,
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
    optional: true,
    matches: {
      options: emailRegex,
      errorMessage: "Please provide a valid email",
    },
  },
  adhaar: {
    in: ["body"],
    isString: true,
    optional: true,
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
    optional: true,
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
    isIn: {
      options: [roles],
      errorMessage: `Invalid role. Must be one of ${roles.join(", ")}`,
    },
    isString: true,
    optional: true,
  },
});

export const isStrongPassword = (password) => {
  return strongRegex.test(password);
};

export const isEmail = (email) => {
  return emailRegex.test(email);
};
