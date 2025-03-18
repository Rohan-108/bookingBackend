import { Schema, model } from "mongoose";

// userSchema
const userSchema = {
  _id: {
    type: Schema.Types.ObjectId,
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
const approvalSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    user: {
      type: userSchema,
      required: [true, "User is required"],
    },
  },
  { timestamps: true }
);

const Approval = model("Approval", approvalSchema);
export default Approval;
