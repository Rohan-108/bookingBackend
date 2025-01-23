import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Token not found");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};
export default protect;
