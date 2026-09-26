import { titikJemputSchema, updateTitikJemputSchema } from "@bank-sampah/shared";
import { Router } from "express";
import * as titikJemputController from "../controllers/titik-jemput.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";

export const titikJemputRoutes = Router();

titikJemputRoutes.use(requireAuth);

titikJemputRoutes.get("/", titikJemputController.list);
titikJemputRoutes.get("/:id", titikJemputController.detail);
titikJemputRoutes.post("/", requireRole("ADMIN"), validateBody(titikJemputSchema), titikJemputController.create);
titikJemputRoutes.patch(
  "/:id",
  requireRole("ADMIN"),
  validateBody(updateTitikJemputSchema),
  titikJemputController.update,
);
titikJemputRoutes.delete("/:id", requireRole("ADMIN"), titikJemputController.remove);
