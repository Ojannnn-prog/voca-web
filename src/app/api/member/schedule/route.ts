import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { trainingClasses, classRoster } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyMemberSessionToken } from "@/lib/auth-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const memberSession = cookieStore.get("voca_member_session");
    const memberId = await verifyMemberSessionToken(memberSession?.value);

    if (!memberId) {
      return NextResponse.json({ error: "Sesi anggota tidak sah." }, { status: 401 });
    }

    // Cari roster kelas siswa
    const rosterEntries = await db
      .select()
      .from(classRoster)
      .where(eq(classRoster.memberId, memberId));

    if (rosterEntries.length === 0) {
      return NextResponse.json({
        success: true,
        enrolled: false,
        message: "Belum terdaftar dalam jadwal kelas. Silakan hubungi admin.",
      });
    }

    const roster = rosterEntries[0];
    const [trainingClass] = await db
      .select()
      .from(trainingClasses)
      .where(eq(trainingClasses.id, roster.classId));

    if (!trainingClass) {
      return NextResponse.json({
        success: true,
        enrolled: false,
        message: "Kelas belum aktif.",
      });
    }

    return NextResponse.json({
      success: true,
      enrolled: true,
      classInfo: trainingClass,
      roster,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
