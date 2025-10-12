-- ============================================================================
-- HELPER FUNCTION: can_access_brand_with_role
-- Check if user has specific role(s) for a brand
-- ============================================================================

CREATE OR REPLACE FUNCTION can_access_brand_with_role(
  check_brand_id TEXT,
  required_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 
    FROM user_brands(auth.uid()) 
    WHERE brand_id = check_brand_id 
    AND role = ANY(required_roles)
  );
END;
$$;

