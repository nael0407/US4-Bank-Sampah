import { createUserSchema, updateUserSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const usersRoutes = Router();

usersRoutes.use(requireAuth, requireRole("ADMIN"));

usersRoutes.get("/", usersController.list);
usersRoutes.get("/:id", usersController.detail);
usersRoutes.post("/", validateBody(createUserSchema), usersController.create);
usersRoutes.patch("/:id", validateBody(updateUserSchema), usersController.update);
usersRoutes.delete("/:id", usersController.remove);
