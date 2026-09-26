import { Router } from "express";
import * as laporanController from "../controllers/laporan.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const laporanRoutes = Router();

laporanRoutes.use(requireAuth, requireRole("ADMIN"));

laporanRoutes.get("/ringkasan", laporanController.ringkasan);
laporanRoutes.get("/per-jenis", laporanController.perJenis);
