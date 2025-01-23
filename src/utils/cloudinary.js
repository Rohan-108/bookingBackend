import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import ApiError from "./ApiError.js";

const uploadImage = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error(error?.message);
        throw new ApiError(500, "Image upload failed", error);
      }
    });
    throw new ApiError(500, "Image upload failed", error);
  }
};

const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new ApiError(400, "Please provide the image public id");
    }
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    throw new ApiError(500, "Image deletion failed", error);
  }
};

export { uploadImage, deleteImage };
