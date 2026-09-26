import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { config } from "./lib/config";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { authRoutes } from "./routes/auth.routes";
import { saldoRoutes } from "./routes/saldo.routes";
import { setoranRoutes } from "./routes/setoran.routes";

export const app = express();

app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.json({ status: "ok", database: databaseConnected ? "terhubung" : "terputus" });
});

app.use("/api/auth", authRoutes);
app.use("/api/saldo", saldoRoutes);
app.use("/api/setoran", setoranRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
