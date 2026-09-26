import { NextRequest, NextResponse } from "next/server";
import { runNightlyGhlReconciliation } from "@/lib/integrations/ghl/reconciler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const locationId = body.locationId || "loc_aura_nyc_01";
    const clientId = body.clientId || "c0000000-0000-0000-0000-000000000001";
    const windowDays = body.windowDays || 14;

    const report = await runNightlyGhlReconciliation(locationId, clientId, windowDays);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
