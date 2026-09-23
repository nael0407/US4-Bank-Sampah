# US4-Bank-Sampah

Aplikasi web bank sampah — sistem komunitas di mana warga (nasabah) menyetor sampah tersortir dan dapat saldo, yang nanti bisa ditarik. Nasabah juga bisa jual-beli "paket" sampah (bundle per kategori) lewat marketplace ke Pengepul atau sesama nasabah. Tugas kuliah kelompok.

Detail lengkap konsep, fitur, dan role ada di [`docs/brainstorming.id.md`](docs/brainstorming.id.md). Detail arsitektur teknis ada di [`docs/architecture.id.md`](docs/architecture.id.md).

## Anggota Tim

- Member A, Member B — Frontend & UI/UX
- Member C, Member D — Backend & Database

## Tech Stack

- **Backend:** Express.js (TypeScript) — Prisma (ORM), Zod (validasi)
- **Database:** PostgreSQL
- **Frontend:** Next.js (App Router) + TypeScript — Tailwind CSS, shadcn/ui, TanStack Query
- **Deployment:** Vercel (frontend), Railway (backend + database)

## Struktur Folder & File

```
paw/
├── backend/          # Express API (routes → controllers → services → Prisma)
├── frontend/         # Next.js app (App Router)
├── packages/
│   └── shared/       # Zod schema & TypeScript types yang di-share backend/frontend
├── docs/             # brainstorming.md, architecture.md (versi EN & ID)
└── package.json      # root npm workspaces
```

Detail isi tiap folder ada di [`docs/architecture.id.md`](docs/architecture.id.md).

## Laporan Proyek

Link Google Drive: _belum dibuat — TODO, nyusul_
