import { CreateUserInput, UpdateUserInput, UserQuery } from "@bank-sampah/shared";
import { HttpError } from "../lib/http-error";
import { buildPagination, skipFor } from "../lib/pagination";
import { hashPassword } from "../lib/password";
import { MutasiSaldoModel } from "../models/mutasi-saldo.model";
import { PenarikanModel } from "../models/penarikan.model";
import { SetoranModel } from "../models/setoran.model";
import { UserModel, toPublicUser } from "../models/user.model";

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listUsers(query: UserQuery) {
  const filter: Record<string, any> = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.aktif !== undefined) {
    filter.aktif = query.aktif;
  }

  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ nama: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit),
    UserModel.countDocuments(filter),
  ]);

  return {
    data: users.map(toPublicUser),
    pagination: buildPagination(query.page, query.limit, total),
  };
}

export async function getUserById(id: string) {
  const user = await UserModel.findById(id);
  if (!user) throw new HttpError(404, "Pengguna tidak ditemukan");

  return toPublicUser(user);
}

export async function createUser(input: CreateUserInput) {
  const email = input.email.toLowerCase();

  const sudahTerdaftar = await UserModel.exists({ email });
  if (sudahTerdaftar) throw new HttpError(409, "Email sudah terdaftar");

  const passwordHash = await hashPassword(input.password);
  const user = await UserModel.create({
    nama: input.nama,
    email,
    passwordHash,
    role: input.role,
    noHp: input.noHp,
    alamat: input.alamat,
    aktif: input.aktif,
  });

  return toPublicUser(user);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await UserModel.findById(id);
  if (!user) throw new HttpError(404, "Pengguna tidak ditemukan");

  const updates: Record<string, any> = { ...input };

  if (input.email) {
    const email = input.email.toLowerCase();
    const duplikat = await UserModel.exists({ email, _id: { $ne: id } });
    if (duplikat) throw new HttpError(409, "Email sudah terdaftar");
    updates.email = email;
  }

  if (input.password) {
    updates.passwordHash = await hashPassword(input.password);
    delete updates.password;
  }

  const updated = await UserModel.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!updated) throw new HttpError(404, "Pengguna tidak ditemukan");

  return toPublicUser(updated);
}

export async function deleteUser(adminId: string, id: string) {
  if (adminId === id) throw new HttpError(400, "Tidak dapat menghapus akun sendiri");

  const user = await UserModel.findById(id);
  if (!user) throw new HttpError(404, "Pengguna tidak ditemukan");

  const [adaSetoran, adaPenarikan, adaMutasi] = await Promise.all([
    SetoranModel.exists({ $or: [{ nasabahId: id }, { petugasId: id }] }),
    PenarikanModel.exists({ $or: [{ nasabahId: id }, { diprosesOleh: id }] }),
    MutasiSaldoModel.exists({ nasabahId: id }),
  ]);

  if (adaSetoran || adaPenarikan || adaMutasi) {
    user.aktif = false;
    await user.save();
    return { softDeleted: true };
  }

  await UserModel.findByIdAndDelete(id);
  return { softDeleted: false };
}
