export const ROLES = ["NASABAH", "PETUGAS", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const TIPE_MUTASI = ["SETORAN", "PENARIKAN", "KOREKSI"] as const;
export type TipeMutasi = (typeof TIPE_MUTASI)[number];

export const STATUS_SETORAN = ["AKTIF", "DIBATALKAN"] as const;
export type StatusSetoran = (typeof STATUS_SETORAN)[number];

export const METODE_PENARIKAN = ["TUNAI", "E_WALLET"] as const;
export type MetodePenarikan = (typeof METODE_PENARIKAN)[number];

export const STATUS_PENARIKAN = ["PENDING", "DISETUJUI", "DITOLAK"] as const;
export type StatusPenarikan = (typeof STATUS_PENARIKAN)[number];

export const HARI = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"] as const;
export type Hari = (typeof HARI)[number];
