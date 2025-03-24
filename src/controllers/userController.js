import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { deleteFile } from "../utils/awsS3.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import { validationResult } from "express-validator";
//cookie options
const options = {
  httpOnly: true,
  //secure: true,
};
/**
 * @description Generate access and refresh token
 * @param {String} userId - User id
 */
const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError(
        "Not Found",
        HttpStatusCode.NOT_FOUND,
        true,
        "User not found"
      );
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken ?? "";
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(
      "Internal Server Error",
      HttpStatusCode.INTERNAL_SERVER,
      true,
      "Something went wrong while generating referesh and access token"
    );
  }
};
/**
 * @description Login user
 * @route POST /api/v1/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError(
      "NOT FOUND",
      HttpStatusCode.NOT_FOUND,
      true,
      "User not found"
    );
  }
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Invalid email or password"
    );
  }
  const { accessToken } = await generateToken(user._id);
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(HttpStatusCode.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", user.refreshToken, options)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        {
          user: loggedUser,
          accessToken,
        },
        "User logged In Successfully"
      )
    );
});
/**
 * @description Register user
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    await deleteFile(req.file.location);
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    await deleteFile(req.file.location);
    throw new APIError(
      "Conflict",
      HttpStatusCode.CONFLICT,
      true,
      "User already exists with this email"
    );
  }
  const avatarUrl = req.file.location;
  const user = await User.create({
    ...req.body,
    avatar: avatarUrl || "https://picsum.photos/200/300",
  });
  await user.save();
  const { accessToken, refreshToken } = await generateToken(user._id);
  res
    .status(HttpStatusCode.CREATED)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        HttpStatusCode.CREATED,
        { user, accessToken },
        "User created successfully"
      )
    );
});
/**
 * @description Logout user
 * @route POST /api/v1/users/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  return res
    .status(HttpStatusCode.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(HttpStatusCode.OK, {}, "User logged out successfully")
    );
});

/**
 * @description Renew access token
 * @route POST /api/v1/users/renewAccessToken
 * @access Private
 */
const renewAccessToken = asyncHandler(async (req, res) => {
  const sendedRefereshToken = req.cookies?.refreshToken;
  if (!sendedRefereshToken) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Unauthorized"
    );
  }
  const decodedRefreshToken = jwt.verify(
    sendedRefereshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedRefreshToken._id);
  if (!user) {
    throw new APIError(
      "Unauthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Unauthorized"
    );
  }
  const { accessToken, refreshToken } = await generateToken(user._id);
  return res
    .status(HttpStatusCode.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { accessToken },
        "Access token renewed successfully"
      )
    );
});

/**
 * @description Change password
 * @route PATCH /api/v1/users/changePassword
 * @access Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new APIError(
      "BAD REQUEST",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const { oldPassword, newPassword } = req.body;
  if (oldPassword === newPassword) {
    throw new APIError(
      "BAD REQUEST",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Old password and new password can't be same"
    );
  }
  const isMatch = await req.user.isPasswordCorrect(oldPassword);
  if (!isMatch) {
    throw new APIError(
      "UNAUTHORIZED",
      HttpStatusCode.UNAUTHORIZED,
      true,
      "Invalid old password"
    );
  }
  const user = await User.findById(req.user._id);
  user.password = newPassword;
  await user.save();
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(HttpStatusCode.OK, {}, "Password changed successfully")
    );
});

/**
 * @description Update user
 * @route PATCH /api/v1/users
 * @access Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file?.location) {
      await deleteFile(req.file?.location);
    }
    throw new APIError(
      "BAD REQUEST",
      HttpStatusCode.BAD_REQUEST,
      true,
      errors.array()
    );
  }
  const avatarUrl = req.file?.location || req.user.avatar;
  await deleteFile(req.user.avatar);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...req.body,
      avatar: avatarUrl,
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  return res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(HttpStatusCode.OK, { user }, "User updated successfully")
    );
});

export {
  loginUser,
  registerUser,
  logoutUser,
  renewAccessToken,
  changePassword,
  updateUser,
};
