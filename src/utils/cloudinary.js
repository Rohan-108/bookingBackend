import { v2 as cloudinary } from "cloudinary";

import fs from "fs";
import { APIError } from "./error.js";
import { HttpStatusCode } from "../constants/httpCode.js";

/**
 * @description - This function is used to upload an image to cloudinary
 * @param {*} localFilePath - The local path of the file to be uploaded
 */
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
        throw new APIError(
          "Failed",
          HttpStatusCode.INTERNAL_SERVER,
          true,
          "File Deletion failed"
        );
      }
    });
    throw new APIError(
      "failed",
      HttpStatusCode.INTERNAL_SERVER,
      true,
      "Image upload failed"
    );
  }
};

/**
 * @description - This function is used to delete an image from cloudinary
 * @param {*} publicId - The public id of the image to be deleted
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new APIError(
        "BAD Request",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Please provide the image public id"
      );
    }
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    throw new APIError(
      "Failed",
      HttpStatusCode.INTERNAL_SERVER,
      true,
      "Image deletion failed"
    );
  }
};

export { uploadImage, deleteImage };
