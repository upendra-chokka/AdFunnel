import { MetaInsightRecord, MetaInsightsResponse } from "./types";

export class MetaApiClient {
  private apiVersion = "v21.0";
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.META_SYSTEM_USER_TOKEN;
  }

  /**
   * Fetches daily ad insights at the ad or campaign level over a given date range.
   */
  async getDailyInsights(
    accountId: string,
    since: string,
    until: string,
    level: "campaign" | "adset" | "ad" = "ad"
  ): Promise<MetaInsightRecord[]> {
    // If running in demo mode or without live token, return seeded realistic insights
    if (!this.accessToken) {
      return [
        {
          account_id: accountId,
          campaign_id: "meta_camp_botox_01",
          campaign_name: "NYC | Botox | Broad Interest | Sept 2026",
          adset_id: "adset_botox_broad_25_55",
          adset_name: "Women 25-55 High-Income NYC",
          ad_id: "ad_botox_video_01",
          ad_name: "Botox Natural Results 15s Video",
          date_start: since,
          date_stop: since,
          spend: "500.00",
          impressions: "18500",
          reach: "14200",
          clicks: "310",
          cpc: "1.61",
          cpm: "27.03",
          ctr: "0.0167",
        },
        {
          account_id: accountId,
          campaign_id: "meta_camp_lip_02",
          campaign_name: "NYC | Lip Filler | Plump & Natural | Sept 2026",
          adset_id: "adset_lip_broad_21_45",
          adset_name: "Women 21-45 Beauty Interests NYC",
          ad_id: "ad_lip_carousel_01",
          ad_name: "Lip Filler Before & After Carousel",
          date_start: since,
          date_stop: since,
          spend: "500.00",
          impressions: "16400",
          reach: "12800",
          clicks: "275",
          cpc: "1.81",
          cpm: "30.49",
          ctr: "0.0167",
        },
      ];
    }

    const cleanAccountId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;
    const fields = [
      "account_id",
      "campaign_id",
      "campaign_name",
      "adset_id",
      "adset_name",
      "ad_id",
      "ad_name",
      "date_start",
      "date_stop",
      "spend",
      "impressions",
      "reach",
      "clicks",
      "cpc",
      "cpm",
      "ctr",
    ].join(",");

    const timeRange = JSON.stringify({ since, until });
    const url = `${this.baseUrl}/${cleanAccountId}/insights?level=${level}&fields=${fields}&time_range=${encodeURIComponent(
      timeRange
    )}&time_increment=1&limit=500&access_token=${this.accessToken}`;

    const records: MetaInsightRecord[] = [];
    let nextUrl: string | undefined = url;

    while (nextUrl) {
      const res = await fetch(nextUrl);
      if (!res.ok) {
        throw new Error(`Meta API error: ${res.status} ${res.statusText}`);
      }

      // Check usage headers
      const usage = res.headers.get("x-app-usage");
      if (usage) {
        const parsed = JSON.parse(usage);
        if (parsed.call_count > 80) {
          // Dynamic jitter sleep
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      const json: MetaInsightsResponse = await res.json();
      if (json.data && json.data.length > 0) {
        records.push(...json.data);
      }

      nextUrl = json.paging?.next;
    }

    return records;
  }
}
