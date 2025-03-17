import { Request, Response } from 'express';
import { Types } from 'mongoose';
import asyncHandler from '../utils/asyncHandler';
import { APIError } from '../utils/error';
import ApiResponse from '../utils/ApiResponse';
import User from '../models/userModel';
import { isStrongPassword, isEmail } from '../utils/validators';
import jwt from 'jsonwebtoken';
import { uploadImage, deleteImage } from '../utils/cloudinary';
import { HttpStatusCode } from '../types/httpCode';

/**
 * @description Generate access and refresh token
 */
const generateToken = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError(
        'Not Found',
        HttpStatusCode.NOT_FOUND,
        true,
        'User not found',
      );
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken ?? '';
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(
      'Internal Server Error',
      HttpStatusCode.INTERNAL_SERVER,
      true,
      'Something went wrong while generating referesh and access token',
    );
  }
};
const options = {
  httpOnly: true,
  secure: true,
};

/**
 * @description Login user
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new APIError(
      'Bad Request',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide email and password',
    );
  }
  if (!isEmail(email)) {
    throw new APIError(
      'Bad Request',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide a valid email',
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError(
      'NOT FOUND',
      HttpStatusCode.NOT_FOUND,
      true,
      'User not found',
    );
  }
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new APIError(
      'Unauthorized',
      HttpStatusCode.UNAUTHORIZED,
      true,
      'Invalid email or password',
    );
  }
  const { accessToken } = await generateToken(user._id);
  const loggedUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', user.refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
        },
        'User logged In Successfully',
      ),
    );
});
/**
 * @description Register user
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if ([email, username, password].some((field) => field?.trim() === '')) {
    throw new APIError(
      'Bad Request',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide email, username and password',
    );
  }
  if (!isEmail(email)) {
    throw new APIError(
      'Bad Request',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide a valid email',
    );
  }
  if (!isStrongPassword(password)) {
    throw new APIError(
      'Bad Request',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    );
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError(
      'Conflict',
      HttpStatusCode.CONFLICT,
      true,
      'User already exists with this email',
    );
  }
  const avatar = req.file?.path;
  let avatarUrl;
  if (avatar) {
    avatarUrl = await uploadImage(avatar);
    if (!avatarUrl?.url) {
      throw new APIError(
        'Internal Server Error',
        HttpStatusCode.INTERNAL_SERVER,
        true,
        'Something went wrong while uploading image',
      );
    }
  }
  const user = await User.create({
    email,
    username,
    password,
    avatar: avatarUrl?.url || 'https://picsum.photos/200/300',
  });
  await user.save();
  const { accessToken, refreshToken } = await generateToken(user._id);

  res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(201, { user, accessToken }, 'User created successfully'),
    );
});
/**
 * @description Logout user
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true },
  );
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

/**
 * @description Renew access token
 */
const renewAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const sendedRefereshToken = req.cookies?.refreshToken;
  if (!sendedRefereshToken) {
    throw new APIError(
      'Unauthorized',
      HttpStatusCode.UNAUTHORIZED,
      true,
      'Unauthorized',
    );
  }
  const decodedRefreshToken = jwt.verify(
    sendedRefereshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
  ) as jwt.JwtPayload;
  const user = await User.findById(decodedRefreshToken._id);
  if (!user) {
    throw new APIError(
      'Unauthorized',
      HttpStatusCode.UNAUTHORIZED,
      true,
      'Unauthorized',
    );
  }
  const { accessToken, refreshToken } = await generateToken(user._id);
  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        'Access token renewed successfully',
      ),
    );
});

/**
 * @description Change password
 */
const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new APIError(
      'BAD REQUEST',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide old password and new password',
    );
  }
  if (oldPassword === newPassword) {
    throw new APIError(
      'BAD REQUEST',
      HttpStatusCode.BAD_REQUEST,
      true,
      "Old password and new password can't be same",
    );
  }
  const isMatch = await req.user.isPasswordCorrect(oldPassword);
  if (!isMatch) {
    throw new APIError(
      'UNAUTHORIZED',
      HttpStatusCode.UNAUTHORIZED,
      true,
      'Invalid old password',
    );
  }
  if (!isStrongPassword(newPassword)) {
    throw new APIError(
      'BAD REQUEST',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    );
  }
  await User.findByIdAndUpdate(
    req.user._id,
    { password: newPassword },
    { new: true },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

/**
 * @description Update username
 */

const updateUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    throw new APIError(
      'BAD REQUEST',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide a username',
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { username },
    { new: true },
  ).select('-password -refreshToken');
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

/**
 * @description Update avatar
 */
const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new APIError(
      'BAD REQUEST',
      HttpStatusCode.BAD_REQUEST,
      true,
      'Please provide an image',
    );
  }
  //delete old photo
  const oldAvatar = req.user?.avatar;
  const defaultOne = 'https://picsum.photos/200/300';
  if (oldAvatar !== defaultOne) {
    const publicId = oldAvatar.split('/').pop().split('.')[0];
    await deleteImage(publicId);
  }
  const avatar = await uploadImage(avatarLocalPath);
  if (!avatar?.url) {
    throw new APIError(
      'INTERNAL SERVER ERROR',
      HttpStatusCode.INTERNAL_SERVER,
      true,
      'Something went wrong while uploading image',
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar?.url },
    },
    { new: true },
  ).select('-password -refreshToken');
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Avatar updated successfully'));
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
