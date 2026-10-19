import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("voca_admin_session");
    const memberSession = cookieStore.get("voca_member_session");

    return NextResponse.json({
      isAdmin: adminSession?.value === "authenticated_admin",
      isMember: Boolean(memberSession?.value),
      memberIdentifier: memberSession?.value || null,
    });
  } catch (error) {
    return NextResponse.json({
      isAdmin: false,
      isMember: false,
      memberIdentifier: null,
    });
  }
}
