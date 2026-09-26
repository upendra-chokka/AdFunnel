export interface MetaConfig {
  systemUserToken?: string;
  adAccountId?: string;
  appId?: string;
  appSecret?: string;
}

export interface GoogleConfig {
  developerToken?: string;
  customerId?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface GhlConfig {
  apiKey?: string;
  locationId?: string;
  webhookSecret?: string;
}

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

export interface StoredCredentials {
  meta?: MetaConfig;
  google?: GoogleConfig;
  ghl?: GhlConfig;
  supabase?: SupabaseConfig;
  updatedAt?: string;
}

// In-memory runtime cache for serverless invocation lifetime
let credentialsCache: StoredCredentials = {};

export function getStoredCredentials(): StoredCredentials {
  return credentialsCache;
}

export function saveStoredCredentials(updates: Partial<StoredCredentials>): StoredCredentials {
  credentialsCache = {
    ...credentialsCache,
    meta: { ...credentialsCache.meta, ...updates.meta },
    google: { ...credentialsCache.google, ...updates.google },
    ghl: { ...credentialsCache.ghl, ...updates.ghl },
    supabase: { ...credentialsCache.supabase, ...updates.supabase },
    updatedAt: new Date().toISOString(),
  };
  return credentialsCache;
}

export function maskCredential(val?: string): string {
  if (!val || val.length < 6) return val ? "******" : "";
  return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
}

export function getEffectiveMetaCredentials(): MetaConfig {
  const stored = credentialsCache.meta || {};
  return {
    systemUserToken: stored.systemUserToken || process.env.META_SYSTEM_USER_TOKEN,
    adAccountId: stored.adAccountId || process.env.META_AD_ACCOUNT_ID,
    appId: stored.appId || process.env.META_APP_ID,
    appSecret: stored.appSecret || process.env.META_APP_SECRET,
  };
}

export function getEffectiveGoogleCredentials(): GoogleConfig {
  const stored = credentialsCache.google || {};
  return {
    developerToken: stored.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    customerId: stored.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID,
    clientId: stored.clientId || process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: stored.clientSecret || process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: stored.refreshToken || process.env.GOOGLE_ADS_REFRESH_TOKEN,
  };
}

export function getEffectiveGhlCredentials(): GhlConfig {
  const stored = credentialsCache.ghl || {};
  return {
    apiKey: stored.apiKey || process.env.GHL_CLIENT_SECRET || process.env.GHL_API_KEY,
    locationId: stored.locationId || process.env.GHL_LOCATION_ID,
    webhookSecret: stored.webhookSecret || process.env.GHL_WEBHOOK_PUBLIC_KEY,
  };
}

export function getEffectiveSupabaseCredentials(): SupabaseConfig {
  const stored = credentialsCache.supabase || {};
  return {
    url: stored.url || process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: stored.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: stored.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
