import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/error.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import { isStrongPassword, isEmail } from "../utils/validators.js";
import jwt from "jsonwebtoken";
import { deleteFile } from "../utils/awsS3.js";
import { HttpStatusCode } from "../constants/httpCode.js";

/**
 * @description Generate access and refresh token
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
//cookie options
const options = {
  httpOnly: true,
  secure: true,
};

/**
 * @description Login user
 * @route POST /api/v1/users/login
 * @access Public
 * @param {Request} req
 * @param {Response} res
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide email and password"
    );
  }
  if (!isEmail(email)) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide a valid email"
    );
  }
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
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", user.refreshToken, options)
    .json(
      new ApiResponse(
        200,
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
  const { email, username, password } = req.body;
  console.log(req.body);
  if (
    [email, username, password].some(
      (field) => field?.trim() === "" || field === null
    )
  ) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide email, username and password"
    );
  }
  if (!isEmail(email)) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide a valid email"
    );
  }
  if (!isStrongPassword(password)) {
    throw new APIError(
      "Bad Request",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
    );
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError(
      "Conflict",
      HttpStatusCode.CONFLICT,
      true,
      "User already exists with this email"
    );
  }
  const avatarUrl = req.file.location;
  const user = await User.create({
    email,
    username,
    password,
    avatar: avatarUrl || "https://picsum.photos/200/300",
  });
  await user.save();
  const { accessToken, refreshToken } = await generateToken(user._id);
  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(201, { user, accessToken }, "User created successfully")
    );
});
/**
 * @description Logout user
 * @route POST /api/v1/users/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * @description Renew access token
 * @route POST /api/v1/users/renewAccessToken
 * @access Private
 * @param {Request} req
 * @param {Response} res
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
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { accessToken }, "Access token renewed successfully")
    );
});

/**
 * @description Change password
 * @route PUT /api/v1/users/changePassword
 * @access Private
 * @param {Request} req
 * @param {Response} res
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new APIError(
      "BAD REQUEST",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide old password and new password"
    );
  }
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
  if (!isStrongPassword(newPassword)) {
    throw new APIError(
      "BAD REQUEST",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
    );
  }
  await User.findByIdAndUpdate(
    req.user._id,
    { password: newPassword },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
 * @description Update username
 * @route PUT /api/v1/users/updateUsername
 * @access Private
 * @param {Request} req
 * @param {Response} res
 */

const updateUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new APIError(
      "BAD REQUEST",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Please provide a username"
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { username },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

/**
 * @description Update avatar
 * @route PUT /api/v1/users/updateAvatar
 * @access Private
 * @param {Request} req
 * @param {Response} res
 */
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarUrl = req.file?.location;
  if (!avatarUrl) {
    throw new APIError(
      "INTERNAL SERVER ERROR",
      HttpStatusCode.INTERNAL_SERVER,
      true,
      "Something went wrong while uploading image"
    );
  }
  //delete old photo
  const oldAvatar = req.user?.avatar;
  const defaultOne = "https://picsum.photos/200/300";
  if (oldAvatar !== defaultOne) {
    await deleteFile(oldAvatar);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatarUrl },
    },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});

export {
  login,
  registerUser,
  logout,
  renewAccessToken,
  changePassword,
  updateUsername,
  updateAvatar,
};
