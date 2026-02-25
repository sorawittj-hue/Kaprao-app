-- ============================================================
-- FIX: Ambiguous column reference in generate_queue_number
-- ============================================================

-- ลบ function เก่า
DROP FUNCTION IF EXISTS generate_queue_number(TEXT, BOOLEAN);

-- สร้างใหม่ด้วยชื่อตัวแปรที่ไม่ซ้ำกับ column
CREATE OR REPLACE FUNCTION generate_queue_number(
    p_delivery_method TEXT,
    p_is_preorder BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (out_queue_type TEXT, out_queue_number INT, out_queue_display TEXT) 
LANGUAGE plpgsql
AS $$
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
    
    -- Get next number for today (ใช้ alias o เพื่อ避免 ambiguous)
    SELECT COALESCE(MAX(o.queue_number), 0) + 1 INTO v_next_number
    FROM orders o
    WHERE o.queue_type = v_prefix
      AND DATE(o.created_at) = CURRENT_DATE;
    
    RETURN QUERY SELECT v_prefix, v_next_number, v_prefix || LPAD(v_next_number::TEXT, 3, '0');
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_queue_number(TEXT, BOOLEAN) TO authenticated, anon;

-- Verify
SELECT 'Fixed generate_queue_number function' as status;
