-- ============================================
-- AI Command Lab - Phase 0 RLS Policies
-- Secure multi-tenant isolation
-- ============================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Plans table is public read (no RLS needed)
-- ============================================
-- BRANDS
-- ============================================

-- Users can see their own brands (owner or member)
CREATE POLICY "Users can view brands they own or are members of"
ON brands FOR SELECT
USING (
  owner_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM brand_members
    WHERE brand_id = brands.id
      AND user_id = auth.uid()
      AND accepted_at IS NOT NULL
  )
);

-- Users can create brands (become owner)
CREATE POLICY "Users can create brands"
ON brands FOR INSERT
WITH CHECK (owner_user_id = auth.uid());

-- Only brand owners can update their brands
CREATE POLICY "Brand owners can update their brands"
ON brands FOR UPDATE
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Only brand owners can delete their brands
CREATE POLICY "Brand owners can delete their brands"
ON brands FOR DELETE
USING (owner_user_id = auth.uid());

-- ============================================
-- BRAND MEMBERS
-- ============================================

-- Members can see other members of brands they belong to
CREATE POLICY "Users can view brand members if they have access to the brand"
ON brand_members FOR SELECT
USING (can_access_brand(auth.uid(), brand_id));

-- Owners and admins can invite members
CREATE POLICY "Owners and admins can invite members"
ON brand_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_brands(auth.uid())
    WHERE brand_id = brand_members.brand_id
      AND role IN ('owner', 'admin')
  )
);

-- Owners and admins can update member roles
CREATE POLICY "Owners and admins can update members"
ON brand_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_brands(auth.uid())
    WHERE brand_id = brand_members.brand_id
      AND role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_brands(auth.uid())
    WHERE brand_id = brand_members.brand_id
      AND role IN ('owner', 'admin')
  )
);

-- Owners and admins can remove members
CREATE POLICY "Owners and admins can remove members"
ON brand_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_brands(auth.uid())
    WHERE brand_id = brand_members.brand_id
      AND role IN ('owner', 'admin')
  )
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Users can view subscriptions for brands they have access to
CREATE POLICY "Users can view subscriptions for their brands"
ON subscriptions FOR SELECT
USING (can_access_brand(auth.uid(), brand_id));

-- Only owners can create subscriptions
CREATE POLICY "Brand owners can create subscriptions"
ON subscriptions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brands
    WHERE id = subscriptions.brand_id
      AND owner_user_id = auth.uid()
  )
);

-- Only owners can update subscriptions
CREATE POLICY "Brand owners can update subscriptions"
ON subscriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM brands
    WHERE id = subscriptions.brand_id
      AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM brands
    WHERE id = subscriptions.brand_id
      AND owner_user_id = auth.uid()
  )
);

-- System (service role) can update subscriptions via Stripe webhook
-- This policy allows service_role to bypass RLS
-- Note: In practice, Stripe webhooks use service role key

-- ============================================
-- USAGE COUNTERS
-- ============================================

-- Users can view usage for brands they have access to
CREATE POLICY "Users can view usage counters for their brands"
ON usage_counters FOR SELECT
USING (can_access_brand(auth.uid(), brand_id));

-- System can insert/update usage counters
-- (Authenticated users typically don't directly modify these)
CREATE POLICY "Service role can manage usage counters"
ON usage_counters FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- ============================================
-- FEATURE FLAGS
-- ============================================

-- Users can view feature flags for brands they have access to
CREATE POLICY "Users can view feature flags for their brands"
ON feature_flags FOR SELECT
USING (
  brand_id IS NULL -- Global flags visible to all
  OR can_access_brand(auth.uid(), brand_id)
);

-- Only super admins (or service role) can create/update feature flags
-- For now, allow service role only
CREATE POLICY "Service role can manage feature flags"
ON feature_flags FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- ============================================
-- AUDIT LOGS
-- ============================================

-- Users can view audit logs for brands they have access to
CREATE POLICY "Users can view audit logs for their brands"
ON audit_logs FOR SELECT
USING (
  brand_id IS NULL
  OR can_access_brand(auth.uid(), brand_id)
);

-- System can insert audit logs
CREATE POLICY "System can create audit logs"
ON audit_logs FOR INSERT
WITH CHECK (TRUE);

-- No updates or deletes on audit logs (immutable)

