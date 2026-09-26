# Attribution & Calculations Specification

## 1. Funnel Philosophy

Marketing attribution in performance med spas cannot rely on simplistic last-click analytics. A lead acquired on Meta may speak with an appointment setter 3 days later, attend an in-clinic consultation 5 days after that, and purchase a treatment package 2 weeks later.

The **AdFunnel Attribution Engine** preserves the complete chain of custody across every lifecycle transition:

```
[ Ad Spend ]  ──>  [ Leads (Contacts) ]  ──>  [ Appointments ]  ──>  [ Sales ]  ──>  [ Revenue ]
   (Meta/             (Form Submits /            (Self vs Setter       (Won Opps /     (Total $
  Google API)           Click IDs)                 Booked)              Invoices)      Collected)
```

---

## 2. Core Metrics & Mathematical Formulas

All calculations are executed server-side with zero-denominator guards to eliminate `NaN` or `Infinity` errors.

| Metric | Formula | Zero Denominator Guard | Display Format |
| :--- | :--- | :--- | :--- |
| **Ad Spend** | \(\sum \text{Daily Spend}\) | \(0.00\) | `\$X,XXX.XX` |
| **Leads** | \(\sum \text{Attributed Contacts}\) | \(0\) | Integer |
| **Cost Per Lead (CPL)** | \(\frac{\text{Ad Spend}}{\text{Leads}}\) | If \(\text{Leads} = 0 \implies 0.00\) | `\$XX.XX` |
| **Self-Booked Appts** | \(\sum \text{Appts}_{\text{self}}\) | \(0\) | Integer |
| **Setter-Booked Appts** | \(\sum \text{Appts}_{\text{setter}}\) | \(0\) | Integer |
| **Total Appointments** | \(\text{Appts}_{\text{self}} + \text{Appts}_{\text{setter}}\) | \(0\) | Integer |
| **Lead \(\to\) Appt %** | \(\left(\frac{\text{Total Appointments}}{\text{Leads}}\right) \times 100\) | If \(\text{Leads} = 0 \implies 0.0\%\) | `XX.X%` |
| **Sales** | \(\sum \text{Opportunities Won}\) | \(0\) | Integer |
| **Appt \(\to\) Sale %** | \(\left(\frac{\text{Sales}}{\text{Total Appointments}}\right) \times 100\) | If \(\text{Appts} = 0 \implies 0.0\%\) | `XX.X%` |
| **Revenue** | \(\sum \text{Transaction Amount}\) | \(0.00\) | `\$XX,XXX.XX` |
| **ROAS** | \(\frac{\text{Revenue}}{\text{Ad Spend}}\) | If \(\text{Ad Spend} = 0 \implies 0.00\) | `X.XX` |

### Zero-Safe Implementation (TypeScript)

```typescript
export interface FunnelMetrics {
  spend: number;
  leads: number;
  apptsSelf: number;
  apptsSetter: number;
  sales: number;
  revenue: number;
}

export interface DerivedMetrics {
  totalAppts: number;
  cpl: number;
  leadToApptPct: number;
  apptToSalePct: number;
  roas: number;
}

export function calculateDerivedMetrics(m: FunnelMetrics): DerivedMetrics {
  const totalAppts = m.apptsSelf + m.apptsSetter;
  const cpl = m.leads > 0 ? Number((m.spend / m.leads).toFixed(2)) : 0.0;
  const leadToApptPct = m.leads > 0 ? Number(((totalAppts / m.leads) * 100).toFixed(1)) : 0.0;
  const apptToSalePct = totalAppts > 0 ? Number(((m.sales / totalAppts) * 100).toFixed(1)) : 0.0;
  const roas = m.spend > 0 ? Number((m.revenue / m.spend).toFixed(2)) : 0.0;

  return {
    totalAppts,
    cpl,
    leadToApptPct,
    apptToSalePct,
    roas,
  };
}
```

---

## 3. Self-Booked vs. Setter-Booked Classification Matrix

Local aesthetic clinics distinguish appointments booked directly by the customer (instant online booking widget) versus those set by an internal appointment setter (outbound phone/SMS qualification).

AdFunnel provides a 4-tier configurable rule engine:

```
                  ┌───────────────────────────────┐
                  │ Ingest Appointment Webhook    │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────▼───────────────┐
                 │ 1. Check Appointment Source    │
                 │   source in ['widget', 'online']│
                 └───────┬───────────────┬───────┘
                         │ MATCH         │ NO MATCH
                         ▼               ▼
                 [ Self-Booked ] ┌───────────────────────────────┐
                                 │ 2. Check Contact / Appt Tags  │
                                 │   tags contain 'setter-booked'│
                                 └───────┬───────────────┬───────┘
                                         │ MATCH         │ NO MATCH
                                         ▼               ▼
                                 [ Setter-Booked ] ┌───────────────────────────────┐
                                                   │ 3. Check Assigned User / Cal  │
                                                   │   calendar_id in Setter Cals  │
                                                   └───────┬───────────────┬───────┘
                                                           │ MATCH         │ NO MATCH
                                                           ▼               ▼
                                                   [ Setter-Booked ] [ Default: Self ]
```

---

## 4. Deterministic Multi-Key Attribution Waterfall

When a lead enters GoHighLevel, the attribution engine executes a priority waterfall:

1. **Tier 1 — Direct Click Identifiers (Confidence 1.0):**
   - Matches `fbclid` against Meta Conversion Leads API / Pixel events.
   - Matches `gclid` against Google Ads Click Conversions.
2. **Tier 2 — UTM Exact Campaign Match (Confidence 0.95):**
   - Matches `utm_campaign` directly against active `campaigns.name` or `campaigns.external_campaign_id`.
3. **Tier 3 — Pattern & Regex Mapping (Confidence 0.85):**
   - Evaluates client-specific rules configured in `campaign_mapping` (e.g., regex `(?i)botox.*leadgen`).
4. **Tier 4 — Form & Tag Heuristics (Confidence 0.70):**
   - Evaluates submission form names or GHL tags (e.g., tag `Lead: Lip Filler`).
5. **Tier 5 — Quarantine Queue (Confidence 0.0):**
   - Flagged in the **Data Health Center** as an *Unattributed Lead*.
   - Admins can link it to a campaign in one click, which retroactively attributes downstream appointments, sales, and revenue.
