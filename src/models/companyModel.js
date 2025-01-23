import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
  street: {
    type: String,
    trim: true,
    required: [true, "Street is required"],
  },
  city: {
    type: String,
    trim: true,
    required: [true, "City is required"],
  },
  state: {
    type: String,
    trim: true,
    required: [true, "State is required"],
  },
  country: {
    type: String,
    trim: true,
    required: [true, "Country is required"],
  },
  zip: {
    type: String,
    trim: true,
    required: [true, "Zip is required"],
  },
});

const companySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      lowercase: true,
      min: [3, "Company name must be at least 3 characters"],
      max: [50, "Company name must be at most 50 characters"],
      unique: [true, "Company name must be unique"],
      required: [true, "Company name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Company email is required"],
      unique: [true, "Company email must be unique"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Company phone is required"],
      unique: [true, "Company phone must be unique"],
    },
    address: {
      type: addressSchema,
      required: [true, "Company address is required"],
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;
