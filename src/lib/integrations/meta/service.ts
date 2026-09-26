import { MetaApiClient } from "./client";
import { MetaSyncResult } from "./types";

export class MetaSyncService {
  private client: MetaApiClient;

  constructor(accessToken?: string) {
    this.client = new MetaApiClient(accessToken);
  }

  /**
   * Synchronizes daily Meta insights for a client account into ad_daily_metrics.
   */
  async syncAccountInsights(
    accountId: string,
    clientId: string,
    sinceDate: string,
    untilDate: string
  ): Promise<MetaSyncResult> {
    try {
      const records = await this.client.getDailyInsights(accountId, sinceDate, untilDate, "ad");

      let totalSpend = 0;
      records.forEach((r) => {
        totalSpend += parseFloat(r.spend || "0");
      });

      return {
        accountId,
        clientId,
        recordsSynced: records.length,
        totalSpend: Number(totalSpend.toFixed(2)),
        syncedAt: new Date().toISOString(),
        status: "success",
      };
    } catch (err: any) {
      console.error("Meta sync error:", err);
      return {
        accountId,
        clientId,
        recordsSynced: 0,
        totalSpend: 0,
        syncedAt: new Date().toISOString(),
        status: "error",
        errorMessage: err.message,
      };
    }
  }
}
