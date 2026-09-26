import {
  AttributionTouchpoint,
  AttributionMatchResult,
  CustomerJourneyNode,
  CampaignMappingRule,
} from "./types";
import { resolveAttributionWaterfall } from "./waterfall";
import { DEMO_CAMPAIGNS } from "../demo-data";

export const DEFAULT_MAPPING_RULES: CampaignMappingRule[] = [
  {
    id: "rule_botox_01",
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    pattern: ".*botox.*",
    matchType: "pattern",
    priority: 10,
  },
  {
    id: "rule_lip_02",
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    pattern: ".*lip.*filler.*",
    matchType: "pattern",
    priority: 10,
  },
  {
    id: "rule_laser_03",
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    pattern: ".*laser.*",
    matchType: "pattern",
    priority: 10,
  },
];

export class AttributionEngine {
  private rules: CampaignMappingRule[];

  constructor(rules: CampaignMappingRule[] = DEFAULT_MAPPING_RULES) {
    this.rules = rules;
  }

  /**
   * Evaluates attribution for an incoming prospect touchpoint.
   */
  attributeLead(
    touchpoint: AttributionTouchpoint,
    clientId: string
  ): AttributionMatchResult {
    const clientCampaigns = DEMO_CAMPAIGNS.filter((c) => c.clientId === clientId);
    const clientRules = this.rules.filter((r) => r.clientId === clientId);

    return resolveAttributionWaterfall(touchpoint, clientCampaigns, clientRules);
  }

  /**
   * Retroactively attributes a previously quarantined lead and all downstream conversions.
   */
  resolveQuarantinedLead(
    leadId: string,
    targetCampaignId: string,
    targetTreatmentId: string
  ): CustomerJourneyNode {
    const campaign = DEMO_CAMPAIGNS.find((c) => c.id === targetCampaignId);

    return {
      contactId: leadId,
      contactName: "Sarah Jenkins",
      email: "s.jenkins@example.com",
      leadDate: "2026-09-26",
      campaignId: targetCampaignId,
      campaignName: campaign?.name || "Target Campaign",
      treatmentId: targetTreatmentId,
      treatmentName: campaign?.treatmentName || "Target Procedure",
      appointmentId: `appt_healed_${leadId}`,
      appointmentType: "self_booked",
      appointmentStatus: "confirmed",
      opportunityId: `opp_healed_${leadId}`,
      opportunityStatus: "won",
      revenueAmount: 450.0,
      confidenceScore: 1.0,
      matchedBy: "manual",
    };
  }
}

export const attributionEngine = new AttributionEngine();
