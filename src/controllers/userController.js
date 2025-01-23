import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import { isStrongPassword, isEmail } from "../utils/validators.js";
import jwt from "jsonwebtoken";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
      error
    );
  }
};
const options = {
  httpOnly: true,
  secure: true,
};

//login controller
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }
  if (!isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User not found");
  }
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
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
//register controller
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  if (!isEmail(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }
  if (!isStrongPassword(password)) {
    throw new ApiError(
      400,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
    );
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }
  const avatar = req.file?.path;
  let avatarUrl;
  if (avatar) {
    avatarUrl = await uploadImage(avatar);
    if (!avatarUrl.url) {
      throw new ApiError(500, "Something went wrong while uploading image");
    }
  }
  const user = await User.create({
    email,
    username,
    password,
    avatar: avatarUrl?.url || "https://picsum.photos/200/300",
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

//logout controller

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

//renew access token

const renewAccessToken = asyncHandler(async (req, res) => {
  const sendedRefereshToken = req.cookies?.refreshToken;
  if (!sendedRefereshToken) {
    throw new ApiError(401, "Unauthorized");
  }
  const decodedRefreshToken = jwt.verify(
    sendedRefereshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedRefreshToken._id);
  if (!user) {
    throw new ApiError(401, "Unauthorized");
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

//change password controller

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Please provide old and new password");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different from old password");
  }
  const isMatch = await req.user.isPasswordCorrect(oldPassword);
  if (!isMatch) {
    throw new ApiError(401, "Invalid old password");
  }
  if (!isStrongPassword(newPassword)) {
    throw new ApiError(
      400,
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
//update username controller
const updateUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(400, "Please provide username");
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

//update avatar controller

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide an image");
  }
  //delete old photo
  const oldAvatar = req.user?.avatar;
  const defaultOne = "https://picsum.photos/200/300";
  if (oldAvatar !== defaultOne) {
    const publicId = oldAvatar.split("/").pop().split(".")[0];
    await deleteImage(publicId);
  }
  const avatar = await uploadImage(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(500, "Something went wrong while uploading image");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar?.url },
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
