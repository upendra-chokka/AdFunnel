import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStoredCredentials } from "@/lib/integrations/credentials-store";

export async function GET() {
  const startTime = Date.now();
  const stored = getStoredCredentials();

  const supabaseUrl =
    stored.supabase?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    stored.supabase?.anonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isRealSupabase = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("mock-adfunnel") &&
    supabaseKey !== "mock-anon-key"
  );

  let supabaseConnected = false;
  let tablesDetected = false;
  let latencyMs = 0;
  let dbMessage = "Demo mock environment active";

  if (isRealSupabase && supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      const { data, error } = await client
        .from("agencies")
        .select("count", { count: "exact", head: true });

      latencyMs = Date.now() - startTime;

      if (!error) {
        supabaseConnected = true;
        tablesDetected = true;
        dbMessage = "Connected to Supabase PostgreSQL";
      } else if (error.code === "42P01") {
        // Table does not exist yet (needs migrations)
        supabaseConnected = true;
        tablesDetected = false;
        dbMessage = "Supabase connected, but migrations need to be run";
      } else {
        // Auth or connection error
        supabaseConnected = false;
        dbMessage = `Supabase error: ${error.message}`;
      }
    } catch (err: any) {
      latencyMs = Date.now() - startTime;
      supabaseConnected = false;
      dbMessage = `Connection failed: ${err.message}`;
    }
  }

  const hasMeta = Boolean(
    stored.meta?.systemUserToken || process.env.META_SYSTEM_USER_TOKEN
  );
  const hasGoogle = Boolean(
    stored.google?.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  );
  const hasGhl = Boolean(
    stored.ghl?.apiKey || process.env.GHL_CLIENT_SECRET
  );

  return NextResponse.json({
    supabase: {
      connected: supabaseConnected,
      url: supabaseUrl ? supabaseUrl.replace(/https:\/\/(.*?)\..*/, "https://$1.supabase.co") : null,
      isConfigured: isRealSupabase,
      tablesDetected,
      latencyMs,
      message: dbMessage,
    },
    mode: supabaseConnected ? "live" : "demo",
    integrations: {
      ghl: hasGhl,
      meta: hasMeta,
      google: hasGoogle,
      supabase: isRealSupabase,
    },
    timestamp: new Date().toISOString(),
  });
}
