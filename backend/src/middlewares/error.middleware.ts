import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Data tidak valid",
      errors: err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: `Nilai ${err.path} tidak valid` });
  }

  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} sudah terdaftar` });
  }

  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
}

function isDuplicateKeyError(err: unknown): err is { code: number; keyValue: Record<string, unknown> } {
  return typeof err === "object" && err !== null && "code" in err && err.code === 11000;
}
