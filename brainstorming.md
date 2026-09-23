# Bank Sampah App — Brainstorming

## 1. Overview

Web app for "bank sampah" (trash bank) — a community system where residents deposit sorted waste and get credited a balance, which they can later withdraw. University group project (4 members), backend on Express.js. Frontend stack and other tech decisions: TBD.

## 2. User Roles

### Nasabah (resident/customer)
- Deposits sorted waste
- Holds a balance credited from deposits
- Withdraws balance
- Buys/sells "paket" (packages) in the marketplace

### Admin / Petugas (bank sampah staff)
- Records deposits
- Sets waste prices per type
- Sets package prices
- Approves withdrawals
- Manages packages, views reports

### Pengepul / Pembeli (collector/buyer)
- Buys packages from Nasabah or from the bank sampah
- Browses marketplace, views purchase history

## 3. Core Features

- **Setor sampah (deposit waste):** Nasabah deposits pre-sorted waste, gets balance credited.
- **Saldo & tarik saldo (balance & withdrawal):** Nasabah can withdraw accumulated balance.
- **Daftar harga sampah (waste price list):** Admin manages price per kg per waste type.
- **Paket (packages):** Waste bundled by category (mixed-category bundles, e.g. "electronics package," "organic package") — not just single-type bundles.
- **Trading paket:** Packages can be bought/sold:
  - Nasabah ↔ Pengepul
  - Bank sampah ↔ Pengepul
  - Nasabah ↔ Nasabah
  - Prices are fixed by admin (no bidding/negotiation)
  - Single-location bank sampah — no multi-branch trading
- **Laporan/statistik (reports):** Total waste collected, environmental impact, nasabah balances.

## 4. Rough Page/Screen List per Role

**Nasabah**
- Login/Register
- Dashboard (balance overview)
- Setor Sampah (deposit form)
- Riwayat Transaksi (transaction history)
- Marketplace Paket (browse/buy/sell packages)
- Tarik Saldo (withdrawal)
- Profil

**Admin/Petugas**
- Dashboard Admin
- Kelola Nasabah (manage residents)
- Catat Setoran (record deposits)
- Kelola Harga Sampah (manage waste prices)
- Kelola Paket (manage packages)
- Approve Tarik Saldo (approve withdrawals)
- Laporan (reports)

**Pengepul/Pembeli**
- Dashboard
- Marketplace Paket (browse/buy)
- Riwayat Pembelian (purchase history)
- Profil

## 5. Team Notes

4 team members, dev-role split decided:

- Member A, Member B — Frontend & UI/UX
- Member C, Member D — Backend & Database

## 6. Open Questions / TODO

- Frontend framework choice?
- Database choice?
- Auth method (session, JWT, etc.)?
- Withdrawal method — bank transfer, e-wallet, cash pickup?
- Is multi-branch ever in scope, even as a stretch goal?
- Deployment target?
- Any grading-rubric constraints not yet shared by the lecturer (required features, deadline, submission format)?
