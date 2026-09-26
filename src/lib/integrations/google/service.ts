import { GoogleAdsApiClient } from "./client";
import { normalizeGoogleMicros } from "./normalizer";
import { GoogleSyncResult } from "./types";

export class GoogleAdsSyncService {
  private client: GoogleAdsApiClient;

  constructor(customerId?: string) {
    this.client = new GoogleAdsApiClient(customerId);
  }

  async syncCustomerMetrics(
    customerId: string,
    clientId: string,
    sinceDate: string,
    untilDate: string
  ): Promise<GoogleSyncResult> {
    try {
      const rows = await this.client.searchDailyMetrics(customerId, sinceDate, untilDate);

      let totalSpend = 0;
      rows.forEach((r) => {
        totalSpend += normalizeGoogleMicros(r.metrics.costMicros);
      });

      return {
        customerId,
        clientId,
        recordsSynced: rows.length,
        totalSpend: Number(totalSpend.toFixed(2)),
        syncedAt: new Date().toISOString(),
        status: "success",
      };
    } catch (err: any) {
      console.error("Google Ads sync error:", err);
      return {
        customerId,
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
