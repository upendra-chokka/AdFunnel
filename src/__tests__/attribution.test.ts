import { describe, it, expect } from "vitest";
import { resolveAttributionWaterfall } from "../lib/attribution/waterfall";
import { attributionEngine, DEFAULT_MAPPING_RULES } from "../lib/attribution/engine";
import { DEMO_CAMPAIGNS } from "../lib/demo-data";

describe("Phase 5: The Attribution Engine & Deterministic Waterfall", () => {
  const campaigns = DEMO_CAMPAIGNS.filter((c) => c.clientId === "client_aura");

  // Test 1: Tier 1 Click ID Match
  it("resolves Tier 1 FBCLID/GCLID with 1.00 confidence score", () => {
    // Meta Click ID
    const metaMatch = resolveAttributionWaterfall(
      { clickId: "fbclid=IwAR0918239..." },
      campaigns,
      DEFAULT_MAPPING_RULES
    );
    expect(metaMatch.confidenceScore).toBe(1.0);
    expect(metaMatch.matchedBy).toBe("fbclid");
    expect(metaMatch.isQuarantined).toBe(false);

    // Google Click ID
    const googleMatch = resolveAttributionWaterfall(
      { clickId: "gclid=Cj0KCQjwmv..." },
      campaigns,
      DEFAULT_MAPPING_RULES
    );
    expect(googleMatch.confidenceScore).toBe(1.0);
    expect(googleMatch.matchedBy).toBe("gclid");
    expect(googleMatch.treatmentName).toBe("Laser Hair Removal (Treatment 3)");
  });

  // Test 2: Tier 2 UTM Exact Match
  it("resolves Tier 2 exact utm_campaign with 0.95 confidence score", () => {
    const match = resolveAttributionWaterfall(
      { utmCampaign: "NYC | Lip Filler | Plump & Natural | Sept 2026" },
      campaigns,
      DEFAULT_MAPPING_RULES
    );

    expect(match.confidenceScore).toBe(0.95);
    expect(match.matchedBy).toBe("utm_exact");
    expect(match.treatmentId).toBe("t_lip");
    expect(match.isQuarantined).toBe(false);
  });

  // Test 3: Tier 3 Regex Pattern Match
  it("resolves Tier 3 regex pattern matching with 0.85 confidence score", () => {
    const match = resolveAttributionWaterfall(
      { rawSource: "sept_botox_promo_landing_page" },
      campaigns,
      DEFAULT_MAPPING_RULES
    );

    expect(match.confidenceScore).toBe(0.85);
    expect(match.matchedBy).toBe("pattern");
    expect(match.treatmentId).toBe("t_botox");
    expect(match.isQuarantined).toBe(false);
  });

  // Test 4: Tier 4 Heuristic Tag Match
  it("resolves Tier 4 contact tag heuristic with 0.70 confidence score", () => {
    const match = resolveAttributionWaterfall(
      { tags: ["Lead: Laser Hair Removal Inquirer"] },
      campaigns,
      DEFAULT_MAPPING_RULES
    );

    expect(match.confidenceScore).toBe(0.7);
    expect(match.matchedBy).toBe("heuristic");
    expect(match.treatmentId).toBe("t_laser");
    expect(match.isQuarantined).toBe(false);
  });

  // Test 5: Tier 5 Quarantine Queue
  it("routes unidentifiable touchpoint to Tier 5 Quarantine Queue", () => {
    const match = resolveAttributionWaterfall(
      { rawSource: "unlabeled_offline_flyer" },
      campaigns,
      DEFAULT_MAPPING_RULES
    );

    expect(match.confidenceScore).toBe(0.0);
    expect(match.isQuarantined).toBe(true);
    expect(match.matchedBy).toBe("manual");
  });

  // Test 6: Retroactive Quarantine Healing
  it("retroactively heals quarantined lead and links downstream revenue", () => {
    const healedJourney = attributionEngine.resolveQuarantinedLead(
      "lead_unatt_101",
      "camp_meta_botox_broad",
      "t_botox"
    );

    expect(healedJourney.contactId).toBe("lead_unatt_101");
    expect(healedJourney.treatmentId).toBe("t_botox");
    expect(healedJourney.opportunityStatus).toBe("won");
    expect(healedJourney.revenueAmount).toBe(450.0);
    expect(healedJourney.confidenceScore).toBe(1.0);
    expect(healedJourney.matchedBy).toBe("manual");
  });
});
