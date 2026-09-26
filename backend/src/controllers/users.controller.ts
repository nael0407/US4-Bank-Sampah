import { objectIdSchema, userQuerySchema } from "@bank-sampah/shared";
import { Request, Response } from "express";
import { getAuthUser } from "../middlewares/auth.middleware";
import * as usersService from "../services/users.service";

export async function list(req: Request, res: Response) {
  const query = userQuerySchema.parse(req.query);
  const result = await usersService.listUsers(query);
  res.json(result);
}

export async function detail(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const user = await usersService.getUserById(id);
  res.json({ user });
}

export async function create(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  res.status(201).json({ message: "Pengguna berhasil ditambahkan", user });
}

export async function update(req: Request, res: Response) {
  const id = objectIdSchema.parse(req.params.id);
  const user = await usersService.updateUser(id, req.body);
  res.json({ message: "Pengguna berhasil diperbarui", user });
}

export async function remove(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const id = objectIdSchema.parse(req.params.id);
  const { softDeleted } = await usersService.deleteUser(authUser.id, id);
  const message = softDeleted
    ? "Pengguna memiliki riwayat transaksi, akun dinonaktifkan"
    : "Pengguna berhasil dihapus";
  res.json({ message });
}
