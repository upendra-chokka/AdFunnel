import {
  AttributionTouchpoint,
  AttributionMatchResult,
  CampaignMappingRule,
} from "./types";
import { DemoCampaign, DemoTreatment } from "../demo-data";

/**
 * Deterministic Multi-Key Attribution Waterfall
 * Evaluates incoming touchpoints in strict priority order.
 */
export function resolveAttributionWaterfall(
  touchpoint: AttributionTouchpoint,
  availableCampaigns: DemoCampaign[],
  rules: CampaignMappingRule[] = []
): AttributionMatchResult {
  // =========================================================================
  // TIER 1: Click ID Match (FBCLID / GCLID) -> Confidence 1.00
  // =========================================================================
  if (touchpoint.clickId) {
    const isGoogle = touchpoint.clickId.toLowerCase().includes("gclid") || touchpoint.clickId.startsWith("Cj0");
    const isMeta = touchpoint.clickId.toLowerCase().includes("fbclid") || touchpoint.clickId.startsWith("IwAR");

    if (isGoogle) {
      const gCamp = availableCampaigns.find((c) => c.platform === "google");
      if (gCamp) {
        return {
          campaignId: gCamp.id,
          campaignName: gCamp.name,
          treatmentId: gCamp.treatmentId,
          treatmentName: gCamp.treatmentName,
          confidenceScore: 1.0,
          matchedBy: "gclid",
          isQuarantined: false,
        };
      }
    }

    if (isMeta) {
      const mCamp = availableCampaigns.find((c) => c.platform === "meta");
      if (mCamp) {
        return {
          campaignId: mCamp.id,
          campaignName: mCamp.name,
          treatmentId: mCamp.treatmentId,
          treatmentName: mCamp.treatmentName,
          confidenceScore: 1.0,
          matchedBy: "fbclid",
          isQuarantined: false,
        };
      }
    }
  }

  // =========================================================================
  // TIER 2: Exact UTM Campaign Match -> Confidence 0.95
  // =========================================================================
  if (touchpoint.utmCampaign) {
    const cleanUtm = touchpoint.utmCampaign.toLowerCase().trim();
    const exactCamp = availableCampaigns.find(
      (c) =>
        c.name.toLowerCase().trim() === cleanUtm ||
        c.id.toLowerCase() === cleanUtm
    );

    if (exactCamp) {
      return {
        campaignId: exactCamp.id,
        campaignName: exactCamp.name,
        treatmentId: exactCamp.treatmentId,
        treatmentName: exactCamp.treatmentName,
        confidenceScore: 0.95,
        matchedBy: "utm_exact",
        isQuarantined: false,
      };
    }
  }

  // =========================================================================
  // TIER 3: Admin Regex & Pattern Rules -> Confidence 0.85
  // =========================================================================
  const textToScan = `${touchpoint.utmCampaign || ""} ${touchpoint.rawSource || ""}`;
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    try {
      const regex = new RegExp(rule.pattern, "i");
      if (regex.test(textToScan)) {
        const camp = availableCampaigns.find((c) => c.treatmentId === rule.treatmentId);
        return {
          campaignId: camp?.id,
          campaignName: camp?.name,
          treatmentId: rule.treatmentId,
          treatmentName: rule.treatmentName,
          confidenceScore: 0.85,
          matchedBy: "pattern",
          isQuarantined: false,
        };
      }
    } catch {
      // Ignore invalid regex
    }
  }

  // =========================================================================
  // TIER 4: Tag & Form Heuristics -> Confidence 0.70
  // =========================================================================
  if (touchpoint.tags && touchpoint.tags.length > 0) {
    for (const tag of touchpoint.tags) {
      const cleanTag = tag.toLowerCase();
      const matchedCamp = availableCampaigns.find((c) =>
        cleanTag.includes(c.treatmentName.toLowerCase().split(" ")[0])
      );

      if (matchedCamp) {
        return {
          campaignId: matchedCamp.id,
          campaignName: matchedCamp.name,
          treatmentId: matchedCamp.treatmentId,
          treatmentName: matchedCamp.treatmentName,
          confidenceScore: 0.7,
          matchedBy: "heuristic",
          isQuarantined: false,
        };
      }
    }
  }

  // =========================================================================
  // TIER 5: Quarantine Queue (Unattributed Lead) -> Confidence 0.00
  // =========================================================================
  return {
    confidenceScore: 0.0,
    matchedBy: "manual",
    isQuarantined: true,
  };
}
