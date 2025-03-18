import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      trim: true,
      max: [20, "username must be less than 20 characters"],
      required: [true, "username is required"],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      max: [50, "email must be less than 50 characters"],
      required: [true, "email is required"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password is required"],
    },
    avatar: {
      type: String, //cloudinary url
      default: "https://picsum.photos/200/300",
    },
    adhaar: {
      type: String,
      trim: true,
      minLength: [12, "Adhaar must be 12 characters"],
      maxLength: [12, "Adhaar must be 12 characters"],
      required: [true, "Adhaar is required"],
    },
    tel: {
      type: String,
      trim: true,
      minLength: [10, "Tel must be 10 characters"],
      maxLength: [10, "Tel must be 10 characters"],
      required: [true, "Tel is required"],
    },
    role: {
      type: String,
      trim: true,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  const match = await bcrypt.compare(enteredPassword, this.password);
  return match;
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
const User = model("User", userSchema);

export default User;
