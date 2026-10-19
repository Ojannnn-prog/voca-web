import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken, verifyMemberSessionToken } from "@/lib/auth-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    const isAdmin = await verifyAdminSessionToken(adminSession?.value);
    const verifiedMemberId = await verifyMemberSessionToken(memberSession?.value);

    return NextResponse.json({
      isAdmin,
      isMember: Boolean(verifiedMemberId),
      memberIdentifier: verifiedMemberId || null,
    });
  } catch (error) {
    return NextResponse.json({
      isAdmin: false,
      isMember: false,
      memberIdentifier: null,
    });
  }
}
