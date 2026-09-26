import { createPenarikanSchema, setujuiPenarikanSchema, tolakPenarikanSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as penarikanController from "../controllers/penarikan.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const penarikanRoutes = Router();

penarikanRoutes.use(requireAuth);

penarikanRoutes.post(
  "/",
  requireRole("NASABAH"),
  validateBody(createPenarikanSchema),
  penarikanController.create,
);
penarikanRoutes.get("/", penarikanController.list);
penarikanRoutes.get("/:id", penarikanController.detail);
penarikanRoutes.patch(
  "/:id/setujui",
  requireRole("PETUGAS", "ADMIN"),
  validateBody(setujuiPenarikanSchema),
  penarikanController.setujui,
);
penarikanRoutes.patch(
  "/:id/tolak",
  requireRole("PETUGAS", "ADMIN"),
  validateBody(tolakPenarikanSchema),
  penarikanController.tolak,
);
