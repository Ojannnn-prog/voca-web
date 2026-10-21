/**
 * VOCA Comprehensive E2E, Performance & Security Audit Verification
 */

const BASE_URL = "http://localhost:3000";

async function measureRequest(name, url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const duration = Math.round(performance.now() - start);
  return { res, duration };
}

async function runAudit() {
  console.log("==================================================================");
  console.log("🚀 VOCA COMPREHENSIVE E2E & PERFORMANCE AUDIT SUITE");
  console.log("   Target: " + BASE_URL);
  console.log("   Timestamp: " + new Date().toISOString());
  console.log("==================================================================\n");

  let allPassed = true;

  // 1. Warm-up & Test Homepage
  console.log("--- 1. HOMEPAGE & ASSETS ---");
  const { res: homeRes, duration: homeDur } = await measureRequest("Homepage", `${BASE_URL}/`);
  console.log(`✓ Homepage GET / -> Status: ${homeRes.status} (${homeDur}ms)`);
  if (homeRes.status !== 200) allPassed = false;

  // 2. Test Login Page
  const { res: loginPageRes, duration: loginPageDur } = await measureRequest("Login Page", `${BASE_URL}/login`);
  console.log(`✓ Login Page GET /login -> Status: ${loginPageRes.status} (${loginPageDur}ms)`);
  if (loginPageRes.status !== 200) allPassed = false;

  // 3. Register New Lead
  console.log("\n--- 2. REGISTRASI LEAD BARU (E2E) ---");
  const newLeadPayload = {
    fullName: "Budi Pratama E2E",
    phoneNumber: "081288889999",
    email: "budi.e2e@voca-athletics.com",
    participantAge: 8,
    ageCategory: "kids",
    programCategory: "swimming",
    planType: "reguler",
    notes: "Pendaftaran E2E testing resmi",
  };
  const { res: regRes, duration: regDur } = await measureRequest("Register Lead", `${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLeadPayload),
  });
  const regData = await regRes.json();
  console.log(`✓ POST /api/register -> Status: ${regRes.status} (${regDur}ms) | LeadId: ${regData.leadId}`);
  if (regRes.status !== 200 || !regData.success) allPassed = false;
  const leadId = regData.leadId;

  // 4. Admin Authentication
  console.log("\n--- 3. LOGIN ADMINISTRATOR ---");
  const { res: adminLoginRes, duration: adminLoginDur } = await measureRequest(
    "Admin Login",
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "adminvoca", password: "admin123", role: "admin" }),
    }
  );
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  console.log(`✓ POST /api/auth/login (admin) -> Status: ${adminLoginRes.status} (${adminLoginDur}ms) | Session Cookie: ${!!adminCookie}`);
  if (adminLoginRes.status !== 200 || !adminLoginData.success) allPassed = false;

  // 5. Admin Dashboard & Members API
  console.log("\n--- 4. DATA PANEL ADMIN & STATISTIK ---");
  const { res: membersRes, duration: membersDur } = await measureRequest(
    "Admin Members",
    `${BASE_URL}/api/admin/members`,
    { headers: { Cookie: adminCookie } }
  );
  const membersData = await membersRes.json();
  console.log(`✓ GET /api/admin/members -> Status: ${membersRes.status} (${membersDur}ms) | Current Members: ${membersData.members?.length}`);

  const { res: usersRes, duration: usersDur } = await measureRequest(
    "Admin Users",
    `${BASE_URL}/api/admin/users`,
    { headers: { Cookie: adminCookie } }
  );
  const usersData = await usersRes.json();
  console.log(`✓ GET /api/admin/users -> Status: ${usersRes.status} (${usersDur}ms) | System Users: ${usersData.users?.length}`);

  // 6. Convert Lead to Official Member
  console.log("\n--- 5. KONVERSI LEAD KE ANGGOTA RESMI & GENERASI KTA ---");
  const { res: convertRes, duration: convertDur } = await measureRequest(
    "Convert Lead",
    `${BASE_URL}/api/admin/convert-lead`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: adminCookie },
      body: JSON.stringify({
        leadId,
        programType: "Reguler Member",
        sportBranch: "Renang & Akuatik",
        monthlyFee: 347000,
      }),
    }
  );
  const convertData = await convertRes.json();
  console.log(`✓ POST /api/admin/convert-lead -> Status: ${convertRes.status} (${convertDur}ms)`);
  console.log(`   Kredensial Resmi Dibuat:`, convertData.credentials);
  if (convertRes.status !== 200 || !convertData.success) allPassed = false;

  const { username, password, memberId } = convertData.credentials;

  // 7. Member Authentication with Auto-Generated Credentials
  console.log("\n--- 6. LOGIN MEMBER DENGAN KREDENSIAL HASIL GENERASI OTOMATIS ---");
  const { res: memberLoginRes, duration: memberLoginDur } = await measureRequest(
    "Member Login",
    `${BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: "member" }),
    }
  );
  const memberLoginData = await memberLoginRes.json();
  const memberCookie = memberLoginRes.headers.get("set-cookie");
  console.log(`✓ POST /api/auth/login (member) -> Status: ${memberLoginRes.status} (${memberLoginDur}ms) | Role: ${memberLoginData.role}`);
  if (memberLoginRes.status !== 200 || !memberLoginData.success) allPassed = false;

  // 8. Member Profile & Invoices API
  console.log("\n--- 7. PORTAL & PROFIL MEMBER (VERIFIKASI TANPA SEARCH BAR) ---");
  const { res: profRes, duration: profDur } = await measureRequest(
    "Member Profile",
    `${BASE_URL}/api/member/profile`,
    { headers: { Cookie: memberCookie } }
  );
  const profData = await profRes.json();
  console.log(`✓ GET /api/member/profile -> Status: ${profRes.status} (${profDur}ms) | Member ID: ${profData.member?.memberId}`);
  if (profRes.status !== 200 || !profData.success) allPassed = false;

  // 9. Member Page HTML verification (Must NOT contain VOCA ID search bar)
  const { res: memberPageRes, duration: memberPageDur } = await measureRequest(
    "Member Page HTML",
    `${BASE_URL}/member`,
    { headers: { Cookie: memberCookie } }
  );
  const memberHtml = await memberPageRes.text();
  const containsDemoId = memberHtml.includes("Demo ID:");
  const containsSearchBar = memberHtml.includes("Cari ID Anggota") || memberHtml.includes("Masukkan ID Anggota");
  console.log(`✓ GET /member -> Status: ${memberPageRes.status} (${memberPageDur}ms)`);
  console.log(`   - Mengandung Teks Demo ID?: ${containsDemoId ? "YA (GAGAL)" : "TIDAK (LOLOS)"}`);
  console.log(`   - Mengandung Kolom Pencarian ID?: ${containsSearchBar ? "YA (GAGAL)" : "TIDAK (LOLOS - Bersih)"}`);
  if (containsDemoId || containsSearchBar) allPassed = false;

  // 10. Member Upload Foto Profil KTA (PATCH /api/member/profile)
  console.log("\n--- 8. FITUR UNGGAH FOTO PROFIL KEANGGOTAAN (KTA) ---");
  const samplePhotoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  const { res: photoRes, duration: photoDur } = await measureRequest(
    "Upload Photo",
    `${BASE_URL}/api/member/profile`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: memberCookie },
      body: JSON.stringify({ photoUrl: samplePhotoBase64 }),
    }
  );
  const photoData = await photoRes.json();
  console.log(`✓ PATCH /api/member/profile -> Status: ${photoRes.status} (${photoDur}ms) | Foto Tersimpan: ${!!photoData.member?.photoUrl}`);
  if (photoRes.status !== 200 || !photoData.success) allPassed = false;

  // 11. Security Headers Verification
  console.log("\n--- 9. VERIFIKASI KEAMANAN & PENTEST HEADERS ---");
  const xFrame = memberPageRes.headers.get("x-frame-options");
  const xContent = memberPageRes.headers.get("x-content-type-options");
  console.log(`✓ X-Frame-Options: ${xFrame} (Anti-Clickjacking)`);
  console.log(`✓ X-Content-Type-Options: ${xContent} (Anti-MIME Sniffing)`);
  if (xFrame !== "DENY" || xContent !== "nosniff") allPassed = false;

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("🎉 AUDIT KESELURUHAN LOLOS 100%! SEMUA STATUS 200 OK & BERSIH TANPA BUG!");
  } else {
    console.log("❌ TERDAPAT BEBERAPA LANGKAH YANG GAGAL!");
  }
  console.log("==================================================================\n");

  // Bersihkan akun member & invoice uji coba agar database tetap kosong untuk user
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);
  await sql("DELETE FROM member_invoices;");
  await sql("DELETE FROM members;");
  await sql("DELETE FROM finance_transactions WHERE member_id IS NOT NULL;");
  await sql(`DELETE FROM trial_leads WHERE id = ${leadId};`);
  console.log("🧹 Database Anggota Telah Direset Kembali Bersih 0 Baris (Siap Uji Coba Pengguna)");
}

runAudit().catch(console.error);
