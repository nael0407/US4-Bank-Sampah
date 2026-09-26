import { LoginInput, RegisterInput, Role } from "@bank-sampah/shared";
import { HttpError } from "../lib/http-error";
import { hashPassword, verifyPassword } from "../lib/password";
import { signToken } from "../lib/token";
import { UserModel, toPublicUser } from "../models/user.model";

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();

  const sudahTerdaftar = await UserModel.exists({ email });
  if (sudahTerdaftar) throw new HttpError(409, "Email sudah terdaftar");

  const user = await UserModel.create({
    nama: input.nama,
    email,
    passwordHash: await hashPassword(input.password),
    role: "NASABAH",
    noHp: input.noHp,
    alamat: input.alamat,
  });

  return toPublicUser(user);
}

export async function login(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");

  const passwordBenar = user ? await verifyPassword(input.password, user.passwordHash) : false;
  if (!user || !passwordBenar) throw new HttpError(401, "Email atau password salah");
  if (!user.aktif) throw new HttpError(403, "Akun Anda nonaktif, silakan hubungi admin");

  const token = signToken({ id: user.id, role: user.role as Role });
  return { token, user: toPublicUser(user) };
}

export async function getProfil(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw new HttpError(404, "Pengguna tidak ditemukan");

  return toPublicUser(user);
}
