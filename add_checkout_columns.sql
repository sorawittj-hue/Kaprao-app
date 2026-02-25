-- ============================================================
-- FIX: Add missing columns to orders table for checkout
-- แก้ไขปัญหาการสั่งซื้อไม่ได้เนื่องจากขาดคอลัมน์
-- ============================================================

-- Add missing columns to orders table
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS address text,
    ADD COLUMN IF NOT EXISTS phone_number text,
    ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'workplace',
    ADD COLUMN IF NOT EXISTS special_instructions text;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.address IS 'ที่อยู่จัดส่ง (สำหรับ delivery_method = village)';
COMMENT ON COLUMN public.orders.phone_number IS 'เบอร์โทรศัพท์ติดต่อ';
COMMENT ON COLUMN public.orders.delivery_method IS 'วิธีรับอาหาร: workplace | village';
COMMENT ON COLUMN public.orders.special_instructions IS 'หมายเหตุพิเศษจากลูกค้า';

-- Verify columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
