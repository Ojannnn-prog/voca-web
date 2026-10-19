/**
 * Generator Kredensial Akun Anggota VOCA, Nomor Tagihan & Kode Transaksi
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

export function generateTransactionCode(sequenceNumber: number, date?: Date) {
  const now = date || new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `TRX-${yearMonth}-${String(sequenceNumber).padStart(3, "0")}`;
}

/**
 * Mencari urutan berikutnya yang aman dan dijamin unik (anti-tabrakan / anti-duplicate-key)
 */
export function getSafeNextMemberSequence(existingMembers: { memberId?: string; username?: string | null }[]): number {
  let maxSeq = 0;
  for (const m of existingMembers) {
    if (m.memberId) {
      const match = m.memberId.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
    if (m.username) {
      const match = m.username.match(/membervoca\d+(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
  }
  return Math.max(maxSeq + 1, existingMembers.length + 1);
}

export function getSafeNextInvoiceSequence(existingInvoices: { invoiceNumber?: string }[]): number {
  let maxSeq = 0;
  for (const inv of existingInvoices) {
    if (inv.invoiceNumber) {
      const match = inv.invoiceNumber.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
  }
  return Math.max(maxSeq + 1, existingInvoices.length + 1);
}

export function getSafeNextTransactionSequence(existingTransactions: { transactionCode?: string }[]): number {
  let maxSeq = 0;
  for (const trx of existingTransactions) {
    if (trx.transactionCode) {
      const match = trx.transactionCode.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
    }
  }
  return Math.max(maxSeq + 1, existingTransactions.length + 1);
}
