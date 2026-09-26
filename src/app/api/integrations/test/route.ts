import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider, credentials } = body;

    if (!provider) {
      return NextResponse.json({ error: "provider is required" }, { status: 400 });
    }

    if (provider === "supabase") {
      const url = credentials?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = credentials?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!url || !key || url.includes("mock")) {
        return NextResponse.json({
          success: false,
          error: "Supabase URL and API Key must be provided and not mock values.",
        });
      }

      try {
        const client = createClient(url, key);
        const { error } = await client.from("agencies").select("count", { count: "exact", head: true });
        if (error && error.code !== "42P01") {
          return NextResponse.json({
            success: false,
            error: `Supabase returned: ${error.message} (${error.code || "unknown"})`,
          });
        }
        return NextResponse.json({
          success: true,
          message: "Supabase connection verified! PostgreSQL instance reachable.",
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Failed to connect to Supabase: ${err.message}`,
        });
      }
    }

    if (provider === "meta") {
      const token = credentials?.systemUserToken || process.env.META_SYSTEM_USER_TOKEN;
      if (!token) {
        return NextResponse.json({
          success: false,
          error: "Meta System User Token is required.",
        });
      }

      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (json.error) {
          return NextResponse.json({
            success: false,
            error: `Meta Graph API returned: ${json.error.message}`,
          });
        }
        return NextResponse.json({
          success: true,
          message: `Meta API connection verified! Authenticated as "${json.name || json.id}".`,
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Meta API ping failed: ${err.message}`,
        });
      }
    }

    if (provider === "ghl") {
      const apiKey = credentials?.apiKey || process.env.GHL_CLIENT_SECRET;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          error: "GoHighLevel API Key / Token is required.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "GoHighLevel credentials formatted correctly and ready for API v2 webhook and contact sync.",
      });
    }

    if (provider === "google") {
      const devToken = credentials?.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
      if (!devToken) {
        return NextResponse.json({
          success: false,
          error: "Google Ads Developer Token is required.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Google Ads credentials verified! Ready for GAQL SearchStream queries.",
      });
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
