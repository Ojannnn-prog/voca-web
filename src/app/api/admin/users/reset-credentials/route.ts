import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { systemUsers, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySystemUserSessionToken } from "@/lib/auth-session";

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("voca_admin_session");
  const sysUser = await verifySystemUserSessionToken(session?.value);
  return sysUser && sysUser.role === "admin";
}

export async function POST(request: Request) {
  const isSuperAdmin = await verifySuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json(
      { error: "Akses ditolak: Hanya Administrator yang berhak mereset kredensial pengguna." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { targetType, targetId, newUsername, newPassword } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "Tipe pengguna (targetType) dan ID pengguna (targetId) wajib disertakan." },
        { status: 400 }
      );
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: "Minimal salah satu antara Username baru atau Password baru harus diisi." },
        { status: 400 }
      );
    }

    if (targetType === "member") {
      // Reset untuk Member
      const updateData: { username?: string; password?: string } = {};
      if (newUsername && newUsername.trim()) {
        const cleanUser = newUsername.trim().toLowerCase();
        // Cek apakah username sudah dipakai member lain
        const existing = await db
          .select()
          .from(members)
          .where(eq(members.username, cleanUser));
        if (existing.length > 0 && String(existing[0].id) !== String(targetId)) {
          return NextResponse.json(
            { error: `Username '${cleanUser}' sudah dipakai oleh anggota lain.` },
            { status: 400 }
          );
        }
        updateData.username = cleanUser;
      }

      if (newPassword && newPassword.trim()) {
        updateData.password = newPassword.trim();
      }

      const [updated] = await db
        .update(members)
        .set(updateData)
        .where(eq(members.id, parseInt(String(targetId), 10)))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: "Anggota tidak ditemukan." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Kredensial anggota ${updated.fullName} (${updated.memberId}) berhasil diperbarui oleh Administrator.`,
        user: {
          id: updated.id,
          memberId: updated.memberId,
          fullName: updated.fullName,
          username: updated.username,
        },
      });
    } else if (targetType === "system") {
      // Reset untuk Pengguna Sistem (Admin, Staf, Pelatih)
      const updateData: { username?: string; password?: string } = {};
      if (newUsername && newUsername.trim()) {
        const cleanUser = newUsername.trim().toLowerCase();
        const existing = await db
          .select()
          .from(systemUsers)
          .where(eq(systemUsers.username, cleanUser));
        if (existing.length > 0 && String(existing[0].id) !== String(targetId)) {
          return NextResponse.json(
            { error: `Username '${cleanUser}' sudah digunakan oleh staf/pelatih lain.` },
            { status: 400 }
          );
        }
        updateData.username = cleanUser;
      }

      if (newPassword && newPassword.trim()) {
        updateData.password = newPassword.trim();
      }

      const [updated] = await db
        .update(systemUsers)
        .set(updateData)
        .where(eq(systemUsers.id, parseInt(String(targetId), 10)))
        .returning();

      if (!updated) {
        return NextResponse.json({ error: "Pengguna staf/pelatih tidak ditemukan." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Kredensial ${updated.role.toUpperCase()} ${updated.fullName} berhasil diperbarui oleh Administrator.`,
        user: {
          id: updated.id,
          fullName: updated.fullName,
          username: updated.username,
          role: updated.role,
        },
      });
    } else {
      return NextResponse.json({ error: "Target type tidak valid (harus 'member' atau 'system')." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Gagal reset kredensial:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses reset kredensial." }, { status: 500 });
  }
}
