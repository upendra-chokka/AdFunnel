export type AttributionMethod =
  | "fbclid"
  | "gclid"
  | "utm_exact"
  | "pattern"
  | "heuristic"
  | "manual";

export interface AttributionTouchpoint {
  clickId?: string; // fbclid or gclid
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  tags?: string[];
  rawSource?: string;
}

export interface AttributionMatchResult {
  treatmentId?: string;
  treatmentName?: string;
  campaignId?: string;
  campaignName?: string;
  confidenceScore: number; // 0.0 to 1.0
  matchedBy: AttributionMethod;
  isQuarantined: boolean;
}

export interface CustomerJourneyNode {
  contactId: string;
  contactName: string;
  email: string;
  phone?: string;
  leadDate: string;
  clickId?: string;
  campaignId: string;
  campaignName: string;
  treatmentId: string;
  treatmentName: string;
  appointmentId?: string;
  appointmentType?: "self_booked" | "setter_booked";
  appointmentDate?: string;
  appointmentStatus?: string;
  opportunityId?: string;
  opportunityStatus?: "open" | "won" | "lost";
  opportunityStage?: string;
  revenueAmount: number;
  confidenceScore: number;
  matchedBy: AttributionMethod;
}

export interface CampaignMappingRule {
  id: string;
  clientId: string;
  treatmentId: string;
  treatmentName: string;
  pattern: string; // Regex string e.g. '(?i).*botox.*'
  matchType: "exact" | "pattern" | "tag";
  priority: number;
}
