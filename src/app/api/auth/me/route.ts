import { NextRequest, NextResponse } from "next/server";
import { PRECONFIGURED_USERS } from "@/lib/auth/users";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("adfunnel_session")?.value;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      return NextResponse.json({ authenticated: true, user: parsed });
    } catch {
      // Fallback
    }
  }

  // Default to Super Admin for smooth preview
  return NextResponse.json({
    authenticated: true,
    user: PRECONFIGURED_USERS[0],
    isDefault: true,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("adfunnel_session");
  return response;
}
