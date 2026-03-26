-- ============================================================
-- KAPRAO52 — COMPREHENSIVE SQL FIXES FOR V2 SYSTEM
-- แก้ไขบั๊กที่ซ่อนอยู่ในระบบเกี่ยวกับการขอคิว, สิทธิ์การมองเห็น, และฐานข้อมูล
-- นำโค้ดทั้งหมดนี้ไปรันใน Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- FIX 1: อัพเกรดระบบจัดคิว (Queue System) ให้เป็น SECURITY DEFINER
-- เหตุผล: ลูกค้าไม่ได้เป็น Admin ทำให้ RLS มองไม่เห็นออเดอร์คนอื่น 
--        ส่งผลให้ได้คิวที่ 1 ตลอดเวลา และคำนวณคิวก่อนหน้าเป็น 0 เสมอ
-- ------------------------------------------------------------

-- 1.1 แก้ไขการออกหมายเลขคิว (ลบของเก่าแล้วสร้างใหม่ เพื่อป้องกัน error ประเภทเปลี่ยน return type ไม่ได้)
DROP FUNCTION IF EXISTS generate_queue_number(text,boolean);

CREATE OR REPLACE FUNCTION generate_queue_number(
    p_delivery_method TEXT,
    p_is_preorder BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (out_queue_type TEXT, out_queue_number INT, out_queue_display TEXT) AS $$
DECLARE
    v_prefix TEXT;
    v_next_number INT;
BEGIN
    IF p_is_preorder THEN
        v_prefix := 'D';
    ELSIF p_delivery_method = 'workplace' THEN
        v_prefix := 'A';
    ELSIF p_delivery_method = 'village' THEN
        v_prefix := 'B';
    ELSE
        v_prefix := 'C';
    END IF;
    
    -- ต้องใช้ SECURITY DEFINER เพื่อให้อ่านออเดอร์คนอื่นเพื่อหาเลขคิวล่าสุดได้
    SELECT COALESCE(MAX(o.queue_number), 0) + 1 INTO v_next_number
    FROM orders o
    WHERE o.queue_type = v_prefix
      AND DATE(o.created_at) = CURRENT_DATE;
    
    RETURN QUERY SELECT v_prefix, v_next_number, v_prefix || LPAD(v_next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- <-- ใส่ SECURITY DEFINER

-- ให้สิทธิ์เรียกใช้
GRANT EXECUTE ON FUNCTION generate_queue_number TO authenticated, anon;


-- 1.2 แก้ไขการดูสถานะคิว
CREATE OR REPLACE FUNCTION get_queue_status(p_order_id BIGINT)
RETURNS JSON AS $$
DECLARE
    v_order RECORD;
    v_orders_ahead INT;
    v_estimated_minutes INT;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Order not found');
    END IF;
    
    -- นับคิวที่อยู่ก่อนหน้าเราทั้งหมด (ต้องใช้ SECURITY DEFINER มองให้ครบคิว)
    SELECT COUNT(*) INTO v_orders_ahead
    FROM orders
    WHERE queue_type = v_order.queue_type
      AND queue_number < v_order.queue_number
      AND DATE(created_at) = DATE(v_order.created_at)
      AND status NOT IN ('delivered', 'cancelled');
    
    v_estimated_minutes := v_orders_ahead * 5 + 10;
    
    RETURN json_build_object(
        'queue_display', v_order.queue_display,
        'queue_type', v_order.queue_type,
        'orders_ahead', v_orders_ahead,
        'estimated_minutes', v_estimated_minutes,
        'status', v_order.status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- <-- ใส่ SECURITY DEFINER

-- ให้สิทธิ์เรียกใช้
GRANT EXECUTE ON FUNCTION get_queue_status TO authenticated, anon;

-- ------------------------------------------------------------
-- FIX 2: ให้สิทธิ์ Guest ดู Ticket หวยของตัวเองได้ (RLS)
-- เหตุผล: Guest มีหน้าเพจให้กดดูหวยตัวเองได้ แต่ RLS ไปบล็อคไว้
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "lotto_tickets_select_guest" ON public.lotto_tickets;
CREATE POLICY "lotto_tickets_select_guest" ON public.lotto_tickets
    FOR SELECT 
    USING (guest_id IS NOT NULL);


-- ------------------------------------------------------------
-- FIX 3: ป้องกัน Foreign Key Violation ตอนแจกหวยให้ Guest
-- เหตุผล: ลูกค้า Guest ใหม่ไม่ได้บันทึกลงตาราง guest_identities ก่อนสั่งอาหาร
--        พอรับออเดอร์ Trigger จะไปสร้างหวยด้วย guest_id ที่ไม่มีในระบบและเกิด Error
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION auto_insert_guest_identity()
RETURNS TRIGGER AS $$
BEGIN
    -- ถ้ามี guest_id แต่ในระบบไม่เคยรู้จักมาก่อน ให้สร้างรอไว้เลย
    IF NEW.guest_id IS NOT NULL THEN
        INSERT INTO guest_identities (id, display_name, last_active_at)
        VALUES (NEW.guest_id, 'Guest ' || LEFT(NEW.guest_id::text, 4), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET last_active_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- เอาไปผูกไว้ที่ orders ให้ทำงาน "ก่อน" Insert
DROP TRIGGER IF EXISTS tr_auto_insert_guest ON orders;
CREATE TRIGGER tr_auto_insert_guest
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_insert_guest_identity();


-- ------------------------------------------------------------
-- FIX 4: อัพเดท function ซื้อหวย (purchase_lotto_ticket) ให้ตรงกับ Client API
-- เหตุผล: React App ส่งค่า p_guest_id เข้าไปในการใช้งานด้วย (ถึงจะให้เป็นค่าว่าง)
--        ถ้าฐานข้อมูลไม่รองรับ Argument นี้ จะพบแจ้งเตือน "Could not find function"
-- ------------------------------------------------------------

-- ลบของเก่าทิ้งป้องกันการซ้ำซ้อน
DROP FUNCTION IF EXISTS purchase_lotto_ticket(UUID, TEXT, DATE, INT);
DROP FUNCTION IF EXISTS purchase_lotto_ticket(UUID, TEXT, TEXT, DATE, INT);

CREATE OR REPLACE FUNCTION purchase_lotto_ticket(
    p_user_id UUID,
    p_guest_id TEXT,  -- React ส่งมาว่างๆ ("") ถ้าไม่ได้ล็อกอิน
    p_number TEXT,
    p_draw_date DATE,
    p_price INT
)
RETURNS JSON AS $$
DECLARE
    v_current_points INT;
    v_ticket_id BIGINT;
BEGIN
    -- กรณีไม่ล็อกอิน จะซื้อไม่ได้
    IF p_user_id IS NULL OR p_user_id::text = '' THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'ต้องเข้าสู่ระบบก่อนซื้อลอตเตอรี่'
        );
    END IF;

    -- เช็คพอยต์คงเหลือ
    SELECT points INTO v_current_points
    FROM profiles
    WHERE id = p_user_id;
    
    IF v_current_points < p_price THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'แต้มสะสมไม่เพียงพอ'
        );
    END IF;
    
    -- หักพอยต์
    UPDATE profiles
    SET points = points - p_price
    WHERE id = p_user_id;
    
    -- ใส่ log
    INSERT INTO point_logs (user_id, action, amount, note, balance_after)
    VALUES (
        p_user_id,
        'REDEEM',
        -p_price,
        'ซื้อสลาก: ' || p_number,
        v_current_points - p_price
    );
    
    -- สร้างตั๋วหวย
    INSERT INTO lotto_tickets (
        user_id,
        number,
        number_type,
        source,
        purchase_price,
        draw_date
    ) VALUES (
        p_user_id,
        p_number,
        'manual',
        'points_purchase',
        p_price,
        p_draw_date
    )
    RETURNING id INTO v_ticket_id;
    
    RETURN json_build_object(
        'success', TRUE,
        'ticket_id', v_ticket_id,
        'points_spent', p_price,
        'new_balance', v_current_points - p_price
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution ให้ Client
GRANT EXECUTE ON FUNCTION purchase_lotto_ticket TO authenticated, anon;
