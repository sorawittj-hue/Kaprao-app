-- ============================================================
-- KAPRAO52 — COUPON SYSTEM HELPER FUNCTIONS
-- ฟังก์ชั่นช่วยเหลือสำหรับระบบคูปอง
-- ============================================================

-- Function: Increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE coupons 
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = p_coupon_id;
END;
$$;

-- Function: Get user's coupon usage count
CREATE OR REPLACE FUNCTION get_user_coupon_usage(
    p_coupon_id bigint,
    p_user_id uuid
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count int;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM coupon_usages
    WHERE coupon_id = p_coupon_id AND user_id = p_user_id;
    
    RETURN v_count;
END;
$$;

-- Function: Get coupon stats
CREATE OR REPLACE FUNCTION get_coupon_stats(p_coupon_id bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_usage int;
    v_total_discount numeric;
    v_unique_users int;
BEGIN
    SELECT 
        COUNT(*),
        COALESCE(SUM(discount_amount), 0),
        COUNT(DISTINCT user_id)
    INTO v_total_usage, v_total_discount, v_unique_users
    FROM coupon_usages
    WHERE coupon_id = p_coupon_id;
    
    RETURN jsonb_build_object(
        'total_usage', v_total_usage,
        'total_discount_given', v_total_discount,
        'unique_users', v_unique_users
    );
END;
$$;

-- Function: Get available coupons for user
CREATE OR REPLACE FUNCTION get_available_coupons_for_user(p_user_id uuid)
RETURNS TABLE (
    id bigint,
    code text,
    name text,
    description text,
    discount_type text,
    discount_value numeric,
    min_order_amount numeric,
    max_discount numeric,
    usage_limit int,
    usage_count int,
    per_user_limit int,
    applicable_items bigint[],
    excluded_items bigint[],
    starts_at timestamptz,
    expires_at timestamptz,
    is_active boolean,
    user_usage_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.code,
        c.name,
        c.description,
        c.discount_type,
        c.discount_value,
        c.min_order_amount,
        c.max_discount,
        c.usage_limit,
        c.usage_count,
        c.per_user_limit,
        c.applicable_items,
        c.excluded_items,
        c.starts_at,
        c.expires_at,
        c.is_active,
        COALESCE(uc.usage_count, 0) as user_usage_count
    FROM coupons c
    LEFT JOIN (
        SELECT coupon_id, COUNT(*) as usage_count
        FROM coupon_usages
        WHERE user_id = p_user_id
        GROUP BY coupon_id
    ) uc ON c.id = uc.coupon_id
    WHERE c.is_active = true
    AND c.starts_at <= now()
    AND (c.expires_at IS NULL OR c.expires_at > now())
    AND (c.usage_limit IS NULL OR c.usage_count < c.usage_limit)
    AND COALESCE(uc.usage_count, 0) < c.per_user_limit
    ORDER BY c.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_coupon_usage(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_coupon_usage(bigint, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_coupon_stats(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_coupons_for_user(uuid) TO authenticated;

-- Update RLS policy for coupons to allow listing all active coupons
DROP POLICY IF EXISTS "coupons_select_active" ON public.coupons;

CREATE POLICY "coupons_select_active" ON public.coupons 
FOR SELECT USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
);

-- Ensure admins can manage all coupons
DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;

CREATE POLICY "coupons_admin_all" ON public.coupons 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Policy for coupon usages
DROP POLICY IF EXISTS "coupon_usages_select_own" ON public.coupon_usages;
DROP POLICY IF EXISTS "coupon_usages_insert_own" ON public.coupon_usages;

CREATE POLICY "coupon_usages_select_own" ON public.coupon_usages 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "coupon_usages_insert_own" ON public.coupon_usages 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add admin policy for coupon_usages
CREATE POLICY "coupon_usages_admin_all" ON public.coupon_usages 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
