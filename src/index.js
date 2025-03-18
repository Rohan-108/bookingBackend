import express from "express";
import ErrorHandler from "./middleware/errorHandler.js";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./utils/connectDB.js";
import healthCheckRouter from "./routes/healthCheckerRouter.js";
import userRouter from "./routes/userRouter.js";
import vehicleRouter from "./routes/vehicleRouter.js";
import bidRouter from "./routes/bidRouter.js";
import * as dotenv from "dotenv";
import cors from "cors";
//import { v2 as cloudinary } from "cloudinary";
//config
dotenv.config();
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const app = express();
//middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
//routes

app.use("/api/v1/", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/bids", bidRouter);
//error handling middleware
app.use(async (err, req, res, next) => {
  if (!ErrorHandler.isTrustedError(err)) {
    next(err);
  }
  ErrorHandler.handleErrors(err, res);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message, err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
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
