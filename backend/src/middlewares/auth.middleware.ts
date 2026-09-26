import { Role } from "@bank-sampah/shared";
import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { verifyToken } from "../lib/token";
import { UserModel } from "../models/user.model";

function readToken(req: Request) {
  if (req.cookies?.token) return req.cookies.token as string;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);

  return null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) throw new HttpError(401, "Silakan login terlebih dahulu");

  let userId: string;
  try {
    userId = verifyToken(token).id;
  } catch {
    throw new HttpError(401, "Sesi tidak valid atau sudah berakhir");
  }

  const user = await UserModel.findById(userId).select("role aktif");
  if (!user || !user.aktif) throw new HttpError(401, "Akun tidak ditemukan atau nonaktif");

  req.user = { id: user.id, role: user.role as Role };
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, "Anda tidak punya akses ke fitur ini");
    }
    next();
  };
}

export function getAuthUser(req: Request) {
  if (!req.user) throw new HttpError(401, "Silakan login terlebih dahulu");
  return req.user;
}
