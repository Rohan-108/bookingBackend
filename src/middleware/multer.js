import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { APIError } from "../utils/error.js";
import { HttpStatusCode } from "../constants/httpCode.js";
import dotenv from "dotenv";
dotenv.config();
const FILE_SIZE = 1024 * 1024 * 0.5; //0.5mb
// Create an S3 client service object
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// function to filter files
function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new APIError(
        "BAD REQUEST",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Only .jpeg, .jpg, .png files are allowed!"
      )
    );
  }
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "rohan-carrental",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.originalname + "-" + uniqueSuffix);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE,
  },
});

export default upload;
