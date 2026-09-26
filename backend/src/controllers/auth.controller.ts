import { CookieOptions, Request, Response } from "express";
import { config } from "../lib/config";
import { TOKEN_MAX_AGE_SECONDS } from "../lib/token";
import { getAuthUser } from "../middlewares/auth.middleware";
import * as authService from "../services/auth.service";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? "none" : "lax",
};

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  res.status(201).json({ message: "Registrasi berhasil", user });
}

export async function login(req: Request, res: Response) {
  const { token, user } = await authService.login(req.body);
  res.cookie("token", token, { ...cookieOptions, maxAge: TOKEN_MAX_AGE_SECONDS * 1000 });
  res.json({ message: "Login berhasil", token, user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logout berhasil" });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getProfil(getAuthUser(req).id);
  res.json({ user });
}
