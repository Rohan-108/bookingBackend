import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 *@description Generates a pre-signed URL for uploading a file.
 * @param {string} key - The object key (file name) in S3.
 * @param {string} contentType - The MIME type of the file.
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 seconds).
 * @returns {Promise<string>} - The pre-signed URL.
 */
async function generatePresignedUrl(key, contentType, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME, // Replace with your bucket name
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn });
    return signedUrl;
  } catch (err) {
    console.error("Error generating pre-signed URL", err);
    throw err;
  }
}
/**
 * @description Upload PDF buffer to S3 bucket
 * @param {*} pdfBuffer - Buffer of the PDF file
 * @param {*} key - Key of the file to be uploaded
 */
const uploadPdfBufferToS3 = async (pdfBuffer, key) => {
  try {
    const parallelUploads3 = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ACL: "public-read",
      },
    });
    const uploadResult = await parallelUploads3.done();
    return uploadResult.Location;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
/**
 * @description Upload file to S3 bucket
 * @param {*} file
 * @param {*} ACL
 * @returns
 */
async function uploadFile(file, ACL = "public-read") {
  const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.originalname + "-" + suffix,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return location;
  } catch (error) {
    throw error;
  }
}

/**
 * @description Delete file from S3 bucket
 * @param {*} Location - Location of the file to be deleted
 */
async function deleteFile(Location) {
  const key = Location.split("/").pop();
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { deleteFile, generatePresignedUrl, uploadFile, uploadPdfBufferToS3 };
