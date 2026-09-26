-- ============================================================================
-- Migration 03: Seed Realistic Demo Data
-- ============================================================================

-- 1. Agency
INSERT INTO agencies (id, name, slug)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Apex Marketing Labs', 'apex-marketing')
ON CONFLICT (id) DO NOTHING;

-- 2. Clients
INSERT INTO clients (id, agency_id, name, slug, currency, timezone, status)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Aura Med Spa', 'aura-med-spa', 'USD', 'America/New_York', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Glow Aesthetics & Wellness', 'glow-aesthetics', 'USD', 'America/New_York', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Pure Dermatology Group', 'pure-dermatology', 'USD', 'America/Chicago', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. GHL Locations
INSERT INTO ghl_locations (id, client_id, location_id, name, sync_status)
VALUES
  ('g0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'loc_aura_nyc_01', 'Aura Med Spa - Manhattan', 'idle'),
  ('g0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'loc_glow_mia_02', 'Glow Aesthetics - Brickell', 'idle'),
  ('g0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'loc_pure_atx_03', 'Pure Dermatology - Austin', 'idle')
ON CONFLICT (id) DO NOTHING;

-- 4. Ad Accounts
INSERT INTO ad_accounts (id, client_id, platform, account_id, account_name)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'meta', 'act_4920194820', 'Aura Med Spa Meta Ads'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'google', '938-201-9481', 'Aura Google Ads'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'meta', 'act_7739201928', 'Glow Miami Meta')
ON CONFLICT (id) DO NOTHING;

-- 5. Treatments (Matching Jamie Tracking Sheet: Treatment 1 = Botox, Treatment 2 = Lip Filler)
INSERT INTO treatments (id, client_id, name, category, target_cpl, target_roas)
VALUES
  ('t0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Botox (Treatment 1)', 'Injectables', 25.00, 2.50),
  ('t0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Lip Filler (Treatment 2)', 'Injectables', 30.00, 2.20),
  ('t0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Laser Hair Removal (Treatment 3)', 'Aesthetics', 35.00, 2.00),
  ('t0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'CoolSculpting Body', 'Body Contouring', 50.00, 3.00),
  ('t0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Morpheus8 RF', 'Skin Rejuvenation', 45.00, 3.50)
ON CONFLICT (id) DO NOTHING;

-- 6. Campaigns
INSERT INTO campaigns (id, client_id, ad_account_id, external_campaign_id, name, objective, status)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'meta_camp_botox_01', 'NYC | Botox | Broad Interest | Sept 2026', 'OUTCOME_LEADS', 'active'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'meta_camp_lip_02', 'NYC | Lip Filler | Plump & Natural | Sept 2026', 'OUTCOME_LEADS', 'active'),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'google_camp_laser_03', 'Google Search | Laser Hair Removal NYC | Exact', 'LEADS', 'active')
ON CONFLICT (id) DO NOTHING;

-- 7. Campaign Mapping Rules
INSERT INTO campaign_mapping (id, client_id, treatment_id, campaign_id, pattern, match_type, priority)
VALUES
  ('m0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '.*botox.*', 'pattern', 10),
  ('m0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '.*lip.*filler.*', 'pattern', 10)
ON CONFLICT (id) DO NOTHING;

-- 8. Ad Daily Metrics (Direct replica of Jamie Tracking reference sheet: 9/23, 9/24, 9/25)
INSERT INTO ad_daily_metrics (id, client_id, treatment_id, campaign_id, date, spend, impressions, clicks, cpc, ctr)
VALUES
  -- Botox (9/23, 9/24, 9/25) - $500 spend per day
  ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '2026-09-23', 500.00, 18500, 310, 1.61, 0.0167),
  ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '2026-09-24', 500.00, 17200, 280, 1.78, 0.0162),
  ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '2026-09-25', 500.00, 18100, 295, 1.69, 0.0163),

  -- Lip Filler (9/23, 9/24, 9/25) - $500 spend per day
  ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '2026-09-23', 500.00, 16400, 275, 1.81, 0.0167),
  ('f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '2026-09-24', 500.00, 15900, 260, 1.92, 0.0163),
  ('f0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '2026-09-25', 500.00, 16800, 285, 1.75, 0.0169)
ON CONFLICT (id) DO NOTHING;
