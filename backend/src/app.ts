import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { config } from "./lib/config";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.json({ status: "ok", database: databaseConnected ? "terhubung" : "terputus" });
});

app.use(notFoundHandler);
app.use(errorHandler);
