import { batalSetoranSchema, createSetoranSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as setoranController from "../controllers/setoran.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const setoranRoutes = Router();

setoranRoutes.use(requireAuth);

setoranRoutes.post("/", requireRole("PETUGAS"), validateBody(createSetoranSchema), setoranController.create);
setoranRoutes.get("/", setoranController.list);
setoranRoutes.get("/:id", setoranController.detail);
setoranRoutes.patch(
  "/:id/batal",
  requireRole("PETUGAS", "ADMIN"),
  validateBody(batalSetoranSchema),
  setoranController.batal,
);
