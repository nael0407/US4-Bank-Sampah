import { Router } from "express";
import * as saldoController from "../controllers/saldo.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const saldoRoutes = Router();

saldoRoutes.use(requireAuth);

saldoRoutes.get("/", saldoController.getSaldo);
saldoRoutes.get("/mutasi", saldoController.listMutasi);
