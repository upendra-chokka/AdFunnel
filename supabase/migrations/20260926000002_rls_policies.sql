-- ============================================================================
-- Migration 02: Row Level Security (RLS) & Multi-Tenant Policies
-- ============================================================================

-- Enable RLS across all business entities
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghl_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Retrieve current authenticated user's agency_id
CREATE OR REPLACE FUNCTION get_auth_agency_id() RETURNS UUID AS $$
  SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Verify if user has client-level access
CREATE OR REPLACE FUNCTION user_has_client_access(p_client_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN clients c ON c.agency_id = u.agency_id
    WHERE u.id = auth.uid() AND c.id = p_client_id
    AND (
      u.role IN ('super_admin', 'agency_admin') OR
      EXISTS (SELECT 1 FROM client_user_assignments WHERE client_id = p_client_id AND user_id = auth.uid())
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Agencies Policies
CREATE POLICY "Users can access their own agency" ON agencies
  FOR ALL USING (id = get_auth_agency_id());

-- 2. Users Policies
CREATE POLICY "Users can access coworkers in same agency" ON users
  FOR SELECT USING (agency_id = get_auth_agency_id());

-- 3. Clients Policies
CREATE POLICY "Clients access policy" ON clients
  FOR ALL USING (
    agency_id = get_auth_agency_id() AND user_has_client_access(id)
  );

-- 4. Treatments Policies
CREATE POLICY "Treatments access policy" ON treatments
  FOR ALL USING (user_has_client_access(client_id));

-- 5. Campaigns & Hierarchy Policies
CREATE POLICY "Campaigns access policy" ON campaigns
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Ad sets access policy" ON ad_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns WHERE id = ad_sets.campaign_id AND user_has_client_access(client_id))
  );

CREATE POLICY "Ads access policy" ON ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ad_sets s
      JOIN campaigns c ON c.id = s.campaign_id
      WHERE s.id = ads.ad_set_id AND user_has_client_access(c.client_id)
    )
  );

-- 6. CRM Entities Policies (Contacts, Appts, Opps, Revenue)
CREATE POLICY "Contacts access policy" ON contacts
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Appointments access policy" ON appointments
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Opportunities access policy" ON opportunities
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Revenue transactions access policy" ON revenue_transactions
  FOR ALL USING (user_has_client_access(client_id));

-- 7. Analytics & Attribution Policies
CREATE POLICY "Ad daily metrics access policy" ON ad_daily_metrics
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Lead attribution access policy" ON lead_attribution
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Campaign mapping access policy" ON campaign_mapping
  FOR ALL USING (user_has_client_access(client_id));

-- 8. Operations & Logs Policies
CREATE POLICY "Webhook events access policy" ON webhook_events
  FOR ALL USING (
    client_id IS NULL OR user_has_client_access(client_id)
  );

CREATE POLICY "Sync runs access policy" ON sync_runs
  FOR ALL USING (user_has_client_access(client_id));

CREATE POLICY "Audit logs access policy" ON audit_logs
  FOR ALL USING (agency_id = get_auth_agency_id());
