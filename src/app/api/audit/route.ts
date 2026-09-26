import { NextRequest, NextResponse } from "next/server";
import { auditLogger } from "@/lib/security/audit-logger";
import { apiRateLimiter } from "@/lib/security/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "system_client";
    const rateCheck = apiRateLimiter.check(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Rate limit exceeded.", resetAt: rateCheck.resetAt },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get("agencyId") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const logs = auditLogger.getLogs(agencyId, isNaN(limit) ? 50 : limit);

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
      rateLimit: {
        remaining: rateCheck.remaining,
        limit: rateCheck.limit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "system_client";
    const rateCheck = apiRateLimiter.check(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Rate limit exceeded.", resetAt: rateCheck.resetAt },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { agencyId, userId, action, resourceType, resourceId, metadata } = body;

    if (!agencyId || !action || !resourceType) {
      return NextResponse.json(
        { error: "agencyId, action, and resourceType are required" },
        { status: 400 }
      );
    }

    const entry = auditLogger.log({
      agencyId,
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
    });

    return NextResponse.json({
      success: true,
      log: entry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
