import { jenisSampahQuerySchema, objectIdSchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import * as jenisSampahService from "../services/jenis-sampah.service";

export async function list(req: Request, res: Response) {
  const query = jenisSampahQuerySchema.parse(req.query);
  const data = await jenisSampahService.listJenisSampah(query);
  res.json({ data });
}

export async function detail(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const jenisSampah = await jenisSampahService.getJenisSampahById(id);
  res.json({ jenisSampah });
}

export async function create(req: Request, res: Response) {
  const jenisSampah = await jenisSampahService.createJenisSampah(req.body);
  res.status(201).json({ message: "Jenis sampah berhasil ditambahkan", jenisSampah });
}

export async function update(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const jenisSampah = await jenisSampahService.updateJenisSampah(id, req.body);
  res.json({ message: "Jenis sampah berhasil diperbarui", jenisSampah });
}

export async function remove(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const { softDeleted } = await jenisSampahService.deleteJenisSampah(id);
  const message = softDeleted
    ? "Jenis sampah sudah pernah digunakan dalam setoran, dinonaktifkan (soft delete)"
    : "Jenis sampah berhasil dihapus";
  res.json({ message });
}
