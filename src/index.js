import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./utils/connectDB.js";
import healthCheckRouter from "./routes/healthCheckerRouter.js";
import userRouter from "./routes/userRouter.js";
import ApiResponse from "./utils/ApiResponse.js";
import * as dotenv from "dotenv";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
//middlewares
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
//routes

app.use("/api/v1/", healthCheckRouter);
app.use("/api/v1/users", userRouter);

//error handling middleware
app.use((err, req, res, _) => {
  const statusCode = err.statusCode || 500;
  return res
    .status(statusCode)
    .json(
      new ApiResponse(statusCode, null, err.message || "Internal server error")
    );
});
//server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
    app.listen(PORT, () => console.log(`server started at port ${PORT}`));
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("An unknown error occurred");
    }
  }
};
startServer();
export default app;
