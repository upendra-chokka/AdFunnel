import { describe, it, expect } from "vitest";
import { MetaSyncService } from "../lib/integrations/meta/service";
import { MetaApiClient } from "../lib/integrations/meta/client";
import { GoogleAdsSyncService } from "../lib/integrations/google/service";
import { normalizeGoogleMicros, parseGoogleMetrics } from "../lib/integrations/google/normalizer";

describe("Phase 4: Advertising Platform Integrations (Meta & Google Ads)", () => {
  // Test 1: Meta Marketing API Insights
  it("fetches and normalizes daily Meta campaign insights", async () => {
    const service = new MetaSyncService();
    const result = await service.syncAccountInsights(
      "act_4920194820",
      "c0000000-0000-0000-0000-000000000001",
      "2026-09-23",
      "2026-09-23"
    );

    expect(result.status).toBe("success");
    expect(result.recordsSynced).toBe(2);
    expect(result.totalSpend).toBe(1000.0); // $500 Botox + $500 Lip Filler
    expect(result.accountId).toBe("act_4920194820");
  });

  // Test 2: Google Ads Micro-Spend Normalization
  it("accurately converts Google Ads micros ($1.00 = 1,000,000 micros)", () => {
    expect(normalizeGoogleMicros(400000000)).toBe(400.0);
    expect(normalizeGoogleMicros("150000000")).toBe(150.0);
    expect(normalizeGoogleMicros(0)).toBe(0.0);
    expect(normalizeGoogleMicros(-500)).toBe(0.0);
    expect(normalizeGoogleMicros("invalid")).toBe(0.0);
  });

  // Test 3: Google Ads Metric Parsing (CPC, CTR)
  it("computes derived CPC and CTR safely from raw Google Ads metrics", () => {
    const parsed = parseGoogleMetrics({
      costMicros: "400000000", // $400
      impressions: "4000",
      clicks: "160",
    });

    expect(parsed.spend).toBe(400.0);
    expect(parsed.clicks).toBe(160);
    expect(parsed.cpc).toBe(2.5); // 400 / 160
    expect(parsed.ctr).toBe(0.04); // 160 / 4000
  });

  // Test 4: Google Ads SearchStream Sync
  it("synchronizes customer level daily metrics via GoogleAdsSyncService", async () => {
    const service = new GoogleAdsSyncService();
    const result = await service.syncCustomerMetrics(
      "938-201-9481",
      "c0000000-0000-0000-0000-000000000001",
      "2026-09-23",
      "2026-09-27"
    );

    expect(result.status).toBe("success");
    expect(result.customerId).toBe("938-201-9481");
    expect(result.recordsSynced).toBeGreaterThan(0);
    expect(result.totalSpend).toBe(400.0);
  });
});
