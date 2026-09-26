# Panduan Deployment (BE-12) — Railway & MongoDB Atlas

Dokumen ini menjelaskan langkah-langkah deployment backend **US4 Bank Sampah** ke **Railway** dan basis data ke **MongoDB Atlas**, serta integrasi CORS & Cookie dengan frontend Next.js di **Vercel**.

---

## 1. Arsitektur Deployment

```mermaid
flowchart LR
    FE["Frontend (Next.js)\ndi Vercel\nhttps://bank-sampah.vercel.app"]
    BE["Backend (Express TypeScript)\ndi Railway\nhttps://*.up.railway.app"]
    DB[(MongoDB Atlas\nM0 Free Cluster\nReplica Set)]
    SG[SendGrid Email API]

    FE -->|HTTPS REST + Credentials| BE
    BE -->|Mongoose Driver| DB
    BE -->|Notifikasi Email| SG
```

- **Backend:** Express.js TypeScript berjalan di Railway menggunakan Nixpacks (`railway.json`).
- **Database:** MongoDB Atlas M0 (Free Tier). Klaster Atlas secara default berupa **Replica Set**, yang wajib digunakan untuk mendukung transaksi multi-dokumen ACID pada setoran dan penarikan.
- **Frontend:** Next.js (App Router) di Vercel yang mengonsumsi API Railway secara langsung.

---

## 2. Persiapan MongoDB Atlas

1. **Buat Akun & Klaster:**
   - Kunjungi [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) dan buat klaster gratis (**M0 Sandbox**).
   - Pilih region terdekat (misal: `ap-southeast-1` Singapore).

2. **Buat Database User:**
   - Masuk ke menu **Security** $\rightarrow$ **Database Access**.
   - Klik **Add New Database User**.
   - Metode autentikasi: **Password**.
   - Berikan wewenang: **Read and write to any database** (atau database `bank-sampah`).
   - Simpan username dan password.

3. **Atur Network Access (IP Whitelist):**
   - Masuk ke menu **Security** $\rightarrow$ **Network Access**.
   - Klik **Add IP Address**.
   - Pilih **Allow Access from Anywhere** (`0.0.0.0/0`) karena Railway menggunakan IP dinamis.

4. **Dapatkan Connection String (URI):**
   - Di dashboard klaster, klik **Connect** $\rightarrow$ **Drivers** (Node.js).
   - Salin connection string, lalu ganti `<password>` dan nama database menjadi `bank-sampah`:
     ```text
     mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bank-sampah?retryWrites=true&w=majority
     ```

---

## 3. Konfigurasi Railway

Backend sudah dilengkapi konfigurasi [`railway.json`](../railway.json) di root repositori:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Langkah Deployment di Railway:

1. Kunjungi [Railway.app](https://railway.app) dan login dengan akun GitHub.
2. Klik **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Pilih repositori **`nael0407/US4-Bank-Sampah`**.
4. Masuk ke tab **Variables** pada service yang baru dibuat dan tambahkan Environment Variables berikut:

| Nama Variabel | Wajib | Nilai Contoh | Keterangan |
|---|---|---|---|
| `NODE_ENV` | Ya | `production` | Mengaktifkan mode produksi, Secure cookie, dan logging |
| `PORT` | Ya | Diatur otomatis oleh Railway | Port server HTTP |
| `MONGODB_URI` | Ya | `mongodb+srv://user:pass@cluster.mongodb.net/bank-sampah` | URI klaster MongoDB Atlas |
| `JWT_SECRET` | Ya | `string-acak-minimal-16-karakter-keamanan` | Kunci rahasia penandatanganan token JWT |
| `FRONTEND_URL` | Ya | `https://bank-sampah.vercel.app` | Domain frontend Vercel (bisa koma untuk banyak URL) |
| `SENDGRID_API_KEY` | Opsional | `SG.xxxxxxxxxxxxxxxxxxxx` | Kunci API SendGrid untuk email notifikasi |
| `SENDGRID_FROM_EMAIL` | Opsional | `admin@banksampah.id` | Alamat pengirim terverifikasi di SendGrid |

5. **Generate Domain Publik:**
   - Buka tab **Settings** $\rightarrow$ **Networking**.
   - Klik **Generate Domain** (contoh hasil: `https://us4-banksampah-production.up.railway.app`).

6. **Menjalankan Seed Awal di Railway:**
   - Menggunakan [Railway CLI](https://docs.railway.app/guides/cli):
     ```bash
     railway login
     railway link
     railway run npm run seed
     ```
   - Atau sementara waktu ubah **Deploy** $\rightarrow$ **Custom Start Command** menjadi:
     ```bash
     npm run seed && npm run start
     ```
     Setelah seed berhasil selesai, kembalikan start command ke default (`npm run start`).

---

## 4. Konfigurasi CORS & Keamanan Cookie

Karena frontend berjalan di domain Vercel (`*.vercel.app`) dan backend di Railway (`*.up.railway.app`), request dilakukan secara **cross-site (cross-origin)**:

1. **Proxy Trust:**
   - Express telah dikonfigurasi dengan `app.set("trust proxy", 1);` di [`backend/src/app.ts`](../backend/src/app.ts), sehingga Express mengenali protokol HTTPS dari load balancer Railway.
2. **CORS Allowlist:**
   - Backend memvalidasi origin dari `FRONTEND_URL`, dan otomatis mengizinkan domain preview Vercel (`*.vercel.app`).
   - `credentials: true` diaktifkan agar browser diizinkan mengirim dan menerima cookie.
3. **Cookie `SameSite=None; Secure`:**
   - Pada mode `production`, cookie token disetel dengan:
     ```typescript
     {
       httpOnly: true,
       secure: true,
       sameSite: "none",
     }
     ```
   - Konfigurasi ini menjamin cookie JWT dapat disimpan oleh browser nasabah/petugas/admin saat mengakses frontend di Vercel.

---

## 5. Informasi Handoff ke Tim Frontend (Member A & B)

- **Base URL API Production:** `https://<domain-railway>.up.railway.app/api`
- **Health Check Endpoint:** `GET https://<domain-railway>.up.railway.app/api/health`
- **Akun Bawaan (Hasil Seed):**
  | Role | Email | Password |
  |---|---|---|
  | **Admin** | `admin@banksampah.id` | `admin12345` |
  | **Petugas** | `petugas@banksampah.id` | `petugas12345` |
  | **Nasabah** | `nasabah@banksampah.id` | `nasabah12345` |
- **Catatan Pemanggilan API di Frontend:**
  - Saat melakukan `fetch` atau menggunakan client HTTP (Axios / TanStack Query), wajib menyertakan `credentials: "include"` agar cookie JWT tersimpan dan terkirim otomatis di setiap request.
