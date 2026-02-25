-- ============================================================
-- KAPRAO52 — FUNCTIONS & TRIGGERS MIGRATION
-- ============================================================

-- Function: Increment review helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$;

-- Function: Decrement review helpful count
CREATE OR REPLACE FUNCTION decrement_review_helpful(review_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = helpful_count - 1
  WHERE id = review_id;
END;
$$;

-- Function: Increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons 
  SET usage_count = usage_count + 1
  WHERE id = coupon_id;
END;
$$;

-- Function: Get user coupon usage count
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

-- Function: Get available coupons for user
CREATE OR REPLACE FUNCTION get_available_coupons_for_user(p_user_id uuid)
RETURNS TABLE (
  id bigint,
  code text,
  name text,
  discount_type text,
  discount_value numeric,
  min_order_amount numeric,
  max_discount numeric,
  expires_at timestamptz
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
    c.discount_type,
    c.discount_value,
    c.min_order_amount,
    c.max_discount,
    c.expires_at
  FROM coupons c
  WHERE c.is_active = true
  AND (c.expires_at IS NULL OR c.expires_at > now())
  AND (c.usage_limit IS NULL OR c.usage_count < c.usage_limit)
  AND (
    SELECT COUNT(*) 
    FROM coupon_usages cu 
    WHERE cu.coupon_id = c.id AND cu.user_id = p_user_id
  ) < c.per_user_limit;
END;
$$;

-- Trigger: Update order slot count when order is created
CREATE OR REPLACE FUNCTION increment_slot_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.slot_id IS NOT NULL THEN
    UPDATE order_slots 
    SET current_orders = current_orders + 1
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_increment_slot ON public.orders;
CREATE TRIGGER tr_increment_slot
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_slot_count();

-- Trigger: Decrement slot count when order is cancelled
CREATE OR REPLACE FUNCTION decrement_slot_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.slot_id IS NOT NULL AND NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE order_slots 
    SET current_orders = GREATEST(0, current_orders - 1)
    WHERE id = OLD.slot_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_decrement_slot ON public.orders;
CREATE TRIGGER tr_decrement_slot
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION decrement_slot_count();

-- Function: Create notification on order status change
CREATE OR REPLACE FUNCTION create_order_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_title text;
  v_message text;
  v_type text;
BEGIN
  -- Only notify on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Determine notification content based on status
  CASE NEW.status
    WHEN 'confirmed' THEN
      v_title := 'ออเดอร์ได้รับการยืนยัน';
      v_message := 'ออเดอร์ #' || NEW.id || ' ของคุณได้รับการยืนยันแล้ว';
      v_type := 'order_status';
    WHEN 'preparing' THEN
      v_title := 'กำลังเตรียมอาหาร';
      v_message := 'ร้านกำลังปรุงอาหารให้คุณ';
      v_type := 'order_status';
    WHEN 'ready' THEN
      v_title := 'อาหารพร้อมรับ';
      v_message := 'ออเดอร์ #' || NEW.id || ' พร้อมรับแล้ว';
      v_type := 'order_ready';
    WHEN 'delivered' THEN
      v_title := 'จัดส่งสำเร็จ';
      v_message := 'ขอบคุณที่ใช้บริการ';
      v_type := 'order_status';
    WHEN 'cancelled' THEN
      v_title := 'ออเดอร์ถูกยกเลิก';
      v_message := 'ออเดอร์ #' || NEW.id || ' ถูกยกเลิก';
      v_type := 'order_status';
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Insert notification
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      v_type,
      v_title,
      v_message,
      jsonb_build_object('orderId', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_order_notification ON public.orders;
CREATE TRIGGER tr_order_notification
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_notification();

-- Function: Auto-generate order slots for next 7 days
CREATE OR REPLACE FUNCTION auto_generate_slots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date date;
  v_delivery text;
BEGIN
  FOR i IN 0..7 LOOP
    v_date := current_date + i;
    FOREACH v_delivery IN ARRAY ARRAY['workplace', 'village'] LOOP
      PERFORM generate_order_slots(v_date, v_delivery);
    END LOOP;
  END LOOP;
END;
$$;

-- Schedule this function to run daily (requires pg_cron extension)
-- SELECT cron.schedule('generate-slots', '0 0 * * *', 'SELECT auto_generate_slots()');
