/**
 * Generator Kredensial Akun Anggota VOCA & Nomor Tagihan
 *
 * Ketentuan Sesuai Instruksi:
 * 1. Username: "membervoca<YEAR><x>"
 *    - member = level user (anggota)
 *    - voca = nama klub (VOCA)
 *    - YEAR = tahun registrasi user (contoh: 2026, jika 2027 maka 2027)
 *    - x = nomor urut pendaftaran tanpa leading zero (1, 2, 3, dst.)
 * 2. Password: "vocamember<YEAR>"
 *    - password serempak otomatis sesuai tahun (contoh: vocamember2026)
 */

export function generateMemberCredentials(sequenceNumber: number, year?: number) {
  const currentYear = year || new Date().getFullYear();
  const username = `membervoca${currentYear}${sequenceNumber}`;
  const password = `vocamember${currentYear}`;
  const memberId = `VOCA-${currentYear}-${String(sequenceNumber).padStart(3, "0")}`;

  return {
    username,
    password,
    memberId,
    year: currentYear,
    sequence: sequenceNumber,
  };
}

export function generateInvoiceCode(sequenceNumber: number, date?: Date) {
  const now = date || new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `INV-${yearMonth}-${String(sequenceNumber).padStart(3, "0")}`;
}
