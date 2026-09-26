export interface GoogleAdsRow {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  adGroup?: {
    id: string;
    name: string;
  };
  adGroupAd?: {
    ad: {
      id: string;
      name?: string;
    };
  };
  segments: {
    date: string; // YYYY-MM-DD
  };
  metrics: {
    costMicros: string | number;
    impressions: string | number;
    clicks: string | number;
    ctr?: string | number;
    averageCpc?: string | number;
    conversions?: string | number;
    conversionsValue?: string | number;
  };
}

export interface GoogleSyncResult {
  customerId: string;
  clientId: string;
  recordsSynced: number;
  totalSpend: number;
  syncedAt: string;
  status: "success" | "error";
  errorMessage?: string;
}
