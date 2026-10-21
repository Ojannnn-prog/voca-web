import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySystemUserSessionToken, verifyMemberSessionToken } from "@/lib/auth-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    const sysUser = await verifySystemUserSessionToken(adminSession?.value);
    const verifiedMemberId = await verifyMemberSessionToken(memberSession?.value);

    const isAdmin = sysUser?.role === "admin";
    const isStaff = sysUser?.role === "staff";
    const isCoach = sysUser?.role === "coach";

    return NextResponse.json({
      isAuthenticated: Boolean(sysUser || verifiedMemberId),
      isAdmin,
      isStaff,
      isCoach,
      role: sysUser ? sysUser.role : verifiedMemberId ? "member" : null,
      user: sysUser
        ? {
            userId: sysUser.userId,
            username: sysUser.username,
            fullName: sysUser.fullName,
            role: sysUser.role,
            coachCode: sysUser.coachCode || null,
            specialty: sysUser.specialty || null,
          }
        : null,
      isMember: Boolean(verifiedMemberId),
      memberIdentifier: verifiedMemberId || null,
    });
  } catch {
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      isStaff: false,
      isCoach: false,
      role: null,
      user: null,
      isMember: false,
      memberIdentifier: null,
    });
  }
}
