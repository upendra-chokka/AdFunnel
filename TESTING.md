# Testing & Quality Assurance Strategy

## 1. Testing Philosophy

AdFunnel Intelligence handles critical financial and attribution metrics. Incorrect formulas, unhandled zero denominators, or dropped webhooks directly damage agency trust. Testing is organized into three defensive rings:

1. **Unit Tests (Vitest):** Core mathematical engine, zero-division resilience, Ed25519 signature verification, and attribution pattern matching.
2. **Integration Tests (Vitest + Supabase Test DB / Mock Provider):** Webhook idempotency, duplicate event handling, campaign-to-treatment mapping resolution, and daily aggregation rollups.
3. **End-to-End & Browser Verification:** Dashboard rendering, client switching, date range filtering, responsive tables, and demo mode verification.

---

## 2. Test Suite Specifications

### 2.1 Unit Tests (`src/__tests__/metrics.test.ts`)

- **Zero-Denominator Defense:**
  - Verify `CPL` returns `0.00` when `leads = 0` (even when `spend > 0`).
  - Verify `Lead -> Appt %` returns `0.0%` when `leads = 0`.
  - Verify `Appt -> Sale %` returns `0.0%` when `totalAppts = 0`.
  - Verify `ROAS` returns `0.00` when `spend = 0`.
- **Floating Point & Rounding Integrity:**
  - Confirm currency rounds strictly to 2 decimal places.
  - Confirm conversion rates round to 1 decimal place.
  - Confirm ROAS rounds to 2 decimal places.

### 2.2 Attribution Engine Tests (`src/__tests__/attribution.test.ts`)

- **Waterfall Priority:**
  - Given a lead with both `fbclid` and matching `utm_campaign`, verify `fbclid` attribution takes priority (Tier 1).
  - Given a lead without click IDs, verify regex pattern match to treatment (Tier 3).
  - Given an unrecognizable campaign name, verify lead routes to `lead_attribution.confidence_score = 0.0` (Quarantine Queue).

### 2.3 Webhook Idempotency Tests (`src/__tests__/webhooks.test.ts`)

- **Duplicate Delivery Protection:**
  - Post mock `ContactCreate` payload with `event_id = "evt_test_123"`. Verify `200 OK` and contact record created in DB.
  - Re-post identical mock payload. Verify `200 OK` returned immediately with status `duplicate`, and no duplicate contact created.

### 2.4 Browser Verification Checklist

1. **Executive Dashboard:**
   - Verify KPI cards (Spend, Leads, Appts, Sales, Revenue, ROAS) accurately sum all underlying clients.
   - Verify Funnel drop-off percentages match step-by-step math.
2. **Client Dashboard:**
   - Filter by "ABC Med Spa" and confirm data updates seamlessly.
   - Verify Treatment table lists each offer with correct calculated metrics.
3. **Daily Performance Matrix:**
   - Verify columns render dates horizontally (matching the Jamie tracking spreadsheet).
   - Verify rows: Spend, Leads, Self-Booked, Setter-Booked, Sales, Revenue, CPL, Lead \(\to\) Appt %, Appt \(\to\) Sale %, ROAS.
4. **Data Health Center:**
   - Verify connection statuses show green indicators.
   - Inspect Unattributed Leads modal and test 1-click campaign reassignment.
