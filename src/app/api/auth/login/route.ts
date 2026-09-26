import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/users";
import { auditLogger } from "@/lib/security/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = authenticateUser(email, password);

    if (!user) {
      auditLogger.log({
        agencyId: "system",
        action: "auth.login_failed",
        resourceType: "user_session",
        metadata: { attemptedEmail: email },
      });
      return NextResponse.json(
        { error: "Invalid email or password. Use preconfigured demo credentials." },
        { status: 401 }
      );
    }

    auditLogger.log({
      agencyId: user.agencyId,
      userId: user.id,
      action: "auth.login_success",
      resourceType: "user_session",
      metadata: { role: user.role, email: user.email },
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: `Welcome back, ${user.fullName}!`,
    });

    // Set auth cookie
    response.cookies.set("adfunnel_session", JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
