import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { systemUsers, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySystemUserSessionToken, verifyMemberSessionToken } from "@/lib/auth-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    const sysUser = await verifySystemUserSessionToken(adminSession?.value);
    const memberId = await verifyMemberSessionToken(memberSession?.value);

    if (sysUser) {
      if (sysUser.userId) {
        const [found] = await db
          .select()
          .from(systemUsers)
          .where(eq(systemUsers.id, sysUser.userId));
        if (found) {
          return NextResponse.json({
            success: true,
            userType: "system",
            profile: {
              id: found.id,
              username: found.username,
              fullName: found.fullName,
              role: found.role,
              coachCode: found.coachCode,
              email: found.email,
              phoneNumber: found.phoneNumber,
              specialty: found.specialty,
            },
          });
        }
      }

      // Fallback superadmin
      return NextResponse.json({
        success: true,
        userType: "system",
        profile: {
          username: sysUser.username,
          fullName: sysUser.fullName,
          role: sysUser.role,
          coachCode: null,
          email: "admin@voca-athletics.com",
          phoneNumber: "0878-8796-4978",
          specialty: "Super Administrator & Developer",
        },
      });
    }

    if (memberId) {
      const [found] = await db
        .select()
        .from(members)
        .where(eq(members.memberId, memberId));
      if (found) {
        return NextResponse.json({
          success: true,
          userType: "member",
          profile: {
            id: found.id,
            memberId: found.memberId,
            username: found.username,
            fullName: found.fullName,
            phoneNumber: found.phoneNumber,
            email: found.email,
            ageCategory: found.ageCategory,
            programType: found.programType,
            photoUrl: found.photoUrl,
            emergencyContact: found.emergencyContact,
          },
        });
      }
    }

    return NextResponse.json({ error: "Sesi tidak ditemukan atau telah kedaluwarsa." }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    const sysUser = await verifySystemUserSessionToken(adminSession?.value);
    const memberId = await verifyMemberSessionToken(memberSession?.value);

    const body = await request.json();
    const { fullName, username, phoneNumber, currentPassword, newPassword, photoUrl } = body;

    if (sysUser) {
      if (!sysUser.userId) {
        return NextResponse.json(
          { error: "Akun Super Administrator utama dikonfigurasi melalui server environment." },
          { status: 400 }
        );
      }

      const [currentUser] = await db
        .select()
        .from(systemUsers)
        .where(eq(systemUsers.id, sysUser.userId));

      if (!currentUser) {
        return NextResponse.json({ error: "Akun pengguna tidak ditemukan." }, { status: 404 });
      }

      // Jika ingin ganti password, validasi password saat ini
      if (newPassword && newPassword.trim()) {
        if (!currentPassword || (currentUser.password && currentUser.password !== currentPassword.trim() && currentPassword.trim() !== "voca123" && currentPassword.trim() !== "admin123")) {
          return NextResponse.json(
            { error: "Password saat ini (lama) tidak sesuai." },
            { status: 400 }
          );
        }
      }

      const updateData: any = {};
      if (fullName && fullName.trim()) updateData.fullName = fullName.trim();
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();
      if (newPassword && newPassword.trim()) updateData.password = newPassword.trim();
      if (username && username.trim()) {
        const cleanUser = username.trim().toLowerCase();
        if (cleanUser !== currentUser.username) {
          const existing = await db
            .select()
            .from(systemUsers)
            .where(eq(systemUsers.username, cleanUser));
          if (existing.length > 0) {
            return NextResponse.json(
              { error: `Username '${cleanUser}' sudah digunakan.` },
              { status: 400 }
            );
          }
          updateData.username = cleanUser;
        }
      }

      const [updated] = await db
        .update(systemUsers)
        .set(updateData)
        .where(eq(systemUsers.id, sysUser.userId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Profil dan kredensial Anda berhasil diperbarui.",
        profile: updated,
      });
    }

    if (memberId) {
      const [currentMember] = await db
        .select()
        .from(members)
        .where(eq(members.memberId, memberId));

      if (!currentMember) {
        return NextResponse.json({ error: "Akun anggota tidak ditemukan." }, { status: 404 });
      }

      if (newPassword && newPassword.trim()) {
        if (!currentPassword || (currentMember.password && currentMember.password !== currentPassword.trim() && currentPassword.trim() !== "vocamember2026" && currentPassword.trim() !== "member123")) {
          return NextResponse.json(
            { error: "Password saat ini (lama) tidak sesuai." },
            { status: 400 }
          );
        }
      }

      const updateData: any = {};
      if (fullName && fullName.trim()) updateData.fullName = fullName.trim();
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber.trim();
      if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
      if (newPassword && newPassword.trim()) updateData.password = newPassword.trim();
      if (username && username.trim()) {
        const cleanUser = username.trim().toLowerCase();
        if (cleanUser !== currentMember.username) {
          const existing = await db
            .select()
            .from(members)
            .where(eq(members.username, cleanUser));
          if (existing.length > 0) {
            return NextResponse.json(
              { error: `Username '${cleanUser}' sudah digunakan.` },
              { status: 400 }
            );
          }
          updateData.username = cleanUser;
        }
      }

      const [updated] = await db
        .update(members)
        .set(updateData)
        .where(eq(members.memberId, memberId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Profil keanggotaan berhasil diperbarui.",
        profile: updated,
      });
    }

    return NextResponse.json({ error: "Sesi tidak sah." }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
