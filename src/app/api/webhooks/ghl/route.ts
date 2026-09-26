import { NextRequest, NextResponse } from "next/server";
import { handleGhlWebhook } from "@/lib/integrations/ghl/webhook-handler";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-ghl-signature") || req.headers.get("X-GHL-Signature");

    const result = await handleGhlWebhook(rawBody, signature);

    if (result.status === "signature_failed") {
      return NextResponse.json(
        { error: "Invalid cryptographic signature" },
        { status: 401 }
      );
    }

    if (result.status === "error") {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Return 200 OK for both processed and idempotent duplicate events
    return NextResponse.json({
      success: true,
      status: result.status,
      eventId: result.eventId,
      derivedType: result.derivedType,
    });
  } catch (error: any) {
    console.error("Webhook processing exception:", error);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    protocol: "GoHighLevel Webhook Ingestion Gateway",
    signatureMethod: "Ed25519 (X-GHL-Signature)",
    timestamp: new Date().toISOString(),
  });
}
