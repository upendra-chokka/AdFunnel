/**
 * GoHighLevel API v2 Integration Client
 * Based on official LeadConnector HighLevel API specifications.
 */

export interface GhlContactResponse {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  dateAdded: string;
  attributionSource?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    fbclid?: string;
    gclid?: string;
  };
}

export interface GhlAppointmentResponse {
  id: string;
  calendarId: string;
  contactId: string;
  startTime: string;
  endTime?: string;
  title: string;
  status: string; // 'confirmed', 'cancelled', 'showed', 'noshow'
  source?: string;
  assignedUserId?: string;
}

export interface GhlOpportunityResponse {
  id: string;
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  status: "open" | "won" | "lost" | "abandoned";
  monetaryValue: number;
  name: string;
  createdAt: string;
}

export interface GhlPaymentResponse {
  id: string;
  contactId: string;
  amount: number;
  currency: string;
  status: "paid" | "refunded" | "failed";
  createdAt: string;
}

import { getEffectiveGhlCredentials } from "../credentials-store";

export class GhlApiClient {
  private baseUrl = "https://services.leadconnectorhq.com";
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || getEffectiveGhlCredentials().apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      ...options.headers,
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });

        if (res.status === 429) {
          // Rate limit backoff
          const retryAfter = Number(res.headers.get("Retry-After")) || 2;
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          continue;
        }

        if (!res.ok) {
          throw new Error(`GHL API error: ${res.status} ${res.statusText}`);
        }

        return (await res.json()) as T;
      } catch (err) {
        if (attempts >= maxAttempts) throw err;
        await new Promise((r) => setTimeout(r, Math.pow(2, attempts) * 1000));
      }
    }

    throw new Error("Failed to execute GHL API request after retries");
  }

  async getContacts(locationId: string, limit = 100): Promise<GhlContactResponse[]> {
    // If running in demo mode or without live credentials, return mocked payload
    if (!this.accessToken) {
      return [
        {
          id: "ghl_cont_01",
          name: "Jessica Miller",
          firstName: "Jessica",
          lastName: "Miller",
          email: "jessica.m@example.com",
          phone: "+19175550182",
          source: "Facebook Lead Ad",
          tags: ["botox-lead", "self-booked"],
          dateAdded: new Date().toISOString(),
          attributionSource: {
            utmSource: "facebook",
            utmCampaign: "NYC | Botox | Broad Interest | Sept 2026",
            fbclid: "fbclid_sample_12345",
          },
        },
      ];
    }

    const data = await this.request<{ contacts: GhlContactResponse[] }>(
      `/contacts/?locationId=${locationId}&limit=${limit}`
    );
    return data.contacts || [];
  }

  async getAppointments(locationId: string, startDate: string, endDate: string): Promise<GhlAppointmentResponse[]> {
    if (!this.accessToken) {
      return [
        {
          id: "ghl_appt_01",
          calendarId: "cal_online_botox",
          contactId: "ghl_cont_01",
          startTime: new Date().toISOString(),
          title: "Botox Consultation",
          status: "confirmed",
          source: "widget",
        },
      ];
    }

    const data = await this.request<{ events: GhlAppointmentResponse[] }>(
      `/calendars/events?locationId=${locationId}&startTime=${startDate}&endTime=${endDate}`
    );
    return data.events || [];
  }

  async getOpportunities(locationId: string): Promise<GhlOpportunityResponse[]> {
    if (!this.accessToken) {
      return [
        {
          id: "ghl_opp_01",
          contactId: "ghl_cont_01",
          pipelineId: "pipe_aesthetics_01",
          pipelineStageId: "stage_won",
          status: "won",
          monetaryValue: 450.0,
          name: "Botox 40 Units",
          createdAt: new Date().toISOString(),
        },
      ];
    }

    const data = await this.request<{ opportunities: GhlOpportunityResponse[] }>(
      `/opportunities/search?locationId=${locationId}`
    );
    return data.opportunities || [];
  }
}
