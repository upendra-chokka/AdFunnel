# Database Schema & Data Model Specification

## 1. Schema Overview

The database is built on **PostgreSQL** (managed via **Supabase**) utilizing `uuid-ossp` and `pgcrypto` extensions. All timestamps are stored with timezone (`TIMESTAMPTZ`), and all financial values are stored as high-precision `NUMERIC(14, 2)` or `NUMERIC(18, 4)` to eliminate floating-point rounding errors.

---

## 2. Entity-Relationship Diagram

```
[agencies] ──1:N── [users]
    │
   1:N
    │
[clients] ───────1:N─────── [treatments]
    │                              │
   1:N                            1:N
    │                              │
[ad_accounts]              [treatment_mapping]
    │
   1:N
    │
[campaigns] ─────1:N────── [campaign_mapping]
    │
   1:N
    │
[ad_sets]
    │
   1:N
    │
[ads] ──1:N── [ad_daily_metrics]
    │
    └──1:N── [lead_attribution] ──N:1── [contacts (leads)]
                                               │
                                              1:N
                                               │
                                        [appointments]
                                               │
                                              1:N
                                               │
                                        [opportunities]
                                               │
                                              1:N
                                               │
                                     [revenue_transactions]
```

---

## 3. Relational DDL Specifications

```sql
-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TENANCY & USERS
-- ============================================================================

CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('super_admin', 'agency_admin', 'account_manager', 'viewer');

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (agency_id, slug)
);

CREATE TABLE client_user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, user_id)
);

-- ============================================================================
-- 2. CRM & LOCATIONS (GoHighLevel)
-- ============================================================================

CREATE TABLE ghl_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    location_id TEXT NOT NULL UNIQUE,
    company_id TEXT,
    name TEXT NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    webhook_secret_encrypted TEXT,
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. ADVERTISING PLATFORMS & CAMPAIGN HIERARCHY
-- ============================================================================

CREATE TYPE ad_platform AS ENUM ('meta', 'google', 'tiktok');

CREATE TABLE ad_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platform ad_platform NOT NULL,
    account_id TEXT NOT NULL, -- e.g. "act_12345678" or Google Customer ID
    account_name TEXT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, platform, account_id)
);

CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Botox", "Lip Filler", "Laser Hair Removal"
    category TEXT,
    target_cpl NUMERIC(10, 2),
    target_roas NUMERIC(6, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, name)
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
    external_campaign_id TEXT NOT NULL,
    name TEXT NOT NULL,
    objective TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ad_account_id, external_campaign_id)
);

CREATE TABLE ad_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    external_adset_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, external_adset_id)
);

CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_set_id UUID NOT NULL REFERENCES ad_sets(id) ON DELETE CASCADE,
    external_ad_id TEXT NOT NULL,
    name TEXT NOT NULL,
    creative_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ad_set_id, external_ad_id)
);

-- ============================================================================
-- 4. CAMPAIGN & TREATMENT MAPPING ENGINE
-- ============================================================================

CREATE TABLE campaign_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    pattern TEXT, -- e.g. regex '.*botox.*' or exact external ID
    match_type TEXT NOT NULL DEFAULT 'pattern' CHECK (match_type IN ('exact', 'pattern', 'tag')),
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. CRM NORMALIZED ENTITIES (LEADS, APPOINTMENTS, SALES)
-- ============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    ghl_location_id UUID REFERENCES ghl_locations(id) ON DELETE SET NULL,
    external_contact_id TEXT NOT NULL, -- GHL Contact ID
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    raw_attribution JSONB DEFAULT '{}'::jsonb, -- utm_source, fbclid, gclid, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, external_contact_id)
);

CREATE TYPE appointment_type AS ENUM ('self_booked', 'setter_booked', 'unknown');
CREATE TYPE appointment_status AS ENUM ('new', 'confirmed', 'cancelled', 'showed', 'no_show', 'invalid');

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    external_appointment_id TEXT NOT NULL, -- GHL Event/Appointment ID
    calendar_id TEXT,
    appointment_type appointment_type NOT NULL DEFAULT 'unknown',
    status appointment_status NOT NULL DEFAULT 'new',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    booking_source TEXT, -- 'widget', 'setter_manual', etc.
    assigned_user_id TEXT,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, external_appointment_id)
);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    external_opportunity_id TEXT NOT NULL,
    pipeline_id TEXT NOT NULL,
    stage_id TEXT NOT NULL,
    stage_name TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'abandoned')),
    monetary_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, external_opportunity_id)
);

CREATE TABLE revenue_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    external_transaction_id TEXT, -- Invoice / payment ID
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded', 'failed', 'pending')),
    transaction_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. ATTRIBUTION CORE
-- ============================================================================

CREATE TABLE lead_attribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    platform ad_platform,
    touchpoint_type TEXT NOT NULL DEFAULT 'first_click',
    confidence_score NUMERIC(4, 2) NOT NULL DEFAULT 1.00, -- 1.00 exact, 0.80 UTM, 0.50 pattern
    matched_by TEXT NOT NULL, -- 'fbclid', 'gclid', 'utm_campaign', 'pattern', 'manual'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    click_id TEXT, -- FBCLID or GCLID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. AGGREGATED DAILY AD METRICS
-- ============================================================================

CREATE TABLE ad_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    spend NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    impressions INT NOT NULL DEFAULT 0,
    reach INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    cpc NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    cpm NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    ctr NUMERIC(6, 4) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, campaign_id, ad_id, date)
);

-- ============================================================================
-- 8. SYSTEM OPERATIONS, LOGGING & WEBHOOKS
-- ============================================================================

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'gohighlevel', 'meta'
    event_id TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'duplicate')),
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, event_id)
);

CREATE TABLE sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'ghl', 'meta', 'google_ads'
    sync_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (sync_type IN ('realtime', 'scheduled', 'manual_replay')),
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    records_synced INT NOT NULL DEFAULT 0,
    records_failed INT NOT NULL DEFAULT 0,
    error_log JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX idx_contacts_client_created ON contacts(client_id, created_at DESC);
CREATE INDEX idx_appointments_client_date ON appointments(client_id, start_time DESC);
CREATE INDEX idx_opportunities_client_status ON opportunities(client_id, status);
CREATE INDEX idx_revenue_client_date ON revenue_transactions(client_id, transaction_date DESC);
CREATE INDEX idx_ad_daily_metrics_lookup ON ad_daily_metrics(client_id, treatment_id, date);
CREATE INDEX idx_lead_attribution_lookup ON lead_attribution(client_id, campaign_id, treatment_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status, created_at);
CREATE INDEX idx_campaign_mapping_pattern ON campaign_mapping(client_id, match_type, priority DESC);

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_attribution ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's agency_id
CREATE OR REPLACE FUNCTION get_auth_agency_id() RETURNS UUID AS $$
  SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Agencies policy
CREATE POLICY agency_access_policy ON agencies
    FOR ALL USING (id = get_auth_agency_id());

-- Clients policy
CREATE POLICY client_access_policy ON clients
    FOR ALL USING (
        agency_id = get_auth_agency_id() AND (
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'agency_admin')) OR
            EXISTS (SELECT 1 FROM client_user_assignments WHERE client_id = clients.id AND user_id = auth.uid())
        )
    );

-- Treatments policy
CREATE POLICY treatments_access_policy ON treatments
    FOR ALL USING (
        client_id IN (SELECT id FROM clients WHERE agency_id = get_auth_agency_id())
    );

-- Daily metrics policy
CREATE POLICY metrics_access_policy ON ad_daily_metrics
    FOR ALL USING (
        client_id IN (SELECT id FROM clients WHERE agency_id = get_auth_agency_id())
    );
```
