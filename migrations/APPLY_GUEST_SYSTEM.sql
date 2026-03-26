-- ============================================================
-- KAPRAO52 GUEST SYSTEM v2.0 - QUICK FIX
-- รันสคริปต์นี้ใน Supabase SQL Editor เพื่อเปิดใช้งาน Guest System
-- ============================================================

-- ============================================================
-- STEP 1: ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================================
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS guest_id UUID,
    ADD COLUMN IF NOT EXISTS queue_type TEXT,
    ADD COLUMN IF NOT EXISTS queue_number INT,
    ADD COLUMN IF NOT EXISTS queue_display TEXT,
    ADD COLUMN IF NOT EXISTS estimated_minutes INT,
    ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS guest_synced BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS guest_synced_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS tracking_token TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_queue ON orders(queue_type, queue_number) WHERE queue_type IS NOT NULL;

-- ============================================================
-- STEP 2: CREATE GUEST IDENTITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS guest_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT UNIQUE,
    display_name TEXT NOT NULL DEFAULT 'Guest',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_identities_fingerprint ON guest_identities(fingerprint) WHERE fingerprint IS NOT NULL;

-- ============================================================
-- STEP 3: CREATE LOTTO TICKETS TABLE (v2.0)
-- ============================================================
CREATE TABLE IF NOT EXISTS lotto_tickets (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES guest_identities(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    number_type TEXT DEFAULT 'auto',  -- auto, manual, vip
    source TEXT DEFAULT 'order_free',  -- order_free, points_purchase, bonus, streak
    purchase_price INT DEFAULT 0,
    draw_date DATE NOT NULL,
    status TEXT DEFAULT 'active',  -- active, won, expired
    prize_type TEXT,  -- free_meal
    prize_amount INT DEFAULT 0,
    prize_claimed BOOLEAN DEFAULT FALSE,
    prize_claimed_at TIMESTAMPTZ,
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
CREATE INDEX IF NOT EXISTS idx_lotto_tickets_order ON lotto_tickets(order_id);

-- ============================================================
-- STEP 4: UPGRADE LOTTO RESULTS TABLE
-- ============================================================
ALTER TABLE lotto_results
    ADD COLUMN IF NOT EXISTS first_prize TEXT,
    ADD COLUMN IF NOT EXISTS last3_digits TEXT[],
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- ============================================================
-- STEP 5: CREATE RPC FUNCTIONS
-- ============================================================

-- 5.1 Generate Queue Number
CREATE OR REPLACE FUNCTION generate_queue_number(
    p_delivery_method TEXT,
    p_is_preorder BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (queue_type TEXT, queue_number INT, queue_display TEXT) AS $$
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
    
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_next_number
    FROM orders
    WHERE queue_type = v_prefix
      AND DATE(created_at) = CURRENT_DATE;
    
    RETURN QUERY SELECT v_prefix, v_next_number, v_prefix || LPAD(v_next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- 5.2 Get Queue Status
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
$$ LANGUAGE plpgsql;

-- 5.3 Create Lotto Ticket for Order (Trigger)
CREATE OR REPLACE FUNCTION create_lotto_ticket_for_order()
RETURNS TRIGGER AS $$
DECLARE
    v_ticket_number TEXT;
    v_draw_date DATE;
BEGIN
    IF NEW.guest_id IS NULL AND NEW.user_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get draw date (1st or 16th of next month)
    v_draw_date := CASE 
        WHEN EXTRACT(DAY FROM CURRENT_DATE) >= 16 THEN
            DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')::DATE
        ELSE
            DATE_TRUNC('month', CURRENT_DATE)::DATE + 15
    END;
    
    -- Generate number from queue display or random
    IF NEW.queue_display IS NOT NULL THEN
        v_ticket_number := LPAD(NEW.queue_display, 6, '0');
    ELSE
        v_ticket_number := LPAD(floor(random() * 1000000)::TEXT, 6, '0');
    END IF;
    
    INSERT INTO lotto_tickets (
        order_id, user_id, guest_id, number, number_type, source, draw_date
    ) VALUES (
        NEW.id, NEW.user_id, NEW.guest_id, v_ticket_number, 'auto', 'order_free', v_draw_date
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS tr_create_lotto_ticket ON orders;
CREATE TRIGGER tr_create_lotto_ticket
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_lotto_ticket_for_order();

-- 5.4 Sync Guest to Member (CRITICAL FUNCTION)
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
    SET user_id = p_user_id, guest_synced = TRUE, guest_synced_at = NOW(), updated_at = NOW()
    WHERE guest_id = p_guest_id AND (guest_synced = FALSE OR guest_synced IS NULL);
    GET DIAGNOSTICS v_orders_count = ROW_COUNT;
    
    -- Sum points
    SELECT COALESCE(SUM(points_earned), 0) INTO v_points_earned
    FROM orders WHERE guest_id = p_guest_id;
    
    -- Update tickets
    UPDATE lotto_tickets
    SET user_id = p_user_id, guest_id = NULL, updated_at = NOW()
    WHERE guest_id = p_guest_id;
    GET DIAGNOSTICS v_tickets_count = ROW_COUNT;
    
    -- Add points to profile
    IF v_points_earned > 0 THEN
        UPDATE profiles
        SET points = COALESCE(points, 0) + v_points_earned,
            total_orders = COALESCE(total_orders, 0) + v_orders_count,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        INSERT INTO point_logs (user_id, action, amount, note, balance_after)
        SELECT p_user_id, 'EARN', v_points_earned,
               'Points from ' || v_orders_count || ' guest orders', points
        FROM profiles WHERE id = p_user_id;
    END IF;
    
    -- Mark guest as synced
    UPDATE guest_identities
    SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{synced_to}', to_jsonb(p_user_id::TEXT))
    WHERE id = p_guest_id;
    
    RETURN json_build_object(
        'success', TRUE,
        'orders_synced', v_orders_count,
        'points_added', v_points_earned,
        'tickets_transferred', v_tickets_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.5 Claim Guest Order (Legacy compatibility)
CREATE OR REPLACE FUNCTION claim_guest_order(
    p_order_id INT,
    p_tracking_token TEXT
)
RETURNS JSON AS $$
DECLARE
    v_order RECORD;
    v_points INT;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'error', 'Order not found');
    END IF;
    
    v_points := COALESCE(v_order.points_earned, 0);
    
    RETURN json_build_object(
        'success', TRUE,
        'points_earned', v_points,
        'new_balance', v_points
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 6: RLS POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE guest_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotto_tickets ENABLE ROW LEVEL SECURITY;

-- Guest Identities policies
DROP POLICY IF EXISTS "guest_identities_insert" ON guest_identities;
DROP POLICY IF EXISTS "guest_identities_select" ON guest_identities;

CREATE POLICY "guest_identities_insert" ON guest_identities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "guest_identities_select" ON guest_identities
    FOR SELECT USING (true);

-- Lotto Tickets policies
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
-- STEP 7: GRANTS
-- ============================================================
GRANT EXECUTE ON FUNCTION generate_queue_number TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_queue_status TO authenticated, anon;
GRANT EXECUTE ON FUNCTION sync_guest_to_member TO authenticated;
GRANT EXECUTE ON FUNCTION claim_guest_order TO authenticated;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 
    '✅ Guest System Ready!' as status,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'orders' AND column_name = 'guest_id') as has_guest_id,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name = 'guest_identities') as has_guest_table,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name = 'lotto_tickets') as has_tickets_table,
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'sync_guest_to_member') has_sync_function;
