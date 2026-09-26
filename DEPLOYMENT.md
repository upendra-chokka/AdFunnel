# Deployment & Infrastructure Guide

## 1. Hosting Architecture

- **Web Application & API Routes:** Deployed on **Vercel** (Node.js runtime + Edge middleware).
- **Database & Identity:** Hosted on **Supabase** (Managed PostgreSQL 15+).
- **Scheduled Background Tasks:** Managed via **Vercel Cron** or Supabase `pg_cron`.

```
[ DNS (Cloudflare / Vercel Edge) ]
                │
                ▼
        [ Next.js on Vercel ]
         ├── Edge Middleware (Auth & Tenant routing)
         ├── Server Actions & SSR Dashboard
         └── API Routes (/api/webhooks/ghl, /api/sync/*)
                │
                ▼
   [ Supabase Cloud (PostgreSQL 15) ]
    ├── Row Level Security (RLS)
    ├── Realtime Publication
    └── Automated Daily Backups
```

---

## 2. Supabase Setup Steps

1. **Create Supabase Project:**
   - Select region closest to agency operations (e.g., `us-east-1`).
2. **Execute Migrations:**
   - Run SQL scripts from `DATABASE_SCHEMA.md` in the Supabase SQL Editor or via Supabase CLI:
     ```bash
     npx supabase db push
     ```
3. **Configure Authentication:**
   - Enable Email/Password authentication.
   - Disable open signups (users must be invited by Agency Admin).
4. **Copy API Keys:**
   - Obtain `Project URL`, `anon public` key, and `service_role` key.

---

## 3. Vercel Deployment Steps

1. Connect the GitHub repository to Vercel.
2. In Project Settings \(\to\) Environment Variables, configure all keys listed in `ENVIRONMENT_VARIABLES.md`.
3. Set the Build Command:
   ```bash
   npm run build
   ```
4. Configure `vercel.json` for cron triggers:
   ```json
   {
     "crons": [
       {
         "path": "/api/sync/nightly-reconcile",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```
5. Deploy to Production.

---

## 4. Webhook Endpoint Registration in GoHighLevel

1. In HighLevel Marketplace Developer Portal, register your app webhook:
   - URL: `https://app.adfunnel.io/api/webhooks/ghl`
   - Events subscribed:
     - `ContactCreate`
     - `ContactUpdate`
     - `AppointmentCreate`
     - `AppointmentUpdate`
     - `OpportunityStageUpdate`
     - `PaymentReceived`
2. Copy the Ed25519 Public Key into `GHL_WEBHOOK_PUBLIC_KEY`.
