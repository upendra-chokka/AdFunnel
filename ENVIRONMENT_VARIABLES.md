# Environment Variables & Configuration Reference

This document outlines all required and optional environment variables for local development, staging, and production.

---

## 1. Core Application & Database

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Environment stage | `development` / `production` |
| `NEXT_PUBLIC_APP_URL` | Yes | Base canonical URL of the application | `http://localhost:3000` or `https://app.adfunnel.io` |
| `NEXT_PUBLIC_DEMO_MODE` | No | Force mock demo data engine | `true` or `false` (default: `false`) |
| `NEXT_PUBLIC_SUPABASE_URL`| Yes | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Anonymous Client Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Service Role Key (Server-only bypass RLS for background sync) | `eyJhbGciOi...` |

---

## 2. GoHighLevel (LeadConnector) Integration

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `GHL_CLIENT_ID` | Production | HighLevel Marketplace App Client ID | `64d...` |
| `GHL_CLIENT_SECRET` | Production | HighLevel Marketplace App Secret | `secret_...` |
| `GHL_OAUTH_REDIRECT_URI` | Production | Callback endpoint for OAuth | `https://app.adfunnel.io/api/integrations/ghl/callback` |
| `GHL_WEBHOOK_PUBLIC_KEY` | Production | Ed25519 public key for verifying `X-GHL-Signature` | `32-byte hex string` |

---

## 3. Meta Marketing API

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `META_APP_ID` | Production | Facebook Developer App ID | `123456789012345` |
| `META_APP_SECRET` | Production | Facebook App Secret | `secret_...` |
| `META_SYSTEM_USER_TOKEN` | Production | Permanent System User Token with `ads_read` | `EAAB...` |

---

## 4. Google Ads API

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `GOOGLE_ADS_CLIENT_ID` | Production | Google Cloud OAuth Client ID | `...apps.googleusercontent.com` |
| `GOOGLE_ADS_CLIENT_SECRET` | Production | Google Cloud OAuth Secret | `GOCSPX-...` |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Production | Approved Google Ads Developer Token | `abc123xyz` |
| `GOOGLE_ADS_REFRESH_TOKEN` | Production | Offline refresh token with Ads scope | `1//04...` |

---

## 5. Security & Encryption

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `ENCRYPTION_KEY` | Yes | 32-byte hexadecimal key for AES-256-GCM token encryption in DB | `64-char hex string` |
| `CRON_SECRET` | Yes | Bearer token for triggering reconciliation endpoints | `sec_cron_...` |

---

## 6. Local `.env.example` Template

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Encryption & Cron
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
CRON_SECRET=demo_cron_secret_adfunnel_2026

# Production API Placeholders (Optional during Demo Mode)
GHL_CLIENT_ID=
GHL_CLIENT_SECRET=
GHL_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/ghl/callback
GHL_WEBHOOK_PUBLIC_KEY=
META_APP_ID=
META_APP_SECRET=
META_SYSTEM_USER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_REFRESH_TOKEN=
```
