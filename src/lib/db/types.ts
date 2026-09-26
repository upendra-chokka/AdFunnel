export type UserRole = "super_admin" | "agency_admin" | "account_manager" | "viewer";
export type AdPlatform = "meta" | "google" | "tiktok";
export type AppointmentType = "self_booked" | "setter_booked" | "unknown";
export type AppointmentStatus = "new" | "confirmed" | "cancelled" | "showed" | "no_show" | "invalid";
export type OpportunityStatus = "open" | "won" | "lost" | "abandoned";
export type TransactionStatus = "paid" | "refunded" | "failed" | "pending";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  agency_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  status: "active" | "paused" | "archived";
  created_at: string;
  updated_at: string;
}

export interface GhlLocation {
  id: string;
  client_id: string;
  location_id: string;
  company_id?: string;
  name: string;
  sync_status: "idle" | "syncing" | "error";
  last_synced_at?: string;
}

export interface AdAccount {
  id: string;
  client_id: string;
  platform: AdPlatform;
  account_id: string;
  account_name: string;
  currency: string;
  status: string;
}

export interface Treatment {
  id: string;
  client_id: string;
  name: string;
  category?: string;
  target_cpl: number;
  target_roas: number;
  is_active: boolean;
}

export interface Campaign {
  id: string;
  client_id: string;
  ad_account_id: string;
  external_campaign_id: string;
  name: string;
  objective?: string;
  status: string;
}

export interface Contact {
  id: string;
  client_id: string;
  ghl_location_id?: string;
  external_contact_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  raw_attribution?: Record<string, any>;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  contact_id: string;
  treatment_id?: string;
  external_appointment_id: string;
  calendar_id?: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  start_time: string;
  booking_source?: string;
}

export interface Opportunity {
  id: string;
  client_id: string;
  contact_id: string;
  treatment_id?: string;
  external_opportunity_id: string;
  pipeline_id: string;
  stage_id: string;
  stage_name?: string;
  status: OpportunityStatus;
  monetary_value: number;
}

export interface RevenueTransaction {
  id: string;
  client_id: string;
  contact_id: string;
  opportunity_id?: string;
  treatment_id?: string;
  external_transaction_id?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  transaction_date: string;
}

export interface AdDailyMetric {
  id: string;
  client_id: string;
  treatment_id?: string;
  campaign_id: string;
  ad_set_id?: string;
  ad_id?: string;
  date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
}
