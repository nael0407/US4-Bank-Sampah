# Bank Sampah App — Brainstorming

## 1. Overview

User story **US4 — Bank sampah: automatic deposit & balance recording**. A neighborhood-level (RW) bank sampah records every deposit by hand in a paper savings book: waste type, weight, value, then adds it all up into each nasabah's balance, which can be withdrawn as cash at any time. Manual bookkeeping is error-prone when staff serve many nasabah at once, and a lost or damaged book makes a balance untraceable.

This app digitizes the whole flow: petugas weigh and enter deposits, each nasabah's balance accumulates automatically as a ledger, and nasabah can check their own balance and request withdrawals.

University group project (4 members). Mandatory stack per the grading rubric: ExpressJS, MongoDB, Next.js.

## 2. User Roles

### Nasabah (resident/customer)
- Registers an account
- Checks balance and deposit/ledger history
- Requests withdrawals (cash or e-wallet)
- Views pickup points & schedule on a map

### Petugas (bank sampah staff)
- Records weigh-in results as deposits
- Processes withdrawal requests (approve/reject)
- Can cancel a wrong deposit (creates a correction entry)

### Admin (manager)
- Sets waste types and price per kg (prices can change anytime)
- Manages user accounts (nasabah & petugas)
- Manages pickup points & schedule
- Views reports

Role differences are where authorization is enforced on the API.

## 3. Core Features

- **Waste types & prices:** each type has its own price per kg (e.g. PET plastic, cardboard, paper, cans, glass bottles). Prices can change anytime.
- **Deposit (setoran):** date, nasabah, and line items of waste type × weight × price. The total is credited to the nasabah's balance as a ledger entry. Price is snapshotted per item, so later price changes don't rewrite history.
- **Balance & ledger:** every balance change is a ledger row — the balance is always traceable, no paper book to lose.
- **Withdrawal:** nasabah requests cash or e-wallet payout; petugas processes it.
- **Reports:** total kg and value per waste type per period, total withdrawals, balance in circulation.
- **Pickup points & schedule (value-add):** map (Leaflet) of pickup points with their schedule.
- **Automatic email (value-add):** nasabah gets an email when a deposit is recorded or a withdrawal status changes.

## 4. Rough Page/Screen List per Role

**Nasabah**
- Login / Register
- Dashboard (balance, chart, latest deposits)
- Riwayat (deposit & ledger history)
- Tarik Saldo (withdrawal request + status)
- Jadwal Jemput (pickup map & schedule)
- Profil

**Petugas**
- Dashboard (today's deposits, pending withdrawals)
- Setoran (record new deposit, deposit list)
- Penarikan (process withdrawal requests)

**Admin**
- Dashboard
- Jenis Sampah (waste types & prices)
- Pengguna (manage nasabah & petugas)
- Titik Jemput (manage pickup points & schedule)
- Laporan (reports)

## 5. Team Notes

4 team members, dev-role split decided:

- Member A, Member B — Frontend & UI/UX
- Member C, Member D — Backend & Database

## 6. Tech Stack

- **Backend:** Express.js (TypeScript) on Railway
  - ODM: Mongoose
  - Validation: Zod
  - Password hashing: bcrypt
- **Database:** MongoDB Atlas (free tier, replica set → transactions supported)
- **Frontend:** Next.js (App Router) + TypeScript, on Vercel
  - Styling/UI: Tailwind CSS + shadcn/ui
  - Data fetching: TanStack Query (React Query)
  - Map: Leaflet (react-leaflet)
- **Email:** Nodemailer / Resend
- **Repo shape:** monorepo, `backend/` + `frontend/` + `packages/shared` — matches the 2+2 team split.

## 7. Open Questions / TODO

- Auth mechanism: JWT in httpOnly cookie (recommended) vs session?
- E-wallet payout: manual transfer by petugas, or real disbursement via payment gateway later?
