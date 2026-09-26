import { NextRequest, NextResponse } from "next/server";
import { attributionEngine } from "@/lib/attribution/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { leadId, campaignId, treatmentId } = body;

    if (!leadId || !campaignId || !treatmentId) {
      return NextResponse.json(
        { error: "leadId, campaignId, and treatmentId are required" },
        { status: 400 }
      );
    }

    const resolvedJourney = attributionEngine.resolveQuarantinedLead(
      leadId,
      campaignId,
      treatmentId
    );

    return NextResponse.json({
      success: true,
      message: `Lead ${leadId} successfully attributed to campaign ${campaignId}. Downstream conversions retroactively linked.`,
      resolvedJourney,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
