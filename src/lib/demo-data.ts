import { FunnelMetrics, calculateDerivedMetrics, DerivedMetrics } from "./metrics";

export interface DemoClient {
  id: string;
  name: string;
  location: string;
  currency: string;
  ghlLocationId: string;
  metaAccountId: string;
  googleAdsId: string;
  status: "active" | "paused";
  treatments: DemoTreatment[];
}

export interface DemoTreatment {
  id: string;
  clientId: string;
  name: string;
  category: string;
  targetCpl: number;
  targetRoas: number;
}

export interface DemoDailyRecord extends FunnelMetrics {
  date: string; // "YYYY-MM-DD"
  displayDate: string; // "9/23" or "Sep 23"
  clientId: string;
  treatmentId: string;
  treatmentName: string;
}

export interface DemoCampaign {
  id: string;
  clientId: string;
  treatmentId: string;
  treatmentName: string;
  platform: "meta" | "google";
  name: string;
  spend: number;
  leads: number;
  appts: number;
  sales: number;
  revenue: number;
  status: "ACTIVE" | "PAUSED";
}

export interface UnattributedLead {
  id: string;
  clientId: string;
  contactName: string;
  email: string;
  phone: string;
  source: string;
  campaignRaw: string;
  createdAt: string;
  suggestedTreatmentId: string;
  suggestedCampaignId: string;
  confidence: number;
}

export interface WebhookLogItem {
  id: string;
  provider: "gohighlevel" | "meta";
  eventType: string;
  clientName: string;
  signatureVerified: boolean;
  receivedAt: string;
  status: "processed" | "duplicate" | "failed";
}

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: "client_aura",
    name: "Aura Med Spa",
    location: "New York, NY",
    currency: "USD",
    ghlLocationId: "loc_aura_nyc_01",
    metaAccountId: "act_4920194820",
    googleAdsId: "938-201-9481",
    status: "active",
    treatments: [
      { id: "t_botox", clientId: "client_aura", name: "Botox (Treatment 1)", category: "Injectables", targetCpl: 25.0, targetRoas: 2.5 },
      { id: "t_lip", clientId: "client_aura", name: "Lip Filler (Treatment 2)", category: "Injectables", targetCpl: 30.0, targetRoas: 2.2 },
      { id: "t_laser", clientId: "client_aura", name: "Laser Hair Removal (Treatment 3)", category: "Aesthetics", targetCpl: 35.0, targetRoas: 2.0 },
      { id: "t_body", clientId: "client_aura", name: "CoolSculpting Body", category: "Body Contouring", targetCpl: 50.0, targetRoas: 3.0 },
    ],
  },
  {
    id: "client_glow",
    name: "Glow Aesthetics & Wellness",
    location: "Miami, FL",
    currency: "USD",
    ghlLocationId: "loc_glow_mia_02",
    metaAccountId: "act_7739201928",
    googleAdsId: "482-104-7729",
    status: "active",
    treatments: [
      { id: "t_glow_botox", clientId: "client_glow", name: "Botox Dysport", category: "Injectables", targetCpl: 22.0, targetRoas: 2.8 },
      { id: "t_glow_morph", clientId: "client_glow", name: "Morpheus8 RF Microneedling", category: "Skin Rejuvenation", targetCpl: 45.0, targetRoas: 3.5 },
    ],
  },
  {
    id: "client_pure",
    name: "Pure Dermatology Group",
    location: "Austin, TX",
    currency: "USD",
    ghlLocationId: "loc_pure_atx_03",
    metaAccountId: "act_1092837465",
    googleAdsId: "209-481-9920",
    status: "active",
    treatments: [
      { id: "t_pure_botox", clientId: "client_pure", name: "Botox Cosmetic", category: "Injectables", targetCpl: 24.0, targetRoas: 2.6 },
      { id: "t_pure_hydra", clientId: "client_pure", name: "HydraFacial Deluxe", category: "Facials", targetCpl: 20.0, targetRoas: 2.0 },
    ],
  },
];

// Daily records directly mirroring the Jamie Tracking reference spreadsheet
export const DEMO_DAILY_RECORDS: DemoDailyRecord[] = [
  // AURA MED SPA - BOTOX
  {
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    date: "2026-09-23",
    displayDate: "9/23",
    spend: 500,
    leads: 60,
    apptsSelf: 15,
    apptsSetter: 5,
    sales: 2,
    revenue: 150,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    date: "2026-09-24",
    displayDate: "9/24",
    spend: 500,
    leads: 50,
    apptsSelf: 1,
    apptsSetter: 1,
    sales: 0,
    revenue: 150,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    date: "2026-09-25",
    displayDate: "9/25",
    spend: 500,
    leads: 55,
    apptsSelf: 15,
    apptsSetter: 5,
    sales: 2,
    revenue: 150,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    date: "2026-09-26",
    displayDate: "9/26",
    spend: 500,
    leads: 62,
    apptsSelf: 17,
    apptsSetter: 6,
    sales: 3,
    revenue: 300,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    date: "2026-09-27",
    displayDate: "9/27",
    spend: 520,
    leads: 65,
    apptsSelf: 18,
    apptsSetter: 6,
    sales: 4,
    revenue: 450,
  },

  // AURA MED SPA - LIP FILLER
  {
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    date: "2026-09-23",
    displayDate: "9/23",
    spend: 500,
    leads: 60,
    apptsSelf: 15,
    apptsSetter: 5,
    sales: 2,
    revenue: 150,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    date: "2026-09-24",
    displayDate: "9/24",
    spend: 500,
    leads: 50,
    apptsSelf: 1,
    apptsSetter: 1,
    sales: 0,
    revenue: 150,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    date: "2026-09-25",
    displayDate: "9/25",
    spend: 500,
    leads: 55,
    apptsSelf: 15,
    apptsSetter: 5,
    sales: 2,
    revenue: 150,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    date: "2026-09-26",
    displayDate: "9/26",
    spend: 480,
    leads: 58,
    apptsSelf: 16,
    apptsSetter: 4,
    sales: 3,
    revenue: 350,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    date: "2026-09-27",
    displayDate: "9/27",
    spend: 510,
    leads: 63,
    apptsSelf: 17,
    apptsSetter: 5,
    sales: 3,
    revenue: 350,
  },

  // AURA MED SPA - LASER HAIR REMOVAL
  {
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    date: "2026-09-23",
    displayDate: "9/23",
    spend: 400,
    leads: 45,
    apptsSelf: 12,
    apptsSetter: 4,
    sales: 2,
    revenue: 600,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    date: "2026-09-24",
    displayDate: "9/24",
    spend: 400,
    leads: 40,
    apptsSelf: 10,
    apptsSetter: 3,
    sales: 1,
    revenue: 300,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    date: "2026-09-25",
    displayDate: "9/25",
    spend: 420,
    leads: 48,
    apptsSelf: 14,
    apptsSetter: 5,
    sales: 3,
    revenue: 900,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    date: "2026-09-26",
    displayDate: "9/26",
    spend: 450,
    leads: 52,
    apptsSelf: 15,
    apptsSetter: 6,
    sales: 4,
    revenue: 1200,
  },
  {
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    date: "2026-09-27",
    displayDate: "9/27",
    spend: 450,
    leads: 50,
    apptsSelf: 14,
    apptsSetter: 5,
    sales: 3,
    revenue: 900,
  },
];

export const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    id: "camp_meta_botox_broad",
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    platform: "meta",
    name: "NYC | Botox | Broad Interest | Sept 2026",
    spend: 2100,
    leads: 90,
    appts: 31,
    sales: 8,
    revenue: 8000,
    status: "ACTIVE",
  },
  {
    id: "camp_meta_botox_lal",
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    platform: "meta",
    name: "NYC | Botox | 2% High-LTV Lookalike | Sept 2026",
    spend: 1800,
    leads: 61,
    appts: 24,
    sales: 5,
    revenue: 5000,
    status: "ACTIVE",
  },
  {
    id: "camp_meta_botox_retarget",
    clientId: "client_aura",
    treatmentId: "t_botox",
    treatmentName: "Botox (Treatment 1)",
    platform: "meta",
    name: "NYC | Botox | Retargeting 30d Visitors | Sept 2026",
    spend: 1100,
    leads: 29,
    appts: 10,
    sales: 3,
    revenue: 3000,
    status: "ACTIVE",
  },
  {
    id: "camp_meta_lip_broad",
    clientId: "client_aura",
    treatmentId: "t_lip",
    treatmentName: "Lip Filler (Treatment 2)",
    platform: "meta",
    name: "NYC | Lip Filler | Plump & Natural | Sept 2026",
    spend: 2490,
    leads: 120,
    appts: 42,
    sales: 11,
    revenue: 9900,
    status: "ACTIVE",
  },
  {
    id: "camp_google_laser",
    clientId: "client_aura",
    treatmentId: "t_laser",
    treatmentName: "Laser Hair Removal (Treatment 3)",
    platform: "google",
    name: "Google Search | Laser Hair Removal NYC | Exact",
    spend: 2120,
    leads: 85,
    appts: 30,
    sales: 9,
    revenue: 7800,
    status: "ACTIVE",
  },
];

export const DEMO_UNATTRIBUTED_LEADS: UnattributedLead[] = [
  {
    id: "lead_unatt_101",
    clientId: "client_aura",
    contactName: "Sarah Jenkins",
    email: "s.jenkins@example.com",
    phone: "+1 (917) 555-0192",
    source: "Direct Website Form",
    campaignRaw: "sept_promo_unknown",
    createdAt: "2026-09-26 14:22",
    suggestedTreatmentId: "t_botox",
    suggestedCampaignId: "camp_meta_botox_broad",
    confidence: 0.85,
  },
  {
    id: "lead_unatt_102",
    clientId: "client_aura",
    contactName: "Michael Chang",
    email: "mchang99@example.com",
    phone: "+1 (212) 555-0144",
    source: "Instagram DM",
    campaignRaw: "null",
    createdAt: "2026-09-26 11:05",
    suggestedTreatmentId: "t_laser",
    suggestedCampaignId: "camp_google_laser",
    confidence: 0.65,
  },
  {
    id: "lead_unatt_103",
    clientId: "client_glow",
    contactName: "Elena Rodriguez",
    email: "elena.r@example.com",
    phone: "+1 (305) 555-0188",
    source: "Facebook Lead Ad",
    campaignRaw: "MIA_morpheus_test_camp",
    createdAt: "2026-09-25 18:40",
    suggestedTreatmentId: "t_glow_morph",
    suggestedCampaignId: "camp_meta_botox_broad",
    confidence: 0.92,
  },
];

export const DEMO_WEBHOOK_LOGS: WebhookLogItem[] = [
  {
    id: "wh_log_001",
    provider: "gohighlevel",
    eventType: "ContactCreate",
    clientName: "Aura Med Spa",
    signatureVerified: true,
    receivedAt: "2 min ago",
    status: "processed",
  },
  {
    id: "wh_log_002",
    provider: "gohighlevel",
    eventType: "AppointmentCreate",
    clientName: "Aura Med Spa",
    signatureVerified: true,
    receivedAt: "14 min ago",
    status: "processed",
  },
  {
    id: "wh_log_003",
    provider: "meta",
    eventType: "LeadgenWebhook",
    clientName: "Glow Aesthetics",
    signatureVerified: true,
    receivedAt: "45 min ago",
    status: "processed",
  },
  {
    id: "wh_log_004",
    provider: "gohighlevel",
    eventType: "OpportunityStageUpdate",
    clientName: "Aura Med Spa",
    signatureVerified: true,
    receivedAt: "1 hour ago",
    status: "processed",
  },
  {
    id: "wh_log_005",
    provider: "gohighlevel",
    eventType: "ContactCreate",
    clientName: "Pure Dermatology",
    signatureVerified: true,
    receivedAt: "2 hours ago",
    status: "duplicate",
  },
];
