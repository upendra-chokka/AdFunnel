# AdFunnel Intelligence

> Multi-Client Marketing Performance & Attribution Platform for Performance Agencies and Med Spas.

---

## 1. Overview

**AdFunnel Intelligence** is an enterprise-grade multi-client marketing analytics and attribution platform built for agencies managing high-ticket local services (med spas, dental clinics, cosmetic wellness).

It replaces fragile manual spreadsheets (such as the legacy Jamie Tracking Sheet) with a centralized, automated system of record connecting:
1. **Ad Platforms:** Meta Ads, Google Ads (Ad Spend, Impressions, Clicks)
2. **CRM & Booking Engine:** GoHighLevel (Leads, Self-Booked & Setter-Booked Appointments, Won Opportunities, Revenue)
3. **Attribution Engine:** Deterministic multi-touch matching linking Ad Spend → Lead → Appointment → Sale → Revenue
4. **Interactive BI Dashboards:** Dynamic executive, client, treatment, campaign, and daily cohort reporting with real-time health diagnostics.

---

## 2. Core Value Proposition

| Legacy Spreadsheet Tracking | AdFunnel Intelligence Platform |
| :--- | :--- |
| **Manual Data Entry:** Daily manual copy-paste of ad spend and GHL counts. | **Automated Ingestion:** Real-time GHL webhooks + nightly reconciliation API pulls. |
| **No Real Attribution:** Disconnected numbers without proof of which lead became which sale. | **Deterministic Attribution:** Multi-key matching (GCLID, FBCLID, UTMs, GHL Contact IDs). |
| **Single-Client Silo:** Separate sheets for each client; formula breakage risk. | **Multi-Tenant Architecture:** Agency-wide governance with strict client isolation & RLS. |
| **Zero Auditability:** Impossible to diagnose discrepancies or missing leads. | **Data Health Center:** Live detection of unattributed leads and unmapped campaigns. |
| **Static Snapshots:** Prone to formula corruption, zero concurrency. | **PostgreSQL Core:** High-performance relational source of truth with automated backups. |

---

## 3. Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts
- **Backend:** Next.js API Routes, Server Actions, Edge Functions
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) and Supabase Auth
- **Integrations:**
  - GoHighLevel API v2 + Webhooks (Ed25519 signature verification)
  - Meta Marketing API (v21+)
  - Google Ads API (v17/v18)
- **Deployment:** Vercel + Supabase Cloud

---

## 4. Documentation Index

- [Architecture Specification](ARCHITECTURE.md): System design, ingestion pipelines, reconciliation, and tenant structure.
- [Database Schema & DDL](DATABASE_SCHEMA.md): Complete relational tables, foreign keys, indexes, and RLS policies.
- [API Integrations Spec](API_INTEGRATIONS.md): GoHighLevel, Meta, and Google Ads protocols, webhooks, and rate limiting.
- [Attribution Engine](ATTRIBUTION.md): Mathematical formulas, matching hierarchy, and appointment classification.
- [Testing Strategy](TESTING.md): Unit tests, mock payloads, zero-denominator safeguards, and browser QA.
- [Deployment Guide](DEPLOYMENT.md): Production deployment to Vercel and Supabase.
- [Environment Variables](ENVIRONMENT_VARIABLES.md): Detailed configuration reference for local and production.

---

## 5. Development Roadmap (7 Phases)

- [ ] **Phase 0:** Architecture, Schema, and UI/UX Specification *(Current)*
- [ ] **Phase 1:** Project Foundation, Next.js Shell, Supabase Auth, Navigation & Demo Mode
- [ ] **Phase 2:** Database Migrations, RLS Policies, Constraints & Seed Data Engine
- [ ] **Phase 3:** GoHighLevel Integration (OAuth, Real-Time Webhooks & Reconciliation Engine)
- [ ] **Phase 4:** Advertising Platforms Integration (Meta Ads Insights & Google Ads Reporting)
- [ ] **Phase 5:** Attribution Engine (Deterministic Multi-Touch & Campaign/Treatment Mappings)
- [ ] **Phase 6:** Professional BI Dashboards (Executive, Client, Treatment, Campaign, Daily Matrix)
- [ ] **Phase 7:** Production Hardening (Rate Limiting, Health Center, Automated Retries & Audit Logs)
