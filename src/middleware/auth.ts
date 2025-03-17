import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { APIError } from "../utils/error";
import { HttpStatusCode } from "../types/httpCode";
const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new APIError(
        "Token Missing",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Token Not Found"
      );
    }
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as jwt.JwtPayload;
    const user = await User.findById(decodedToken?._id).lean();
    if (!user) {
      throw new APIError(
        "UnAuthorized",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Invalid access token"
      );
    }
    req.user = user;
    next();
  } catch (error: any) {
    throw new APIError(
      "UnAuthorized",
      HttpStatusCode.UNAUTHORIZED,
      true,
      error?.message || "Invalid access token"
    );
  }
};
export default protect;
