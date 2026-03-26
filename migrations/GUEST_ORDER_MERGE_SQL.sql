-- ============================================================
-- KAPRAO52: Guest Order Claim + World-Class Ordering Features
-- SAFE TO RUN: Uses CREATE OR REPLACE with DROP for changed return types
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure tracking_token column exists & is indexed
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_claimed_at TIMESTAMPTZ;

-- 2. Create indexes (safe, idempotent)
CREATE INDEX IF NOT EXISTS idx_orders_tracking_token ON orders(tracking_token) WHERE tracking_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON orders(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_line_user_id ON orders(line_user_id) WHERE line_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 3. Generate tracking_token for orders that don't have one yet
UPDATE orders 
SET tracking_token = encode(gen_random_bytes(16), 'hex')
WHERE tracking_token IS NULL;

-- 4. Auto-generate tracking_token on new orders
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_token IS NULL THEN
    NEW.tracking_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_tracking_token ON orders;
CREATE TRIGGER set_tracking_token
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_tracking_token();

-- 5. THE MAIN MAGIC: claim_guest_order RPC
CREATE OR REPLACE FUNCTION claim_guest_order(
  p_order_id INT,
  p_tracking_token TEXT
)
RETURNS JSON AS $$
DECLARE
  v_order RECORD;
  v_profile RECORD;
  v_points_earned INT;
  v_new_balance INT;
  v_current_user_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
    AND tracking_token = p_tracking_token;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Order not found or invalid token');
  END IF;

  IF v_order.guest_claimed_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Order already claimed');
  END IF;
  
  IF v_order.user_id = v_current_user_id THEN
    RETURN json_build_object('success', true, 'message', 'Already your order', 'points_earned', 0, 'new_balance', 0);
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = v_current_user_id;

  UPDATE orders
  SET 
    user_id = v_current_user_id,
    line_user_id = COALESCE(v_profile.line_user_id, v_order.line_user_id),
    guest_claimed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  v_points_earned := v_order.points_earned;
  
  IF v_points_earned > 0 THEN
    INSERT INTO points_log (user_id, action, amount, order_id, note, balance_after)
    SELECT
      v_current_user_id,
      'EARN',
      v_points_earned,
      p_order_id,
      'คะแนนจากออเดอร์ Guest #' || p_order_id,
      COALESCE(profiles.points, 0) + v_points_earned
    FROM profiles
    WHERE id = v_current_user_id;

    UPDATE profiles
    SET 
      points = COALESCE(points, 0) + v_points_earned,
      total_orders = COALESCE(total_orders, 0) + 1,
      updated_at = NOW()
    WHERE id = v_current_user_id
    RETURNING points INTO v_new_balance;

    UPDATE orders SET points_earned = 0 WHERE id = p_order_id;
  ELSE
    UPDATE profiles
    SET 
      total_orders = COALESCE(total_orders, 0) + 1,
      updated_at = NOW()
    WHERE id = v_current_user_id;

    SELECT COALESCE(points, 0) INTO v_new_balance FROM profiles WHERE id = v_current_user_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'points_earned', v_points_earned,
    'new_balance', COALESCE(v_new_balance, 0),
    'order_id', p_order_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. *** FIX: DROP old get_orders_by_phone first (return type changed) ***
DROP FUNCTION IF EXISTS get_orders_by_phone(TEXT);

-- Then recreate it returning JSON array (compatible with Supabase RPC)
CREATE OR REPLACE FUNCTION get_orders_by_phone(phone_input TEXT)
RETURNS TABLE (
  id INT,
  user_id UUID,
  line_user_id TEXT,
  customer_name TEXT,
  phone_number TEXT,
  address TEXT,
  delivery_method TEXT,
  special_instructions TEXT,
  items JSONB,
  status TEXT,
  total_price NUMERIC,
  subtotal_price NUMERIC,
  discount_amount NUMERIC,
  discount_code TEXT,
  points_redeemed INT,
  points_earned INT,
  payment_method TEXT,
  payment_status TEXT,
  tracking_token TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  estimated_ready_time TIMESTAMPTZ,
  guest_claimed_at TIMESTAMPTZ
) AS $$
DECLARE
  cleaned_phone TEXT;
BEGIN
  -- Clean phone: remove dashes, spaces, parentheses
  cleaned_phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  RETURN QUERY
  SELECT 
    o.id, o.user_id, o.line_user_id, o.customer_name, o.phone_number,
    o.address, o.delivery_method, o.special_instructions, o.items::JSONB,
    o.status::TEXT, o.total_price, o.subtotal_price, o.discount_amount,
    o.discount_code, o.points_redeemed, o.points_earned, o.payment_method::TEXT,
    o.payment_status::TEXT, o.tracking_token, o.created_at, o.updated_at,
    o.estimated_ready_time, o.guest_claimed_at
  FROM orders o
  WHERE regexp_replace(o.phone_number, '[^0-9]', '', 'g') = cleaned_phone
  ORDER BY o.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION claim_guest_order(INT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_orders_by_phone(TEXT) TO authenticated, anon;

-- 8. Verify
SELECT 'Setup complete!' AS status, 
       (SELECT COUNT(*) FROM orders WHERE tracking_token IS NOT NULL) AS orders_with_tokens;
