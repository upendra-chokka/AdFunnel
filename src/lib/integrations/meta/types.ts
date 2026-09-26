export interface MetaInsightRecord {
  account_id: string;
  campaign_id: string;
  campaign_name: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  date_start: string; // YYYY-MM-DD
  date_stop: string;
  spend: string; // Float string e.g. "500.00"
  impressions: string;
  reach?: string;
  clicks: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
}

export interface MetaInsightsResponse {
  data: MetaInsightRecord[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export interface MetaSyncResult {
  accountId: string;
  clientId: string;
  recordsSynced: number;
  totalSpend: number;
  syncedAt: string;
  status: "success" | "error";
  errorMessage?: string;
}
