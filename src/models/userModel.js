import mongoose, { Schema } from "mongoose";
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
      max: [50, "email must be less than 50 characters"],
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    avatar: {
      type: String, //cloudinary url
      default: "https://picsum.photos/200/300",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
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
userSchema.methods.isAdmin = function () {
  return this.adminId ? true : false;
};
const User = mongoose.model("User", userSchema);

export default User;
