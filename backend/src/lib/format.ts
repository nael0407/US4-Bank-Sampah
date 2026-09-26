const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatRupiah(jumlah: number) {
  return rupiahFormatter.format(jumlah);
}

export function formatTanggal(tanggal: Date) {
  return tanggalFormatter.format(tanggal);
}

export function escapeHtml(teks: string) {
  return teks
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
