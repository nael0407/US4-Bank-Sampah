import { laporanPerJenisQuerySchema, laporanQuerySchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import * as laporanService from "../services/laporan.service";

export async function ringkasan(req: Request, res: Response) {
  const query = laporanQuerySchema.parse(req.query);
  const data = await laporanService.getRingkasanLaporan(query);
  res.json({ data });
}

export async function perJenis(req: Request, res: Response) {
  const query = laporanPerJenisQuerySchema.parse(req.query);
  const data = await laporanService.getLaporanPerJenis(query);
  res.json({ data });
}
