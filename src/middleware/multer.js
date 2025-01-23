import multer from "multer";
import ApiError from "../utils/ApiError.js";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    file.originalname;
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only .jpeg, .jpg, .png files are allowed!"));
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 0.5, //0.5mb
  },
});

export default upload;
