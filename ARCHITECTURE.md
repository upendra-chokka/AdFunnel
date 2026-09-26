# System Architecture Specification

## 1. System Overview

AdFunnel Intelligence is architected as an event-driven, multi-tenant performance marketing platform. It decouples high-volume external event streams (webhooks and ad spend syncs) from relational business entities and aggregated business intelligence views.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               EXTERNAL PROVIDERS                                │
│                                                                                 │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐   │
│   │      Meta Ads       │   │     Google Ads      │   │     GoHighLevel     │   │
│   │  Campaign / Spend   │   │  Campaign / Spend   │   │ Contacts / Appts /  │   │
│   │     (Graph API)     │   │     (GAQL API)      │   │  Opp / Transactions │   │
│   └──────────┬──────────┘   └──────────┬──────────┘   └──────────┬──────────┘   │
└──────────────┼─────────────────────────┼─────────────────────────┼──────────────┘
               │ Daily Batch Sync        │ Daily Batch Sync        │ Real-time Webhooks & Batch
               ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA INGESTION LAYER                               │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                        Webhook Ingestion Gateway                        │   │
│   │       - Signature Verification (Ed25519 for GHL, SHA256 for Meta)       │   │
│   │       - Idempotency deduplication via event hash                        │   │
│   │       - Raw payload persistence in `webhook_events`                     │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                   Scheduled Reconciliation Engine                       │   │
│   │       - Automated nightly sync (sliding 7-to-30-day window)             │   │
│   │       - Anomaly detection & retroactive spend/conversion healing        │   │
│   │       - Rate-limit aware queue with exponential backoff                 │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    NORMALIZATION & ATTRIBUTION PIPELINE                         │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                          Entity Normalizer                              │   │
│   │   - Translates raw GHL contacts, opportunities, and appointments        │   │
│   │   - Normalizes ad spend to standard micro-units and ISO currencies      │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│   ┌────────────────────────────────────▼────────────────────────────────────┐   │
│   │                     Deterministic Attribution Engine                    │   │
│   │   Multi-Key Cascade:                                                    │   │
│   │   1. Click IDs: FBCLID / GCLID                                          │   │
│   │   2. UTM Parameters: utm_source, utm_medium, utm_campaign, utm_content  │   │
│   │   3. Provider Entity IDs: GHL Contact ID -> Ad ID / Campaign ID         │   │
│   │   4. Deterministic Rule Matching: Regex patterns & Admin manual map     │   │
│   │   5. Unattributed Quarantine Queue: Flagged for operator review         │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      STORAGE & PERSISTENCE (PostgreSQL / Supabase)              │
│                                                                                 │
│   ┌──────────────────────────────┐         ┌──────────────────────────────┐     │
│   │       Relational Core        │         │      Aggregated Cohorts      │     │
│   │ - agencies, clients, users   │         │ - ad_daily_metrics           │     │
│   │ - treatments, campaigns      │         │ - daily_funnel_summary       │     │
│   │ - contacts, appointments     │         │   (Precomputed for <50ms UI) │     │
│   │ - opportunities, sales       │         │                              │     │
│   └──────────────────────────────┘         └──────────────────────────────┘     │
│                   ▲                                       ▲                     │
│                   └───────────────────┬───────────────────┘                     │
│                                       │                                         │
│                      Row Level Security (RLS) Enforcement                       │
└───────────────────────────────────────┼─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION & REPORTING                             │
│                                                                                 │
│  ┌────────────────────────────┐ ┌────────────────────────────┐ ┌──────────────┐ │
│  │    Executive Dashboard     │ │      Client Dashboard      │ │ Daily Funnel │ │
│  │  - Agency-wide rollups     │ │  - Per-treatment breakdown │ │ - Spreadsheet│ │
│  │  - Funnel visualizer       │ │  - CPL, CAC, ROAS metrics  │ │   matrix view│ │
│  └────────────────────────────┘ └────────────────────────────┘ └──────────────┘ │
│  ┌────────────────────────────┐ ┌────────────────────────────┐ ┌──────────────┐ │
│  │     Attribution Studio     │ │     Data Health Center     │ │ Google Sheet │ │
│  │  - Lead path drill-down    │ │  - Unmapped campaigns audit│ │ / CSV Export │ │
│  │  - Manual override UI      │ │  - Webhook delivery health │ │              │ │
│  └────────────────────────────┘ └────────────────────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenant Hierarchy

The platform implements strict tenant isolation through a 6-tier hierarchy:

```
Agency (Tenant Root)
  └── Users (Super Admin, Agency Admin, Account Manager, Viewer)
        └── Clients (e.g., "ABC Med Spa", "Radiance Aesthetics")
              ├── GHL Locations (Location ID, API Keys/OAuth tokens)
              ├── Ad Accounts (Meta Ad Account ID, Google Ads Customer ID)
              ├── Treatments (e.g., "Botox", "Lip Filler", "Laser Hair Removal")
              └── Campaigns (Meta Campaigns, Google Campaigns)
                    └── Ad Sets / Ad Groups
                          └── Ads / Creatives
```

### Access Control Model (RBAC)

1. **Super Admin:** Global platform administration, agency provisioning, tenant management, and system health telemetry.
2. **Agency Admin:** Full access to all agency clients, campaign-to-treatment mappings, integration credentials, user management, and exports.
3. **Account Manager:** Access limited to assigned clients; can edit mappings, inspect attribution, and view dashboards.
4. **Viewer (Client-Facing / Read-Only):** Read-only access to client dashboards, treatment summaries, and export capabilities.

---

## 3. Data Ingestion Architecture

### 3.1 Real-Time Ingestion (GoHighLevel Webhooks)
- **Endpoint:** `/api/webhooks/ghl/[client_id]`
- **Signature Verification:** Verified using GoHighLevel's Ed25519 signature format (`X-GHL-Signature` header) with legacy HMAC-SHA256 fallback.
- **Idempotency Guarantee:** Every incoming webhook is recorded in `webhook_events` with `(provider, event_id)` unique constraint. Duplicate webhook deliveries receive immediate `200 OK` acknowledgment without re-triggering mutation logic.
- **Payload Preservation:** Full raw JSON payloads are preserved in JSONB columns before parsing, ensuring zero data loss if downstream schemas evolve.

### 3.2 Scheduled Batch Ingestion (Ad Spend & Reconciliation)
- **Meta Graph API Insights:** Synchronizes daily spend, reach, impressions, clicks, CPC, and CPM per campaign/adset/ad level.
- **Google Ads API (GAQL):** Extracts campaign, ad group, and ad level daily performance metrics.
- **Reconciliation Engine:** Nightly job executing a 7-day to 30-day sliding window reconciliation. This accounts for:
  - Ad network attribution window adjustments (e.g., 7-day click / 1-day view attribution changes).
  - Retroactively updated CRM opportunity values or late-stage payments.
  - Heals missed webhook events during network interruptions.

---

## 4. Normalization and Aggregation Pipeline

To deliver sub-50ms dashboard response times without querying millions of raw CRM touchpoints, data is organized into three distinct tiers:

1. **Raw Tier (`webhook_events`, `sync_runs`):**
   Unmodified external payloads stored for auditing, compliance, and replayability.
2. **Normalized Relational Tier (`contacts`, `appointments`, `opportunities`, `sales`):**
   Standardized domain models with typed fields and external foreign key mapping.
3. **Aggregated Analytics Tier (`ad_daily_metrics` & materialized daily summaries):**
   Daily precomputed grain by `(client_id, treatment_id, campaign_id, date)` storing:
   - `ad_spend`
   - `leads_count`
   - `appts_self_booked`
   - `appts_setter_booked`
   - `sales_count`
   - `revenue_amount`
   - Derived: `cpl`, `lead_to_appt_pct`, `appt_to_sale_pct`, `roas`.

---

## 5. Demo Mode Architecture

To support client demonstrations and development before receiving production API credentials:
- **Environment Switch:** `NEXT_PUBLIC_DEMO_MODE=true` or an interactive header toggle.
- **Isolated Seed Generator:** Deterministic seed engine generating 3 realistic Med Spa clients:
  1. *Aura Med Spa* (Botox, Dermal Fillers, Morpheus8, Laser Hair Removal)
  2. *Elevate Dermatology* (Botox, SkinPen, HydraFacial)
  3. *Luxe Body Contouring* (CoolSculpting, Emsculpt Neo)
- **Dynamic Volatility:** Seed generator matches the exact metrics and daily variations from the Jamie Tracking spreadsheet (realistic CPLs from $18–$45, 25–40% Lead-to-Appt rates, 20–30% Appt-to-Sale closing rates, and 2.0–3.5 ROAS).
