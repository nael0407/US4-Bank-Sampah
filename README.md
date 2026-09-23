# US4-Bank-Sampah

## Deskripsi Aplikasi

Aplikasi web bank sampah — sistem komunitas di mana warga (nasabah) menyetor sampah yang udah disortir dan dapat saldo, yang nanti bisa ditarik. Nasabah juga bisa jual-beli "paket" sampah (bundle per kategori, misal "paket elektronik" atau "paket organik") lewat marketplace ke Pengepul atau sesama nasabah. Tugas kuliah kelompok, backend pakai Express.js.

### Role Pengguna

- **Nasabah (warga/customer)** — setor sampah tersortir, punya saldo dari hasil setoran, tarik saldo, jual-beli paket di marketplace.
- **Admin / Petugas bank sampah** — catat setoran, atur harga sampah per jenis, atur harga paket, approve penarikan saldo, kelola paket, lihat laporan.
- **Pengepul / Pembeli** — beli paket dari Nasabah atau dari bank sampah, browse marketplace, lihat riwayat pembelian.

### Fitur Inti

- **Setor sampah** — Nasabah setor sampah yang udah disortir, dapat kredit saldo.
- **Saldo & tarik saldo** — Nasabah bisa tarik saldo yang udah terkumpul.
- **Daftar harga sampah** — Admin atur harga per kg per jenis sampah.
- **Paket** — Sampah dibundel per kategori (bundle campuran, contoh: "paket elektronik", "paket organik"), bukan cuma bundle satu jenis.
- **Trading paket** — Paket bisa dijual-beli antara Nasabah↔Pengepul, Bank sampah↔Pengepul, dan Nasabah↔Nasabah. Harga tetap ditentukan admin (bukan nego/lelang). Bank sampah single-location, gak ada trading antar cabang.
- **Laporan/statistik** — Total sampah terkumpul, dampak lingkungan, saldo nasabah.

## Anggota Tim

4 anggota, pembagian role dev:

- Member A, Member B — Frontend & UI/UX
- Member C, Member D — Backend & Database

## Tech Stack

- **Backend:** Express.js (TypeScript) di Railway
  - ORM: Prisma
  - Validasi: Zod
  - Auth: session atau JWT-based (metode belum final)
- **Database:** PostgreSQL di Railway
- **Frontend:** Next.js (App Router) + TypeScript, di Vercel
  - Styling/UI: Tailwind CSS + shadcn/ui
  - Data fetching: TanStack Query (React Query)
- **Bentuk repo:** monorepo pakai npm workspaces, `backend/` (Express/Prisma) + `frontend/` (Next.js) + `packages/shared` — sesuai pembagian tim 2+2.
- Frontend manggil Express API langsung (gak ada layer proxy Next.js API routes).

## Arsitektur

```
Browser (Nasabah / Admin / Pengepul)
  → Next.js (frontend/, Vercel)
    → fetch (REST) → Express route (backend/src/routes)
      → controller (backend/src/controllers)
        → service (backend/src/services)
          → Prisma client (backend/src/lib)
            → PostgreSQL (Railway)
```

Validasi dilakukan di batas route pakai Zod schema, di-share ke frontend lewat `packages/shared`, jadi kedua sisi (frontend & backend) sepakat sama bentuk request/response yang sama.

## Struktur Folder & File

```
paw/
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/           # nasabah.routes.ts, admin.routes.ts, paket.routes.ts, auth.routes.ts, laporan.routes.ts
│   │   ├── controllers/      # satu per route group, parse request, panggil service, kirim response
│   │   ├── services/         # business logic: setor sampah, saldo, trading paket, panggil Prisma
│   │   ├── middlewares/      # auth, error handler, validasi request pakai Zod
│   │   ├── prisma/           # schema.prisma, migrations/
│   │   ├── lib/               # Prisma client singleton, config/env loader
│   │   ├── app.ts             # setup Express app + middleware
│   │   └── server.ts          # entrypoint, jalanin HTTP server
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js app (App Router)
│   ├── app/
│   │   ├── (auth)/            # login, register
│   │   ├── nasabah/           # dashboard, setor-sampah, riwayat, marketplace, tarik-saldo, profil
│   │   ├── admin/             # dashboard, nasabah, setoran, harga-sampah, paket, tarik-saldo, laporan
│   │   ├── pengepul/           # dashboard, marketplace, riwayat
│   │   └── layout.tsx, page.tsx
│   ├── components/
│   │   ├── ui/                 # komponen shadcn/ui hasil generate
│   │   └── shared/             # komponen shared khusus app
│   ├── lib/                    # typed API client wrapper, TanStack Query client, utils
│   ├── hooks/                  # contoh: useAuth
│   ├── styles/globals.css
│   ├── package.json
│   └── tsconfig.json
│
├── packages/
│   └── shared/                # Zod schema & TypeScript types yang di-share backend/frontend, plus konstanta (kategori sampah, role)
│
├── docs/                      # brainstorming.md, architecture.md (versi EN & ID)
├── README.md
└── package.json                # root npm workspaces: "workspaces": ["backend", "frontend", "packages/*"]
```

## Open Items

- Metode auth (session vs JWT) belum final.
- Metode tarik saldo (transfer bank, e-wallet, ambil tunai) belum final.
- Multi-cabang belum masuk scope (stretch goal potensial).
- Batasan rubrik dari dosen (fitur wajib, deadline, format submit) belum dikasih tau semua.

## Laporan Proyek

Link Google Drive: _belum dibuat — TODO, nyusul_
