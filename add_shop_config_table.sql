-- ============================================
-- Shop Configuration Table Migration
-- For Kaprao52 App
-- ============================================

-- Create shop_config table
CREATE TABLE IF NOT EXISTS shop_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE shop_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read shop_config"
    ON shop_config FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update shop_config"
    ON shop_config FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert default configurations
INSERT INTO shop_config (key, value) VALUES
('contact', '{
    "phone": "0812345678",
    "line_id": "@kaprao52",
    "line_oa_id": "@772ysswn",
    "email": "",
    "facebook": ""
}'::jsonb),
('shop_hours', '{
    "open": "09:00",
    "close": "20:00",
    "days_open": [1, 2, 3, 4, 5, 6],
    "timezone": "Asia/Bangkok"
}'::jsonb),
('order_limits', '{
    "max_orders_per_slot": 10,
    "slot_duration_minutes": 15
}'::jsonb),
('payment', '{
    "promptpay_number": "0812345678",
    "promptpay_name": "กะเพรา 52",
    "bank_accounts": []
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shop_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS shop_config_updated_at ON shop_config;
CREATE TRIGGER shop_config_updated_at
    BEFORE UPDATE ON shop_config
    FOR EACH ROW
    EXECUTE FUNCTION update_shop_config_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE shop_config;
