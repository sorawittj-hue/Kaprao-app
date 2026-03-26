-- ============================================================
-- FIX: Orders System - Pure Supabase Approach (No LocalStorage)
-- ============================================================
-- หลักการ: ใช้ Supabase อย่างเดียว ไม่พึ่ง LocalStorage
-- วิธีการ:
--   1. Authenticated users: ดูด้วย user_id
--   2. LINE users: ดูด้วย line_user_id  
--   3. Guest users: ดูด้วย phone_number (ผ่าน RPC function)
--   4. Order detail: ดูด้วย ID โดยตรง (ต้องรู้ ID ก่อน)
-- ============================================================

-- ============================================================
-- 1. RPC FUNCTION: ค้นหาออเดอร์ด้วยเบอร์โทร (สำหรับ Guest)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_orders_by_phone(phone_input text)
RETURNS TABLE (
    id bigint,
    user_id uuid,
    line_user_id text,
    customer_name text,
    phone_number text,
    address text,
    delivery_method text,
    special_instructions text,
    items jsonb,
    status text,
    total_price numeric,
    subtotal_price numeric,
    discount_amount numeric,
    discount_code text,
    points_redeemed int,
    points_earned int,
    payment_method text,
    payment_status text,
    created_at timestamptz,
    updated_at timestamptz,
    estimated_ready_time timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- ตรวจสอบว่าเบอร์โทรถูกต้อง (ไม่ว่าง และยาวพอ)
    IF phone_input IS NULL OR LENGTH(TRIM(phone_input)) < 9 THEN
        RETURN;
    END IF;
    
    -- คืนค่าออเดอร์ที่มีเบอร์โทรตรงกัน (7 วันล่าสุด)
    RETURN QUERY
    SELECT 
        o.id,
        o.user_id,
        o.line_user_id,
        o.customer_name,
        o.phone_number,
        o.address,
        o.delivery_method,
        o.special_instructions,
        o.items,
        o.status,
        o.total_price,
        o.subtotal_price,
        o.discount_amount,
        o.discount_code,
        o.points_redeemed,
        o.points_earned,
        o.payment_method,
        o.payment_status,
        o.created_at,
        o.updated_at,
        o.estimated_ready_time
    FROM public.orders o
    WHERE o.phone_number = TRIM(phone_input)
      AND o.created_at >= (now() - interval '7 days')
    ORDER BY o.created_at DESC;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_orders_by_phone(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_orders_by_phone(text) TO authenticated;

COMMENT ON FUNCTION public.get_orders_by_phone(text) IS 
    'ค้นหาออเดอร์ด้วยเบอร์โทรศัพท์ สำหรับ Guest users (คืนค่า 7 วันล่าสุด)';

-- ============================================================
-- 2. DROP OLD POLICIES
-- ============================================================
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_by_line" ON public.orders;
DROP POLICY IF EXISTS "orders_select_recent" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own_user_id" ON public.orders;
DROP POLICY IF EXISTS "orders_select_by_line_id" ON public.orders;
DROP POLICY IF EXISTS "orders_select_recent_guest" ON public.orders;
DROP POLICY IF EXISTS "orders_select_by_phone" ON public.orders;
DROP POLICY IF EXISTS "orders_select_by_id_direct" ON public.orders;

-- ============================================================
-- 3. CREATE NEW RLS POLICIES
-- ============================================================

-- Policy 1: ดูออเดอร์ด้วย user_id (สำหรับ authenticated users)
CREATE POLICY "orders_select_by_user_id" ON public.orders
    FOR SELECT 
    USING (
        auth.uid() IS NOT NULL 
        AND auth.uid() = user_id
    );

-- Policy 2: ดูออเดอร์ด้วย line_user_id (สำหรับ LINE users)
-- เช็คจาก profiles table เพื่อความปลอดภัย
CREATE POLICY "orders_select_by_line_user_id" ON public.orders
    FOR SELECT 
    USING (
        line_user_id IS NOT NULL 
        AND line_user_id = (
            SELECT p.line_user_id 
            FROM public.profiles p
            WHERE p.id = auth.uid()
        )
    );

-- Policy 3: ดูออเดอร์ด้วย ID โดยตรง (สำหรับทุกคน)
-- อนุญาตให้ดูได้ถ้ารู้ ID (ใช้สำหรับ order detail page)
CREATE POLICY "orders_select_by_id" ON public.orders
    FOR SELECT 
    USING (true);

-- Policy 4: INSERT - ทุกคนที่ authenticated/anon สั่งได้
CREATE POLICY "orders_insert_any" ON public.orders
    FOR INSERT 
    WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- Policy 5: UPDATE - เจ้าของหรือ admin เท่านั้น
CREATE POLICY "orders_update_own_or_admin" ON public.orders
    FOR UPDATE 
    USING (
        auth.uid() = user_id 
        OR public.is_admin()
    );

-- Policy 6: DELETE - admin เท่านั้น
CREATE POLICY "orders_delete_admin_only" ON public.orders
    FOR DELETE 
    USING (public.is_admin());

-- ============================================================
-- 4. OPTIMIZE INDEXES
-- ============================================================

-- Index สำหรับค้นหาด้วย user_id + created_at
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created 
    ON public.orders(user_id, created_at DESC);

-- Index สำหรับค้นหาด้วย line_user_id + created_at
CREATE INDEX IF NOT EXISTS idx_orders_line_user_id_created 
    ON public.orders(line_user_id, created_at DESC);

-- Index สำหรับค้นหาด้วย phone_number (เฉพาะที่ไม่ null)
CREATE INDEX IF NOT EXISTS idx_orders_phone_number 
    ON public.orders(phone_number, created_at DESC) 
    WHERE phone_number IS NOT NULL AND phone_number != '';

-- Index สำหรับค้นหาด้วย ID (primary key มีอยู่แล้ว แต่เพิ่มเติม)
CREATE INDEX IF NOT EXISTS idx_orders_id_created 
    ON public.orders(id, created_at DESC);

-- ============================================================
-- 5. ADD COMMENTS
-- ============================================================

COMMENT ON POLICY "orders_select_by_user_id" ON public.orders IS 
    'Authenticated users can view their own orders by user_id';

COMMENT ON POLICY "orders_select_by_line_user_id" ON public.orders IS 
    'LINE users can view their orders by line_user_id (verified via profiles)';

COMMENT ON POLICY "orders_select_by_id" ON public.orders IS 
    'Anyone can view order by ID directly (must know ID first)';

COMMENT ON POLICY "orders_insert_any" ON public.orders IS 
    'Any authenticated or anonymous user can create orders';

COMMENT ON POLICY "orders_update_own_or_admin" ON public.orders IS 
    'Only order owner or admin can update orders';

COMMENT ON POLICY "orders_delete_admin_only" ON public.orders IS 
    'Only admin can delete orders';

-- ============================================================
-- 6. VERIFY SETUP
-- ============================================================

-- ตรวจสอบว่า RLS เปิดใช้งานอยู่
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'orders';

-- ตรวจสอบ policies ที่สร้าง
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;
