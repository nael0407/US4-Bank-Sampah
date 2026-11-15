import { createUserSchema, updateUserSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const usersRoutes = Router();

usersRoutes.use(requireAuth);

// Petugas hanya boleh melihat daftar nasabah (untuk memilih nasabah saat input setoran).
usersRoutes.get("/", requireRole("ADMIN", "PETUGAS"), usersController.list);

usersRoutes.use(requireRole("ADMIN"));

usersRoutes.get("/:id", usersController.detail);
usersRoutes.post("/", validateBody(createUserSchema), usersController.create);
usersRoutes.patch("/:id", validateBody(updateUserSchema), usersController.update);
usersRoutes.delete("/:id", usersController.remove);
