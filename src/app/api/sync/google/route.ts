import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsSyncService } from "@/lib/integrations/google/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerId = body.customerId || "938-201-9481";
    const clientId = body.clientId || "c0000000-0000-0000-0000-000000000001";
    const sinceDate = body.sinceDate || "2026-09-23";
    const untilDate = body.untilDate || "2026-09-27";

    const service = new GoogleAdsSyncService();
    const result = await service.syncCustomerMetrics(customerId, clientId, sinceDate, untilDate);

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
