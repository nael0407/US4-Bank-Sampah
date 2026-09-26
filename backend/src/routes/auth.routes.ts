import { loginSchema, registerSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const authRoutes = Router();

authRoutes.post("/register", validateBody(registerSchema), authController.register);
authRoutes.post("/login", validateBody(loginSchema), authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireAuth, authController.me);
