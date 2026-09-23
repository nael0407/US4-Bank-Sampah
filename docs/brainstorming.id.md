# Bank Sampah App — Brainstorming

## 1. Gambaran Umum

User story **US4 — Bank sampah: pencatatan setoran & saldo otomatis**. Bank sampah tingkat RW nyatet setoran nasabah di buku tabungan manual: jenis sampah, berat, nilainya, terus dijumlahin jadi saldo tiap nasabah yang sewaktu-waktu bisa ditarik jadi uang. Pencatatan manual rawan salah hitung pas petugas ngelayanin banyak nasabah sekaligus, dan kalau buku hilang/rusak, saldo nasabah gak bisa ditelusuri lagi.

Aplikasi ini mendigitalkan seluruh proses: petugas nimbang dan input data setoran, saldo nasabah terakumulasi otomatis sebagai buku besar, dan nasabah bisa cek saldo sendiri serta ngajuin penarikan.

Tugas kuliah kelompok (4 anggota). Stack wajib sesuai rubrik: ExpressJS, MongoDB, Next.js.

## 2. Role Pengguna

### Nasabah (warga/customer)
- Daftar akun
- Cek saldo dan riwayat setoran/mutasi
- Ajuin penarikan (tunai atau e-wallet)
- Lihat titik & jadwal jemput di peta

### Petugas bank sampah
- Input hasil timbangan sebagai setoran
- Proses pengajuan penarikan (setujui/tolak)
- Bisa batalin setoran yang salah (bikin entri koreksi)

### Admin (pengelola)
- Atur jenis sampah dan harga per kg (harga bisa berubah kapan aja)
- Kelola akun pengguna (nasabah & petugas)
- Kelola titik & jadwal jemput
- Lihat laporan

Perbedaan wewenang ini jadi titik penerapan otorisasi di API.

## 3. Fitur Inti

- **Jenis & harga sampah:** tiap jenis punya harga per kg sendiri (contoh: plastik PET, kardus, kertas, kaleng, botol kaca). Harga bisa berubah kapan aja.
- **Setoran:** tanggal, nasabah, dan rincian jenis sampah × berat × harga. Totalnya masuk ke saldo nasabah sebagai catatan buku besar. Harga di-snapshot per item, jadi perubahan harga nanti gak ngubah riwayat.
- **Saldo & buku besar:** tiap perubahan saldo jadi satu baris buku besar — saldo selalu bisa ditelusuri, gak ada buku yang bisa hilang.
- **Penarikan:** nasabah ajuin pencairan tunai atau e-wallet; petugas proses.
- **Laporan:** total kg dan nilai per jenis sampah per periode, total penarikan, saldo beredar.
- **Titik & jadwal jemput (nilai tambah):** peta (Leaflet) titik penjemputan beserta jadwalnya.
- **Email otomatis (nilai tambah):** nasabah dapet email pas setoran tercatat atau status penarikan berubah.

## 4. Daftar Halaman/Screen Kasar per Role

**Nasabah**
- Login / Register
- Dashboard (saldo, grafik, setoran terbaru)
- Riwayat (riwayat setoran & mutasi)
- Tarik Saldo (pengajuan + status)
- Jadwal Jemput (peta & jadwal)
- Profil

**Petugas**
- Dashboard (setoran hari ini, penarikan pending)
- Setoran (input setoran baru, daftar setoran)
- Penarikan (proses pengajuan penarikan)

**Admin**
- Dashboard
- Jenis Sampah (jenis & harga)
- Pengguna (kelola nasabah & petugas)
- Titik Jemput (kelola titik & jadwal)
- Laporan

## 5. Catatan Tim

4 anggota tim, pembagian role dev udah diputusin:

- Member A, Member B — Frontend & UI/UX
- Member C, Member D — Backend & Database

## 6. Tech Stack

- **Backend:** Express.js (TypeScript) di Railway
  - ODM: Mongoose
  - Validasi: Zod
  - Hashing password: bcrypt
- **Database:** MongoDB Atlas (free tier, replica set → transaction bisa jalan)
- **Frontend:** Next.js (App Router) + TypeScript, di Vercel
  - Styling/UI: Tailwind CSS + shadcn/ui
  - Data fetching: TanStack Query (React Query)
  - Peta: Leaflet (react-leaflet)
- **Email:** Nodemailer / Resend
- **Bentuk repo:** monorepo, `backend/` + `frontend/` + `packages/shared` — sesuai pembagian tim 2+2.

## 7. Open Questions / TODO

- Mekanisme auth: JWT di httpOnly cookie (rekomendasi) atau session?
- Pencairan e-wallet: transfer manual oleh petugas, atau disbursement beneran via payment gateway nanti?
