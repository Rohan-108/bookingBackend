import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs';
import { APIError } from './error';
import { HttpStatusCode } from '../types/httpCode';

const uploadImage = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'image',
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error: any) {
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error(error?.message);
        throw new APIError(
          'Failed',
          HttpStatusCode.INTERNAL_SERVER,
          true,
          'File Deletion failed',
        );
      }
    });
    throw new APIError(
      'failed',
      HttpStatusCode.INTERNAL_SERVER,
      true,
      'Image upload failed',
    );
  }
};

const deleteImage = async (publicId: string) => {
  try {
    if (!publicId) {
      throw new APIError(
        'BAD Request',
        HttpStatusCode.BAD_REQUEST,
        true,
        'Please provide the image public id',
      );
    }
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    throw new APIError(
      'Failed',
      HttpStatusCode.INTERNAL_SERVER,
      true,
      'Image deletion failed',
    );
  }
};

export { uploadImage, deleteImage };
