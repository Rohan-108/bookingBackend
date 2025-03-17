import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { APIError } from "../utils/error";
import { HttpStatusCode } from "../types/httpCode";
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
const FILE_SIZE = 1024 * 1024 * 0.5; //0.5mb
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ): void => {
    cb(null, "./public/temp");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ): void => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    file.originalname;
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE,
  },
});

export default upload;
