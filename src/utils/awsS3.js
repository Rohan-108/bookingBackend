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

// async function uploadFile(file, ACL = "public-read") {
//   const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: file.originalname + "-" + suffix,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL,
//   };

//   try {
//     const command = new PutObjectCommand(params);
//     const { Location } = await s3.send(command);
//     const location = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
//     return location;
//   } catch (error) {
//     throw error;
//   }
// }

/**
 * @description Delete file from S3 bucket
 * @param {*} Location - Location of the file to be deleted
 */
async function deleteFile(Location) {
  const key = Location.split("/").pop();
  console.log(key);
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

export { deleteFile };
