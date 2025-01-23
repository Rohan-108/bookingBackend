import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    role: {
      type: String,
      enum: ["super-admin", "admin"],
      default: "admin",
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    hallId: {
      type: Schema.Types.ObjectId,
      ref: "Hall",
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
