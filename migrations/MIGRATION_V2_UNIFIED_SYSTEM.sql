-- ============================================================
-- KAPRAO52 v2.0 — UNIFIED ORDER SYSTEM + LOTTERY 2.0
-- Migration: ปรับปรุงระบบสั่งซื้อและหวยใหม่ทั้งหมด
-- วิธีใช้: Run ทั้งไฟล์ใน Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 2: GUEST IDENTITY SYSTEM (ใหม่)
-- ============================================================

-- เก็บข้อมูล Guest แบบถาวร (แต่ไม่ sensitive)
CREATE TABLE IF NOT EXISTS guest_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT UNIQUE,  -- browser fingerprint (optional)
    display_name TEXT NOT NULL DEFAULT 'Guest',
    metadata JSONB DEFAULT '{}',  -- เก็บข้อมูลเสริม เช่น browser, device
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_guest_identities_fingerprint ON guest_identities(fingerprint) WHERE fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guest_identities_created ON guest_identities(created_at);

-- ============================================================
-- SECTION 3: ORDERS TABLE UPGRADES
-- ============================================================

-- Add guest support + queue system + pre-order
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guest_identities(id),
    ADD COLUMN IF NOT EXISTS queue_type TEXT,  -- 'A', 'B', 'C', 'D'
    ADD COLUMN IF NOT EXISTS queue_number INT,
    ADD COLUMN IF NOT EXISTS queue_display TEXT,  -- 'A023'
    ADD COLUMN IF NOT EXISTS estimated_minutes INT,
    ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,  -- สำหรับ pre-order
    ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS guest_synced BOOLEAN DEFAULT FALSE,  -- sync ไป user แล้วยัง
    ADD COLUMN IF NOT EXISTS guest_synced_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_queue ON orders(queue_type, queue_number) WHERE queue_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_scheduled ON orders(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================================
-- SECTION 4: LOTTERY 2.0 — NEW TICKET SYSTEM
-- ============================================================

-- Drop old lotto_pool if exists (backup data first if needed!)
-- หรือจะ rename แล้วสร้างใหม่ก็ได้

-- New lotto_tickets table
CREATE TABLE IF NOT EXISTS lotto_tickets (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_identities(id) ON DELETE CASCADE,
    
    -- Number
    number TEXT NOT NULL,
    number_type TEXT DEFAULT 'auto',  -- auto, manual, vip
    
    -- Source
    source TEXT DEFAULT 'order_free',  -- order_free, points_purchase, bonus, streak
    purchase_price INT DEFAULT 0,  -- พอยต์ที่ใช้ซื้อ (ถ้ามี)
    
    -- Draw
    draw_date DATE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'active',  -- active, won, expired
    
    -- Prize (ถ้าถูก)
    prize_type TEXT,  -- free_meal, cash_2000, cash_4000, jackpot
    prize_amount INT DEFAULT 0,
    prize_claimed BOOLEAN DEFAULT FALSE,
    prize_claimed_at TIMESTAMPTZ,
    
    -- Meta
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_number CHECK (char_length(number) BETWEEN 2 AND 6),
    CONSTRAINT valid_number_type CHECK (number_type IN ('auto', 'manual', 'vip')),
    CONSTRAINT valid_source CHECK (source IN ('order_free', 'points_purchase', 'bonus', 'streak', 'vip_monthly'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lotto_tickets_user ON lotto_tickets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lotto_tickets_guest ON lotto_tickets(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lotto_tickets_draw ON lotto_tickets(draw_date);
CREATE INDEX IF NOT EXISTS idx_lotto_tickets_status ON lotto_tickets(status);
CREATE INDEX IF NOT EXISTS idx_lotto_tickets_order ON lotto_tickets(order_id);

-- ============================================================
-- SECTION 5: LOTTERY RESULTS (upgrade)
-- ============================================================

-- อัพเกรด lotto_results ให้รองรับผลหวยรัฐบาลเต็มรูปแบบ
ALTER TABLE lotto_results
    ADD COLUMN IF NOT EXISTS first_prize TEXT,  -- รางวัลที่ 1 (6 ตัว)
    ADD COLUMN IF NOT EXISTS last3_digits TEXT[],  -- 3 ตัวท้าย
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',  -- manual, api
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- ============================================================
-- SECTION 6: FUNCTIONS
-- ============================================================

-- 6.1 Generate Queue Number
CREATE OR REPLACE FUNCTION generate_queue_number(
    p_delivery_method TEXT,
    p_is_preorder BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (queue_type TEXT, queue_number INT, queue_display TEXT) AS $$
DECLARE
    v_prefix TEXT;
    v_next_number INT;
BEGIN
    -- Determine prefix
    IF p_is_preorder THEN
        v_prefix := 'D';
    ELSIF p_delivery_method = 'workplace' THEN
        v_prefix := 'A';
    ELSIF p_delivery_method = 'village' THEN
        v_prefix := 'B';
    ELSE
        v_prefix := 'C';
    END IF;
    
    -- Get next number for today
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_next_number
    FROM orders
    WHERE queue_type = v_prefix
      AND DATE(created_at) = CURRENT_DATE;
    
    RETURN QUERY SELECT v_prefix, v_next_number, v_prefix || LPAD(v_next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- 6.2 Generate Lotto Number
CREATE OR REPLACE FUNCTION generate_lotto_number(
    p_length INT DEFAULT 6,
    p_type TEXT DEFAULT 'auto'
)
RETURNS TEXT AS $$
DECLARE
    v_number TEXT;
BEGIN
    IF p_type = 'auto' THEN
        -- Random number
        v_number := LPAD(floor(random() * power(10, p_length))::TEXT, p_length, '0');
    ELSE
        -- For manual/vip, return pattern that user can customize
        v_number := LPAD('0', p_length, '0');
    END IF;
    
    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- 6.3 Create Lotto Ticket for Order
CREATE OR REPLACE FUNCTION create_lotto_ticket_for_order()
RETURNS TRIGGER AS $$
DECLARE
    v_ticket_number TEXT;
    v_draw_date DATE;
    v_next_draw DATE;
BEGIN
    -- Only for orders with guest_id or user_id
    IF NEW.guest_id IS NULL AND NEW.user_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get draw date (1st or 16th of next month)
    v_next_draw := CASE 
        WHEN EXTRACT(DAY FROM CURRENT_DATE) >= 16 THEN
            DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')::DATE
        ELSE
            DATE_TRUNC('month', CURRENT_DATE)::DATE + 15
    END;
    
    -- Generate number (ใช้เลข queue ผสมกับ random)
    v_ticket_number := generate_lotto_number(6, 'auto');
    
    -- Insert ticket
    INSERT INTO lotto_tickets (
        order_id,
        user_id,
        guest_id,
        number,
        number_type,
        source,
        draw_date
    ) VALUES (
        NEW.id,
        NEW.user_id,
        NEW.guest_id,
        v_ticket_number,
        'auto',
        'order_free',
        v_next_draw
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-create ticket
DROP TRIGGER IF EXISTS tr_create_lotto_ticket ON orders;
CREATE TRIGGER tr_create_lotto_ticket
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_lotto_ticket_for_order();

-- 6.4 Check Lottery Results (Auto-check when results added)
-- กติกา: ถูกรางวัล = กินฟรี 1 มื้อเท่านั้น! ไม่มีเงินรางวัล
CREATE OR REPLACE FUNCTION check_lottery_results()
RETURNS TRIGGER AS $$
BEGIN
    -- Check and update all winning tickets for this draw date
    UPDATE lotto_tickets
    SET 
        status = 'won',
        prize_type = 'free_meal',
        prize_amount = 0,
        updated_at = NOW()
    WHERE draw_date = NEW.draw_date
      AND status = 'active'
      AND (
          -- ถูกรางวัลที่ 1 (6 ตัว)
          number = NEW.first_prize
          -- ถูกเลขท้าย 2 ตัว
          OR RIGHT(number, 2) = NEW.last2
          -- ถูกเลขหน้า 3 ตัว
          OR (LEFT(number, 3) = ANY(NEW.first3::text[]))
          -- ถูกเลขท้าย 3 ตัว
          OR (RIGHT(number, 3) = ANY(NEW.last3_digits::text[]))
      );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-check
DROP TRIGGER IF EXISTS tr_check_lottery_results ON lotto_results;
CREATE TRIGGER tr_check_lottery_results
    AFTER INSERT OR UPDATE ON lotto_results
    FOR EACH ROW
    EXECUTE FUNCTION check_lottery_results();

-- 6.5 Sync Guest to Member (เมื่อ Guest login)
CREATE OR REPLACE FUNCTION sync_guest_to_member(
    p_guest_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_points_earned INT := 0;
    v_tickets_count INT := 0;
    v_orders_count INT := 0;
BEGIN
    -- Update orders
    UPDATE orders
    SET 
        user_id = p_user_id,
        guest_synced = TRUE,
        guest_synced_at = NOW(),
        updated_at = NOW()
    WHERE guest_id = p_guest_id
      AND (guest_synced = FALSE OR guest_synced IS NULL);
    
    GET DIAGNOSTICS v_orders_count = ROW_COUNT;
    
    -- Sum points from orders
    SELECT COALESCE(SUM(points_earned), 0) INTO v_points_earned
    FROM orders
    WHERE guest_id = p_guest_id;
    
    -- Update tickets
    UPDATE lotto_tickets
    SET 
        user_id = p_user_id,
        guest_id = NULL,
        updated_at = NOW()
    WHERE guest_id = p_guest_id;
    
    GET DIAGNOSTICS v_tickets_count = ROW_COUNT;
    
    -- Add points to user profile
    IF v_points_earned > 0 THEN
        UPDATE profiles
        SET 
            points = COALESCE(points, 0) + v_points_earned,
            total_orders = COALESCE(total_orders, 0) + v_orders_count,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Log points
        INSERT INTO point_logs (user_id, action, amount, note, balance_after)
        SELECT 
            p_user_id,
            'EARN',
            v_points_earned,
            'Points from ' || v_orders_count || ' guest orders',
            points
        FROM profiles
        WHERE id = p_user_id;
    END IF;
    
    -- Mark guest as synced
    UPDATE guest_identities
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'),
        '{synced_to}',
        to_jsonb(p_user_id::TEXT)
    )
    WHERE id = p_guest_id;
    
    RETURN json_build_object(
        'success', TRUE,
        'orders_synced', v_orders_count,
        'points_added', v_points_earned,
        'tickets_transferred', v_tickets_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.6 Purchase Lotto Ticket with Points
CREATE OR REPLACE FUNCTION purchase_lotto_ticket(
    p_user_id UUID,
    p_number TEXT,
    p_draw_date DATE,
    p_price INT
)
RETURNS JSON AS $$
DECLARE
    v_current_points INT;
    v_ticket_id BIGINT;
BEGIN
    -- Check user points
    SELECT points INTO v_current_points
    FROM profiles
    WHERE id = p_user_id;
    
    IF v_current_points < p_price THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'Insufficient points'
        );
    END IF;
    
    -- Deduct points
    UPDATE profiles
    SET points = points - p_price
    WHERE id = p_user_id;
    
    -- Log points usage
    INSERT INTO point_logs (user_id, action, amount, note, balance_after)
    VALUES (
        p_user_id,
        'REDEEM',
        -p_price,
        'Purchase lotto ticket: ' || p_number,
        v_current_points - p_price
    );
    
    -- Create ticket
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

-- 6.7 Get Queue Status (Real-time)
CREATE OR REPLACE FUNCTION get_queue_status(
    p_order_id BIGINT
)
RETURNS JSON AS $$
DECLARE
    v_order RECORD;
    v_orders_ahead INT;
    v_estimated_minutes INT;
BEGIN
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Order not found');
    END IF;
    
    -- Count orders ahead in same queue type
    SELECT COUNT(*) INTO v_orders_ahead
    FROM orders
    WHERE queue_type = v_order.queue_type
      AND queue_number < v_order.queue_number
      AND DATE(created_at) = DATE(v_order.created_at)
      AND status NOT IN ('delivered', 'cancelled');
    
    -- Estimate time (5 min per order)
    v_estimated_minutes := v_orders_ahead * 5 + 10;
    
    RETURN json_build_object(
        'queue_display', v_order.queue_display,
        'queue_type', v_order.queue_type,
        'orders_ahead', v_orders_ahead,
        'estimated_minutes', v_estimated_minutes,
        'status', v_order.status
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 7: RLS POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE guest_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotto_tickets ENABLE ROW LEVEL SECURITY;

-- Guest Identities (แก้ไขได้เฉพาะตัวเอง หรือ admin)
DROP POLICY IF EXISTS "guest_identities_insert" ON guest_identities;
DROP POLICY IF EXISTS "guest_identities_select" ON guest_identities;

CREATE POLICY "guest_identities_insert" ON guest_identities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "guest_identities_select" ON guest_identities
    FOR SELECT USING (true);

-- Lotto Tickets
DROP POLICY IF EXISTS "lotto_tickets_select_own" ON lotto_tickets;
DROP POLICY IF EXISTS "lotto_tickets_insert" ON lotto_tickets;

CREATE POLICY "lotto_tickets_select_own" ON lotto_tickets
    FOR SELECT USING (
        user_id = auth.uid() 
        OR guest_id::TEXT = current_setting('app.guest_id', true)
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "lotto_tickets_insert" ON lotto_tickets
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- ============================================================
-- SECTION 8: GRANTS
-- ============================================================

GRANT EXECUTE ON FUNCTION generate_queue_number TO authenticated, anon;
GRANT EXECUTE ON FUNCTION generate_lotto_number TO authenticated, anon;
GRANT EXECUTE ON FUNCTION sync_guest_to_member TO authenticated;
GRANT EXECUTE ON FUNCTION purchase_lotto_ticket TO authenticated;
GRANT EXECUTE ON FUNCTION get_queue_status TO authenticated, anon;

-- ============================================================
-- SECTION 9: SEED DATA (optional)
-- ============================================================

-- เพิ่ม lotto result ตัวอย่าง (ถ้ายังไม่มี)
INSERT INTO lotto_results (draw_date, last2, first3, first_prize, last3_digits)
SELECT 
    CURRENT_DATE + 7,
    '52',
    ARRAY['123', '456'],
    '123456',
    ARRAY['789', '012']
WHERE NOT EXISTS (
    SELECT 1 FROM lotto_results WHERE draw_date = CURRENT_DATE + 7
);

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 
    'Migration Complete!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'guest_identities') as guest_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'lotto_tickets') as ticket_tables,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'sync_guest_to_member') as functions_created;
