import { createClient } from "@/lib/supabase/client";
import { DEMO_CLIENTS, DEMO_DAILY_RECORDS, DEMO_CAMPAIGNS } from "@/lib/demo-data";
import { Client, Treatment, Campaign, AdDailyMetric } from "./types";

export class DatabaseService {
  private isDemoMode: boolean;

  constructor() {
    this.isDemoMode =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_DEMO_MODE !== "false"
        : true;
  }

  async getClients(): Promise<Client[]> {
    if (this.isDemoMode) {
      return DEMO_CLIENTS.map((c) => ({
        id: c.id,
        agency_id: "a0000000-0000-0000-0000-000000000001",
        name: c.name,
        slug: c.id.replace("client_", ""),
        currency: c.currency,
        timezone: "America/New_York",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    const supabase = createClient();
    const { data, error } = await supabase.from("clients").select("*").order("name");
    if (error) {
      console.warn("Supabase query error, falling back to demo:", error);
      return this.getClientsFallback();
    }
    return data || [];
  }

  async getTreatments(clientId?: string): Promise<Treatment[]> {
    if (this.isDemoMode) {
      const allTreatments = DEMO_CLIENTS.flatMap((c) =>
        c.treatments.map((t) => ({
          id: t.id,
          client_id: c.id,
          name: t.name,
          category: t.category,
          target_cpl: t.targetCpl,
          target_roas: t.targetRoas,
          is_active: true,
        }))
      );
      if (clientId && clientId !== "all") {
        return allTreatments.filter((t) => t.client_id === clientId);
      }
      return allTreatments;
    }

    const supabase = createClient();
    let query = supabase.from("treatments").select("*").eq("is_active", true);
    if (clientId && clientId !== "all") {
      query = query.eq("client_id", clientId);
    }
    const { data } = await query;
    return data || [];
  }

  async getDailyMetrics(clientId?: string): Promise<any[]> {
    if (this.isDemoMode) {
      if (clientId && clientId !== "all") {
        return DEMO_DAILY_RECORDS.filter((r) => r.clientId === clientId);
      }
      return DEMO_DAILY_RECORDS;
    }

    const supabase = createClient();
    let query = supabase.from("ad_daily_metrics").select("*, treatments(name)");
    if (clientId && clientId !== "all") {
      query = query.eq("client_id", clientId);
    }
    const { data } = await query;
    return data || [];
  }

  private getClientsFallback(): Client[] {
    return DEMO_CLIENTS.map((c) => ({
      id: c.id,
      agency_id: "a0000000-0000-0000-0000-000000000001",
      name: c.name,
      slug: c.id.replace("client_", ""),
      currency: c.currency,
      timezone: "America/New_York",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
}

export const dbService = new DatabaseService();
