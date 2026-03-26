-- ============================================================
-- PRELAUNCH UPGRADE — KAPRAO52
-- ============================================================

-- 1. เพิ่ม column สำหรับแนบหลักฐานการโอนเงิน
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_slip_url text;

-- 2. สร้างตารางสำหรับจัดการวัตถุดิบ/Toppings แบบ Global (ข้ามเมนู)
CREATE TABLE IF NOT EXISTS public.global_options (
    id          text PRIMARY KEY,         -- เช่น 'moo_krob', 'kai_dao'
    name        text NOT NULL,            -- เช่น 'หมูกรอบ', 'ไข่ดาว'
    is_available boolean NOT NULL DEFAULT true,
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ใส่ข้อมูลเบื้องต้น
INSERT INTO public.global_options (id, name, is_available)
VALUES 
    ('moo_krob', 'หมูกรอบ', true),
    ('moo_sap', 'หมูสับ', true),
    ('kung', 'กุ้ง', true),
    ('kai_dao', 'ไข่ดาว', true),
    ('kai_jiao', 'ไข่เจียว', true),
    ('kai_yiao_ma', 'ไข่เยี่ยวม้า', true)
ON CONFLICT (id) DO NOTHING;

-- 3. อัพเดตฟังก์ชันจัดการ Order (handle_order_placed) ให้รองรับการยกเลิก (Rollback)
-- และแก้ไขให้จัดการตั๋วหวยได้แม่นยำขึ้น

CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    earned_points   int;
    redeemed_points int;
    current_points  int;
BEGIN
    -- กรณีที่ 1: ออเดอร์ใหม่ถูกสร้าง (INSERT) เป็น 'placed'
    -- หรือ ออเดอร์เดิมถูกเปลี่ยนสถานะเป็น 'placed'
    IF (TG_OP = 'INSERT' AND NEW.status = 'placed') OR (TG_OP = 'UPDATE' AND OLD.status != 'placed' AND NEW.status = 'placed') THEN
        -- (โค้ดส่วนนี้ลอกมาจากของเดิม แต่ปรับปรุงให้กระชับ)
        earned_points := COALESCE(NEW.points_earned, FLOOR(COALESCE(NEW.total_price, 0) / 10));
        
        IF NEW.user_id IS NOT NULL THEN
            -- หักแต้มที่ใช้
            IF COALESCE(NEW.points_redeemed, 0) > 0 THEN
                UPDATE public.profiles SET points = GREATEST(0, points - NEW.points_redeemed) WHERE id = NEW.user_id;
                INSERT INTO public.point_logs (user_id, action, amount, order_id, note)
                VALUES (NEW.user_id, 'REDEEM', -NEW.points_redeemed, NEW.id, 'ใช้แต้มใน Order #' || NEW.id);
            END IF;
            
            -- เพิ่มแต้มที่ได้
            IF earned_points > 0 THEN
                UPDATE public.profiles SET points = points + earned_points WHERE id = NEW.user_id;
                INSERT INTO public.point_logs (user_id, action, amount, order_id, note)
                VALUES (NEW.user_id, 'EARN', earned_points, NEW.id, 'ได้รับจาก Order #' || NEW.id);
            END IF;
        END IF;
    END IF;

    -- กรณีที่ 2: ออเดอร์ถูกยกเลิก (Status changed to 'cancelled')
    -- ต้อง Rollback ทุกอย่างคืน
    IF (TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
        earned_points := COALESCE(OLD.points_earned, FLOOR(COALESCE(OLD.total_price, 0) / 10));
        redeemed_points := COALESCE(OLD.points_redeemed, 0);

        IF OLD.user_id IS NOT NULL THEN
            -- 1. หักแต้มที่เคยได้คืน
            IF earned_points > 0 THEN
                UPDATE public.profiles SET points = GREATEST(0, points - earned_points) WHERE id = OLD.user_id;
                INSERT INTO public.point_logs (user_id, action, amount, order_id, note)
                VALUES (OLD.user_id, 'CANCEL_ROLLBACK', -earned_points, OLD.id, 'หักแต้มคืนเนื่องจากออเดอร์ #' || OLD.id || ' ถูกยกเลิก');
            END IF;

            -- 2. คืนแต้มที่คนเคยใช้แลก
            IF redeemed_points > 0 THEN
                UPDATE public.profiles SET points = points + redeemed_points WHERE id = OLD.user_id;
                INSERT INTO public.point_logs (user_id, action, amount, order_id, note)
                VALUES (OLD.user_id, 'CANCEL_REFUND', redeemed_points, OLD.id, 'คืนแต้มที่ใช้ในออเดอร์ #' || OLD.id || ' ที่ถูกยกเลิก');
            END IF;

            -- 3. ลบตั๋วหวยทิ้ง
            DELETE FROM public.lotto_pool WHERE order_id = OLD.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- เปลี่ยนไปใช้ trigger ใหม่
DROP TRIGGER IF EXISTS on_order_insert_placed ON public.orders;
DROP TRIGGER IF EXISTS on_order_update_placed ON public.orders;

CREATE TRIGGER on_order_status_change
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();
