import { NextRequest, NextResponse } from "next/server";
import { MetaSyncService } from "@/lib/integrations/meta/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId || "act_4920194820";
    const clientId = body.clientId || "c0000000-0000-0000-0000-000000000001";
    const sinceDate = body.sinceDate || "2026-09-23";
    const untilDate = body.untilDate || "2026-09-27";

    const service = new MetaSyncService();
    const result = await service.syncAccountInsights(accountId, clientId, sinceDate, untilDate);

    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
