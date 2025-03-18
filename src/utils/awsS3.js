import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
    const { Location } = await s3.send(command);
    // S3 SDK v3 doesn't directly return `Location`. You'll need to construct it manually if needed.
    const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    return location;
  } catch (error) {
    throw error;
  }
}

async function deleteFile(Location) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Location.split("s3.amazonaws.com/").pop(),
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    throw error;
  }
}

export { uploadFile, deleteFile, s3 };
