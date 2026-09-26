import { MetodePenarikan } from "@bank-sampah/shared";
import sgMail from "@sendgrid/mail";
import { config } from "./config";
import { escapeHtml, formatRupiah, formatTanggal } from "./format";

const emailAktif = Boolean(config.SENDGRID_API_KEY && config.SENDGRID_FROM_EMAIL);

if (emailAktif) {
  sgMail.setApiKey(config.SENDGRID_API_KEY!);
}

async function kirimEmail(tujuan: string, subjek: string, html: string) {
  if (!emailAktif) {
    console.info(`[email tidak dikirim, SendGrid belum diatur] ${tujuan}: ${subjek}`);
    return;
  }

  try {
    await sgMail.send({ to: tujuan, from: config.SENDGRID_FROM_EMAIL!, subject: subjek, html });
  } catch (error) {
    console.error(`Gagal mengirim email ke ${tujuan}:`, error);
  }
}

type EmailSetoran = {
  email: string;
  nama: string;
  tanggal: Date;
  items: { namaJenis: string; berat: number; hargaPerKg: number; subtotal: number }[];
  total: number;
  saldo: number;
};

export function sendSetoranEmail(data: EmailSetoran) {
  const barisItem = data.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.namaJenis)}</td>
          <td>${item.berat} kg</td>
          <td>${formatRupiah(item.hargaPerKg)}</td>
          <td>${formatRupiah(item.subtotal)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <p>Halo ${escapeHtml(data.nama)},</p>
    <p>Setoran sampah Anda pada ${formatTanggal(data.tanggal)} sudah tercatat.</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Jenis</th><th>Berat</th><th>Harga/kg</th><th>Subtotal</th></tr>
      ${barisItem}
    </table>
    <p>Total setoran: <b>${formatRupiah(data.total)}</b></p>
    <p>Saldo Anda sekarang: <b>${formatRupiah(data.saldo)}</b></p>
    <p>Terima kasih sudah memilah sampah.<br/>Bank Sampah</p>`;

  return kirimEmail(data.email, "Setoran sampah Anda sudah tercatat", html);
}

type EmailStatusPenarikan = {
  email: string;
  nama: string;
  jumlah: number;
  metode: MetodePenarikan;
  disetujui: boolean;
  saldo: number;
  catatan?: string;
};

export function sendPenarikanStatusEmail(data: EmailStatusPenarikan) {
  const metode = data.metode === "TUNAI" ? "tunai" : "e-wallet";
  const status = data.disetujui ? "disetujui" : "ditolak";
  const catatan = data.catatan ? `<p>Catatan petugas: ${escapeHtml(data.catatan)}</p>` : "";

  const html = `
    <p>Halo ${escapeHtml(data.nama)},</p>
    <p>Pengajuan penarikan saldo sebesar <b>${formatRupiah(data.jumlah)}</b> (${metode}) <b>${status}</b>.</p>
    ${catatan}
    <p>Saldo Anda sekarang: <b>${formatRupiah(data.saldo)}</b></p>
    <p>Bank Sampah</p>`;

  return kirimEmail(data.email, `Penarikan saldo ${status}`, html);
}
