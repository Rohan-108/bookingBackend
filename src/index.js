import express from "express";
import { createServer } from "node:http";
import ErrorHandler from "./middleware/errorHandler.js";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./utils/connectDB.js";
import healthCheckRouter from "./routes/healthCheckerRouter.js";
import userRouter from "./routes/userRouter.js";
import vehicleRouter from "./routes/vehicleRouter.js";
import bidRouter from "./routes/bidRouter.js";
import conversationRouter from "./routes/conversationRouter.js";
import chatRouter from "./routes/chatRouter.js";
import chartRouter from "./routes/chartRouter.js";
import approvalRouter from "./routes/approvalRouter.js";
import * as dotenv from "dotenv";
import cors from "cors";
import { initChatSocket } from "./socket/chatSocket.js";
import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";
//config
dotenv.config();
const app = express();
const server = createServer(app);
//worker
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const worker = new Worker(path.join(__dirname, "services/awsSQSService.js"));
worker.on("message", (message) => {
  console.log(message);
});
worker.on("error", (err) => {
  console.error(err);
});
worker.on("exit", (code) => {
  if (code !== 0) {
    console.error(new Error(`Worker stopped with exit code ${code}`));
  }
});

//socket
initChatSocket(server);
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
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/charts", chartRouter);
app.use("/api/v1/approvals", approvalRouter);
//error handling middleware
app.use(async (err, req, res, next) => {
  if (!ErrorHandler.isTrustedError(err)) {
    next(err);
  }
  ErrorHandler.handleErrors(err, res);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message, err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION!  Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
//server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    server.listen(PORT, () => console.log(`server started at port ${PORT}`));
  } catch (error) {
    console.log(error.message);
  }
};
startServer();
export default server;
