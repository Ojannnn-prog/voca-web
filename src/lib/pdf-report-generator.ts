/**
 * VOCA Athletic Community - Official Report & PDF Generator
 * Menghasilkan dokumen laporan berstandar akuntansi & organisasi resmi
 * dengan Kop Surat VOCA, tata letak A4 presisi, dan lembar pengesahan.
 */

export interface FinancialTrxItem {
  id: number;
  transactionCode: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  memberId?: string | null;
  paymentMethod: string;
  description: string;
  transactionDate: string;
  createdByUser: string;
}

export interface MemberReportItem {
  id: number;
  memberId: string;
  fullName: string;
  phoneNumber: string;
  participantAge: number | null;
  ageCategory: string | null;
  programType: string | null;
  sportBranch: string | null;
  monthlyFee: number;
  status: string;
  validUntil: string | null;
  joinDate: string | null;
  emergencyContact?: string | null;
}

export interface StaffReportItem {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string | null;
  phoneNumber: string | null;
  specialty: string | null;
  status: string;
  createdAt: string;
}

const KOP_SURAT_HTML = `
  <div style="border-bottom: 3px double #111; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 14px;">
      <div style="width: 60px; height: 60px; background: #5E17EB; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 22px; letter-spacing: -1px;">
        VOCA
      </div>
      <div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #111; text-transform: uppercase;">
          VORTEX COMMUNITY OF ATHLETICS (VOCA)
        </h1>
        <p style="margin: 2px 0 0 0; font-size: 11px; color: #555; font-weight: 600;">
          Akademi Pembinaan Renang, Stimulasi Motorik & Kebugaran Jasmani
        </p>
        <p style="margin: 2px 0 0 0; font-size: 10px; color: #777;">
          Sekretariat Pusat VOCA Club • WhatsApp Admin: 0812-3456-7890 • Didirikan: 10.10.26
        </p>
      </div>
    </div>
    <div style="text-align: right; font-size: 10px; color: #444; border-left: 2px solid #eee; padding-left: 12px;">
      <p style="margin: 0; font-weight: bold; color: #5E17EB;">DOKUMEN RESMI</p>
      <p style="margin: 2px 0 0 0;">Sistem Manajemen Klub</p>
    </div>
  </div>
`;

function triggerPrintWindow(title: string, bodyContent: string) {
  const printWin = window.open("", "_blank", "width=1050,height=800");
  if (!printWin) {
    alert("Popup diblokir oleh browser. Izinkan popup untuk mencetak laporan PDF.");
    return;
  }

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm 1.2cm 1.5cm 1.2cm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 14px 0;
            font-size: 10px;
          }
          th {
            background-color: #f3f4f6;
            color: #1f2937;
            font-weight: 700;
            text-align: left;
            padding: 7px 8px;
            border: 1px solid #d1d5db;
          }
          td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .kpi-card {
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 8px;
            padding: 10px 14px;
            flex: 1;
          }
          .kpi-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 3px;
          }
          .kpi-value {
            font-size: 14px;
            font-weight: 800;
            color: #111827;
          }
          .signatures {
            margin-top: 35px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sign-box {
            width: 200px;
            text-align: center;
          }
          .sign-line {
            margin-top: 55px;
            border-top: 1px solid #333;
            padding-top: 4px;
            font-weight: bold;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; padding: 10px 14px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #4338ca; font-weight: bold;">Dokumen siap dicetak atau disimpan sebagai PDF</span>
          <button onclick="window.print()" style="background: #5E17EB; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
        ${KOP_SURAT_HTML}
        ${bodyContent}
      </body>
    </html>
  `;

  printWin.document.open();
  printWin.document.write(fullHtml);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
  }, 400);
}

// 1. Export Laporan Keuangan Rinci (Harian, Bulanan, Semester, Tahunan)
export function exportFinancialReportPdf({
  transactions,
  periodTitle,
  summary,
  printedBy = "adminvoca",
}: {
  transactions: FinancialTrxItem[];
  periodTitle: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
  };
  printedBy?: string;
}) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Urutkan transaksi ascending untuk menghitung running balance transparan
  const sortedTrx = [...transactions].sort(
    (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
  );

  let runningBalance = 0;
  const rowsHtml = sortedTrx
    .map((t, idx) => {
      const isIncome = t.type === "income";
      if (isIncome) runningBalance += t.amount;
      else runningBalance -= t.amount;

      const dateStr = new Date(t.transactionDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `
        <tr>
          <td style="text-align: center; width: 25px;">${idx + 1}</td>
          <td style="font-family: monospace; font-size: 9px; font-weight: bold; width: 100px;">${t.transactionCode}</td>
          <td style="width: 75px;">${dateStr}</td>
          <td style="width: 120px; font-weight: 600;">${t.category}</td>
          <td>
            <div style="font-weight: 600; color: #111;">${t.description}</div>
            <div style="font-size: 8.5px; color: #6b7280; margin-top: 1px;">
              Metode: ${t.paymentMethod} • PIC: ${t.createdByUser || printedBy}
            </div>
          </td>
          <td style="text-align: right; width: 85px; color: #059669; font-weight: bold;">
            ${isIncome ? "Rp " + t.amount.toLocaleString("id-ID") : "-"}
          </td>
          <td style="text-align: right; width: 85px; color: #e11d48; font-weight: bold;">
            ${!isIncome ? "Rp " + t.amount.toLocaleString("id-ID") : "-"}
          </td>
          <td style="text-align: right; width: 95px; font-weight: 800; background-color: #fafafa;">
            Rp ${runningBalance.toLocaleString("id-ID")}
          </td>
        </tr>
      `;
    })
    .join("");

  const content = `
    <div style="text-align: center; margin-bottom: 18px;">
      <h2 style="margin: 0; font-size: 15px; font-weight: 800; letter-spacing: -0.3px; text-transform: uppercase;">
        LAPORAN AUDIT & ARUS KAS KEUANGAN KLUB
      </h2>
      <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 600; color: #5E17EB;">
        ${periodTitle.toUpperCase()}
      </p>
      <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #6b7280;">
        Waktu Cetak: ${currentDate} • Petugas Cetak: @${printedBy}
      </p>
    </div>

    <!-- Ringkasan Eksekutif Finansial -->
    <div style="display: flex; gap: 10px; margin-bottom: 14px;">
      <div class="kpi-card" style="border-left: 4px solid #10b981;">
        <div class="kpi-title">Total Pemasukan Kas</div>
        <div class="kpi-value" style="color: #059669;">Rp ${summary.totalIncome.toLocaleString("id-ID")}</div>
        <div style="font-size: 8.5px; color: #6b7280; margin-top: 2px;">Iuran member & dana masuk</div>
      </div>
      <div class="kpi-card" style="border-left: 4px solid #f43f5e;">
        <div class="kpi-title">Total Pengeluaran Kas</div>
        <div class="kpi-value" style="color: #e11d48;">Rp ${summary.totalExpense.toLocaleString("id-ID")}</div>
        <div style="font-size: 8.5px; color: #6b7280; margin-top: 2px;">Sewa venue, honor pelatih, alat</div>
      </div>
      <div class="kpi-card" style="border-left: 4px solid #5E17EB;">
        <div class="kpi-title">Saldo Akhir Berjalan</div>
        <div class="kpi-value" style="color: #5E17EB;">Rp ${summary.currentBalance.toLocaleString("id-ID")}</div>
        <div style="font-size: 8.5px; color: #6b7280; margin-top: 2px;">Posisi kas saat ini</div>
      </div>
    </div>

    <!-- Tabel Rincian Keuangan Transparan -->
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Kode Trx</th>
          <th>Tanggal</th>
          <th>Kategori</th>
          <th>Uraian Penggunaan Dana (Dipergunakan untuk apa & bagaimana)</th>
          <th style="text-align: right;">Masuk (Debet)</th>
          <th style="text-align: right;">Keluar (Kredit)</th>
          <th style="text-align: right;">Saldo Berjalan</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #9ca3af;">Tidak ada transaksi pada periode ini.</td></tr>'}
      </tbody>
      <tfoot>
        <tr style="background: #f3f4f6; font-weight: bold;">
          <td colspan="5" style="text-align: right; padding: 8px;">TOTAL PERIODE INI:</td>
          <td style="text-align: right; color: #059669;">Rp ${summary.totalIncome.toLocaleString("id-ID")}</td>
          <td style="text-align: right; color: #e11d48;">Rp ${summary.totalExpense.toLocaleString("id-ID")}</td>
          <td style="text-align: right; color: #5E17EB;">Rp ${summary.currentBalance.toLocaleString("id-ID")}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Lembar Tanda Tangan Resmi Pengesahan -->
    <div class="signatures">
      <div class="sign-box">
        <p style="margin: 0; color: #555;">Dibuat dan Diperiksa Oleh,</p>
        <p style="margin: 2px 0 0 0; font-weight: 600;">Bendahara Keuangan VOCA</p>
        <div class="sign-line">Admin Keuangan VOCA</div>
      </div>
      <div class="sign-box">
        <p style="margin: 0; color: #555;">Mengetahui & Menyetujui,</p>
        <p style="margin: 2px 0 0 0; font-weight: 600;">Ketua Umum / Head Coach VOCA</p>
        <div class="sign-line">Dewan Pengurus VOCA</div>
      </div>
    </div>
  `;

  triggerPrintWindow(`Laporan_Keuangan_VOCA_${periodTitle.replace(/\s+/g, "_")}`, content);
}

// 2. Export Laporan Anggota / Peserta Lengkap (Biodata, Kelas, Usia, Kontak)
export function exportMembersReportPdf({
  members,
  printedBy = "adminvoca",
}: {
  members: MemberReportItem[];
  printedBy?: string;
}) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeCount = members.filter((m) => m.status === "active").length;
  const inactiveCount = members.length - activeCount;

  // Hitung jumlah per kategori
  const toddlerCount = members.filter((m) => (m.participantAge || 0) <= 4).length;
  const kidsCount = members.filter((m) => (m.participantAge || 0) > 4 && (m.participantAge || 0) <= 12).length;
  const juniorCount = members.filter((m) => (m.participantAge || 0) > 12 && (m.participantAge || 0) <= 17).length;
  const adultCount = members.filter((m) => (m.participantAge || 0) >= 18).length;

  const rowsHtml = members
    .map((m, idx) => {
      const validUntilStr = m.validUntil
        ? new Date(m.validUntil).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-";

      return `
        <tr>
          <td style="text-align: center; width: 25px;">${idx + 1}</td>
          <td style="font-family: monospace; font-size: 9px; font-weight: bold; width: 90px; color: #5E17EB;">${m.memberId}</td>
          <td>
            <div style="font-weight: bold; color: #111;">${m.fullName}</div>
            <div style="font-size: 8.5px; color: #6b7280;">Kontak: ${m.phoneNumber} ${m.emergencyContact ? `(Darurat: ${m.emergencyContact})` : ""}</div>
          </td>
          <td style="width: 90px;">
            <span style="font-weight: 600;">${m.participantAge ? m.participantAge + " Tahun" : "-"}</span>
            <div style="font-size: 8.5px; color: #6b7280; text-transform: capitalize;">${m.ageCategory || "-"}</div>
          </td>
          <td style="width: 130px;">
            <div style="font-weight: 600;">${m.programType || "Reguler"}</div>
            <div style="font-size: 8.5px; color: #6b7280;">${m.sportBranch || "Renang"}</div>
          </td>
          <td style="text-align: right; width: 85px; font-weight: bold;">
            Rp ${m.monthlyFee.toLocaleString("id-ID")}
          </td>
          <td style="width: 80px; font-size: 9px;">${validUntilStr}</td>
          <td style="width: 60px; text-align: center;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; font-weight: bold; ${
              m.status === "active" ? "background: #dcfce7; color: #15803d;" : "background: #f3f4f6; color: #4b5563;"
            }">
              ${m.status === "active" ? "AKTIF" : "NONAKTIF"}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  const content = `
    <div style="text-align: center; margin-bottom: 18px;">
      <h2 style="margin: 0; font-size: 15px; font-weight: 800; letter-spacing: -0.3px; text-transform: uppercase;">
        LAPORAN DATA ANGGOTA & ATLET RESMI KLUB VOCA
      </h2>
      <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 600; color: #5E17EB;">
        BIODATA LENGKAP, KELAS PEMBINAAN & STATUS KEANGGOTAAN
      </p>
      <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #6b7280;">
        Waktu Cetak: ${currentDate} • Petugas: @${printedBy}
      </p>
    </div>

    <!-- Ringkasan Statistik Peserta -->
    <div style="display: flex; gap: 8px; margin-bottom: 14px;">
      <div class="kpi-card" style="border-left: 3px solid #5E17EB;">
        <div class="kpi-title">Total Anggota Terdaftar</div>
        <div class="kpi-value">${members.length} Peserta</div>
        <div style="font-size: 8.5px; color: #15803d; font-weight: bold; margin-top: 1px;">${activeCount} Aktif (${inactiveCount} Nonaktif)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Balita (1 - 4 Th)</div>
        <div class="kpi-value">${toddlerCount} Anak</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Anak (5 - 12 Th)</div>
        <div class="kpi-value">${kidsCount} Anak</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Remaja (13 - 17 Th)</div>
        <div class="kpi-value">${juniorCount} Remaja</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Dewasa / Casis (18+)</div>
        <div class="kpi-value">${adultCount} Peserta</div>
      </div>
    </div>

    <!-- Tabel Biodata Lengkap -->
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>ID Member</th>
          <th>Nama Atlet / Peserta & Kontak</th>
          <th>Usia / Kelompok</th>
          <th>Program & Cabang</th>
          <th style="text-align: right;">Iuran Bulanan</th>
          <th>Masa Aktif</th>
          <th style="text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #9ca3af;">Belum ada data anggota.</td></tr>'}
      </tbody>
    </table>

    <div class="signatures">
      <div class="sign-box">
        <p style="margin: 0; color: #555;">Staf Administrasi Keanggotaan,</p>
        <div class="sign-line">Admin VOCA</div>
      </div>
      <div class="sign-box">
        <p style="margin: 0; color: #555;">Mengetahui & Mengesahkan,</p>
        <div class="sign-line">Head Coach VOCA</div>
      </div>
    </div>
  `;

  triggerPrintWindow("Laporan_Anggota_VOCA", content);
}

// 3. Export Laporan Staf & Pelatih (Kelola User)
export function exportStaffReportPdf({
  users,
  printedBy = "adminvoca",
}: {
  users: StaffReportItem[];
  printedBy?: string;
}) {
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rowsHtml = users
    .map((u, idx) => {
      const joinStr = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-";

      return `
        <tr>
          <td style="text-align: center; width: 25px;">${idx + 1}</td>
          <td>
            <div style="font-weight: bold; color: #111;">${u.fullName}</div>
            <div style="font-family: monospace; font-size: 9px; color: #5E17EB;">@${u.username}</div>
          </td>
          <td style="width: 100px;">
            <span style="font-weight: 700; text-transform: uppercase; color: ${u.role === "admin" ? "#5E17EB" : "#2563eb"};">
              ${u.role}
            </span>
          </td>
          <td style="width: 140px;">${u.specialty || "Pelatih Atletik / Staf"}</td>
          <td>
            <div>${u.phoneNumber || "-"}</div>
            <div style="font-size: 8.5px; color: #6b7280;">${u.email || "-"}</div>
          </td>
          <td style="width: 70px; text-align: center;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; font-weight: bold; background: #dcfce7; color: #15803d;">
              ${u.status.toUpperCase()}
            </span>
          </td>
          <td style="width: 80px; font-size: 9px;">${joinStr}</td>
        </tr>
      `;
    })
    .join("");

  const content = `
    <div style="text-align: center; margin-bottom: 18px;">
      <h2 style="margin: 0; font-size: 15px; font-weight: 800; letter-spacing: -0.3px; text-transform: uppercase;">
        DAFTAR PENGGUNA SISTEM, STAF ADMINISTRASI & PELATIH VOCA
      </h2>
      <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 600; color: #5E17EB;">
        STRUKTUR TIM MANAJEMEN, KEPELATIHAN & OTORITAS AKSES
      </p>
      <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #6b7280;">
        Waktu Cetak: ${currentDate} • Dicetak Oleh: @${printedBy}
      </p>
    </div>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Lengkap & Akun</th>
          <th>Peran (Role)</th>
          <th>Bidang Spesialisasi</th>
          <th>Kontak Telepon / Email</th>
          <th style="text-align: center;">Status</th>
          <th>Terdaftar</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #9ca3af;">Belum ada data staf/pelatih.</td></tr>'}
      </tbody>
    </table>

    <div class="signatures">
      <div class="sign-box">
        <p style="margin: 0; color: #555;">Dibuat Oleh,</p>
        <div class="sign-line">Administrator Sistem</div>
      </div>
      <div class="sign-box">
        <p style="margin: 0; color: #555;">Disahkan Oleh,</p>
        <div class="sign-line">Ketua Komunitas VOCA</div>
      </div>
    </div>
  `;

  triggerPrintWindow("Laporan_Staf_Pelatih_VOCA", content);
}
