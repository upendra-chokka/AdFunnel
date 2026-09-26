# API Integrations Specification

This document details the external API contracts, authentication mechanisms, webhook signature verification algorithms, rate limits, and synchronization protocols for GoHighLevel, Meta Ads, and Google Ads.

---

## 1. GoHighLevel (GHL) Integration

### 1.1 Authentication & Token Management
- **Protocol:** OAuth 2.0 with Location-level or Agency-level authorization.
- **Token Endpoint:** `https://services.leadconnectorhq.com/oauth/token`
- **Token Refresh Cycle:** Access tokens expire after 24 hours. Refresh tokens are rotated automatically 2 hours prior to expiration via background worker.
- **Scopes Required:**
  - `contacts.readonly`, `contacts.write`
  - `calendars.readonly`, `calendars/events.readonly`
  - `opportunities.readonly`
  - `payments.readonly`
  - `locations.readonly`

### 1.2 Webhook Architecture & Signature Verification
HighLevel signs all webhook deliveries with Ed25519 cryptography, passed in the `X-GHL-Signature` header. AdFunnel implements strict cryptographic verification before parsing payload contents:

```typescript
// Webhook signature verification implementation
import nacl from 'tweetnacl';

export function verifyGhlWebhookSignature(
  rawPayload: string,
  signatureHeader: string,
  publicKeyHex: string
): boolean {
  try {
    const signatureUint8 = Buffer.from(signatureHeader, 'hex');
    const messageUint8 = Buffer.from(rawPayload, 'utf-8');
    const publicKeyUint8 = Buffer.from(publicKeyHex, 'hex');

    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch (error) {
    console.error('Ed25519 signature verification error:', error);
    return false;
  }
}
```

### 1.3 Webhook Events Handled

| Event Key | Trigger | Target Entity | Action |
| :--- | :--- | :--- | :--- |
| `ContactCreate` | Form submission, lead ad sync | `contacts` | Creates contact record, extracts UTM parameters, triggers attribution matching. |
| `ContactUpdate` | Field change, tag added | `contacts` | Updates contact tags and custom fields; checks for attribution triggers. |
| `AppointmentCreate` | Client or setter books call | `appointments` | Ingests appointment, executes Self vs. Setter classifier, links treatment. |
| `AppointmentUpdate` | Status changes (show/cancel) | `appointments` | Updates appointment lifecycle status (`showed`, `no_show`, `cancelled`). |
| `OpportunityStageUpdate` | Pipeline stage transition | `opportunities` | Evaluates won/lost status; if won, logs conversion event. |
| `PaymentReceived` / `InvoicePaid` | Stripe / GHL payment success | `revenue_transactions` | Ingests monetary amount, links to opportunity and treatment. |

### 1.4 Nightly Reconciliation Protocol
Every night at 02:00 UTC, the system queries the HighLevel API over a sliding 14-day window:
1. `GET /contacts/?locationId={id}&startAt={timestamp}`
2. `GET /calendars/events?locationId={id}&startTime={timestamp}`
3. `GET /opportunities/search?locationId={id}&dateRange={timestamp}`
The reconciler performs an anti-join against local PostgreSQL tables, inserting any missed records and updating status discrepancies caused by intermittent network drops.

---

## 2. Meta Marketing API Integration

### 2.1 Protocol & Version
- **API Version:** Graph API `v21.0`+
- **Auth:** Long-lived System User Access Token with `ads_read` and `read_insights` permissions.
- **Base URL:** `https://graph.facebook.com/v21.0/`

### 2.2 Insights Query Spec
Daily metrics are pulled at the ad level to allow granular rollups by Ad, Ad Set, Campaign, and mapped Treatment:

```http
GET /v21.0/act_{ad_account_id}/insights?
  level=ad&
  fields=campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,reach,clicks,cpc,cpm,ctr&
  time_range={'since':'YYYY-MM-DD','until':'YYYY-MM-DD'}&
  time_increment=1&
  limit=500
```

### 2.3 Rate Limit & Pagination Handling
- Meta headers `X-Business-Use-Case-Usage` and `X-App-Usage` are inspected on every response.
- When call count reaches 80% of quota, sync workers engage dynamic jitter backoff.
- Automatic cursor-based pagination follows `paging.next` until all pages are ingested.

---

## 3. Google Ads API Integration

### 3.1 Protocol & Version
- **API Version:** Google Ads API `v17`/`v18`
- **Auth:** OAuth 2.0 Client with offline access (Refresh Token) + Developer Token.
- **Protocol:** gRPC / REST via Google Ads SearchStream API.

### 3.2 GAQL Extraction Query
```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  ad_group.id,
  ad_group.name,
  ad_group_ad.ad.id,
  ad_group_ad.ad.name,
  segments.date,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc,
  metrics.conversions,
  metrics.conversions_value
FROM ad_group_ad
WHERE segments.date DURING LAST_30_DAYS
```

### 3.3 Micro-Unit Normalization
Google Ads outputs spend in `cost_micros` ($1.00 = 1,000,000 micros). The ingestion normalizer automatically applies:
`spend = cost_micros / 1000000.00`
and rounds to two decimal places in PostgreSQL.

---

## 4. Error Handling & Retry Architecture

```
                    ┌────────────────────────┐
                    │ External API / Webhook │
                    └───────────┬────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  HTTP Attempt   │
                       └────────┬────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
               2xx Success             4xx/5xx Failure
                    │                       │
                    ▼                       ▼
            ┌───────────────┐     ┌───────────────────┐
            │ Ingest to DB  │     │ Classify Error    │
            └───────────────┘     └─────────┬─────────┘
                                            │
                             ┌──────────────┴──────────────┐
                             │                             │
                      Transient (500, 429)         Permanent (401, 404)
                             │                             │
                             ▼                             ▼
                    ┌──────────────────┐          ┌───────────────────┐
                    │ Exponential      │          │ Mark Job Failed   │
                    │ Backoff (3 retries)         │ Alert Admin / UI  │
                    └──────────────────┘          └───────────────────┘
```
- Maximum retries: 3 attempts with exponential delay (2s, 8s, 32s).
- All failures log the complete response payload into `sync_runs.error_log` for instant UI inspection.
