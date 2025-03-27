import { checkSchema } from "express-validator";

export const checkId = checkSchema({
  id: {
    in: ["params"],
    isMongoId: {
      errorMessage: "Invalid id",
    },
  },
});
