import { createJenisSampahSchema, updateJenisSampahSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as jenisSampahController from "../controllers/jenis-sampah.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const jenisSampahRoutes = Router();

jenisSampahRoutes.use(requireAuth);

jenisSampahRoutes.get("/", jenisSampahController.list);
jenisSampahRoutes.get("/:id", jenisSampahController.detail);
jenisSampahRoutes.post("/", requireRole("ADMIN"), validateBody(createJenisSampahSchema), jenisSampahController.create);
jenisSampahRoutes.patch(
  "/:id",
  requireRole("ADMIN"),
  validateBody(updateJenisSampahSchema),
  jenisSampahController.update,
);
jenisSampahRoutes.delete("/:id", requireRole("ADMIN"), jenisSampahController.remove);
