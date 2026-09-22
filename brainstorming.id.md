# Bank Sampah App — Brainstorming

## 1. Gambaran Umum

Aplikasi web bank sampah — sistem komunitas di mana warga menyetor sampah tersortir dan dapat saldo, yang nanti bisa ditarik. Tugas kuliah kelompok (4 anggota), backend pakai Express.js. Tech stack frontend dan keputusan teknis lain: belum ditentukan.

## 2. Role Pengguna

### Nasabah (warga/customer)
- Setor sampah tersortir
- Punya saldo dari hasil setoran
- Tarik saldo
- Jual-beli "paket" di marketplace

### Admin / Petugas bank sampah
- Catat setoran
- Atur harga sampah per jenis
- Atur harga paket
- Approve penarikan saldo
- Kelola paket, lihat laporan

### Pengepul / Pembeli
- Beli paket dari Nasabah atau dari bank sampah
- Browse marketplace, lihat riwayat pembelian

## 3. Fitur Inti

- **Setor sampah:** Nasabah setor sampah yang udah disortir, dapat kredit saldo.
- **Saldo & tarik saldo:** Nasabah bisa tarik saldo yang udah terkumpul.
- **Daftar harga sampah:** Admin atur harga per kg per jenis sampah.
- **Paket:** Sampah dibundel per kategori (bundle campuran, contoh: "paket elektronik", "paket organik") — bukan cuma bundle satu jenis.
- **Trading paket:** Paket bisa dijual-beli:
  - Nasabah ↔ Pengepul
  - Bank sampah ↔ Pengepul
  - Nasabah ↔ Nasabah
  - Harga tetap ditentukan admin (bukan nego/lelang)
  - Bank sampah single-location — nggak ada trading antar cabang
- **Laporan/statistik:** Total sampah terkumpul, dampak lingkungan, saldo nasabah.

## 4. Daftar Halaman/Screen Kasar per Role

**Nasabah**
- Login/Register
- Dashboard (ringkasan saldo)
- Setor Sampah (form setoran)
- Riwayat Transaksi
- Marketplace Paket (browse/beli/jual paket)
- Tarik Saldo
- Profil

**Admin/Petugas**
- Dashboard Admin
- Kelola Nasabah
- Catat Setoran
- Kelola Harga Sampah
- Kelola Paket
- Approve Tarik Saldo
- Laporan

**Pengepul/Pembeli**
- Dashboard
- Marketplace Paket (browse/beli)
- Riwayat Pembelian
- Profil

## 5. Catatan Tim (opsional/belum final)

4 anggota tim, pembagian role dev belum diputusin. Ini cuma contoh gimana *bisa* dibagi — bukan keputusan final:

- Member A — Backend (Express.js, API, DB)
- Member B — Frontend/UI
- Member C — Database/QA
- Member D — PM/Docs/Integration

## 6. Open Questions / TODO

- Framework frontend pilih apa?
- Database pilih apa?
- Metode auth (session, JWT, dll)?
- Metode tarik saldo — transfer bank, e-wallet, ambil tunai?
- Multi-cabang bakal masuk scope, minimal sebagai stretch goal?
- Target deployment?
- Ada batasan rubrik dari dosen yang belum dikasih tau (fitur wajib, deadline, format submit)?
