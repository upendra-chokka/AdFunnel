import { NextRequest, NextResponse } from "next/server";
import {
  getStoredCredentials,
  saveStoredCredentials,
  maskCredential,
  getEffectiveMetaCredentials,
  getEffectiveGoogleCredentials,
  getEffectiveGhlCredentials,
  getEffectiveSupabaseCredentials,
} from "@/lib/integrations/credentials-store";
import { auditLogger } from "@/lib/security/audit-logger";
import { apiRateLimiter } from "@/lib/security/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const meta = getEffectiveMetaCredentials();
    const google = getEffectiveGoogleCredentials();
    const ghl = getEffectiveGhlCredentials();
    const supabase = getEffectiveSupabaseCredentials();

    return NextResponse.json({
      success: true,
      integrations: {
        meta: {
          isConfigured: Boolean(meta.systemUserToken),
          systemUserToken: maskCredential(meta.systemUserToken),
          adAccountId: meta.adAccountId || "",
          appId: meta.appId || "",
        },
        google: {
          isConfigured: Boolean(google.developerToken),
          developerToken: maskCredential(google.developerToken),
          customerId: google.customerId || "",
          clientId: maskCredential(google.clientId),
          hasRefreshToken: Boolean(google.refreshToken),
        },
        ghl: {
          isConfigured: Boolean(ghl.apiKey),
          apiKey: maskCredential(ghl.apiKey),
          locationId: ghl.locationId || "",
          hasWebhookSecret: Boolean(ghl.webhookSecret),
        },
        supabase: {
          isConfigured: Boolean(supabase.url && !supabase.url.includes("mock")),
          url: supabase.url ? supabase.url.replace(/https:\/\/(.*?)\..*/, "https://$1.supabase.co") : "",
          hasAnonKey: Boolean(supabase.anonKey),
          hasServiceRoleKey: Boolean(supabase.serviceRoleKey),
        },
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
    const ip = req.headers.get("x-forwarded-for") || "admin_client";
    const rateCheck = apiRateLimiter.check(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { meta, google, ghl, supabase } = body;

    const saved = saveStoredCredentials({
      meta,
      google,
      ghl,
      supabase,
    });

    auditLogger.log({
      agencyId: "system",
      action: "integrations.update_credentials",
      resourceType: "api_credentials",
      metadata: {
        hasMeta: Boolean(meta?.systemUserToken),
        hasGoogle: Boolean(google?.developerToken),
        hasGhl: Boolean(ghl?.apiKey),
        hasSupabase: Boolean(supabase?.url),
      },
    });

    return NextResponse.json({
      success: true,
      message: "API credentials successfully updated in live runtime. No Vercel redeployment required.",
      updatedAt: saved.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
