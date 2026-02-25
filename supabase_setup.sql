-- ============================================
-- Kaprao52 Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS (Row Level Security)
alter table if exists profiles enable row level security;
alter table if exists menu_items enable row level security;
alter table if exists orders enable row level security;
alter table if exists order_items enable row level security;
alter table if exists lotto_pool enable row level security;
alter table if exists lotto_results enable row level security;
alter table if exists point_logs enable row level security;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text UNIQUE,
  display_name text,
  picture_url text,
  points integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  tier text DEFAULT 'MEMBER',
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  category text NOT NULL,
  image_url text,
  requires_meat boolean DEFAULT false,
  is_recommended boolean DEFAULT false,
  is_available boolean DEFAULT true,
  spice_levels integer[],
  options jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  line_user_id text,
  customer_name text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  status text DEFAULT 'pending',
  total_price integer NOT NULL,
  subtotal_price integer NOT NULL,
  discount_amount integer DEFAULT 0,
  discount_code text,
  points_redeemed integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  payment_method text,
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lotto_pool table
CREATE TABLE IF NOT EXISTS lotto_pool (
  id serial PRIMARY KEY,
  order_id integer REFERENCES orders(id),
  user_id uuid REFERENCES profiles(id),
  number text NOT NULL,
  draw_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lotto_results table
CREATE TABLE IF NOT EXISTS lotto_results (
  draw_date date PRIMARY KEY,
  last2 text,
  first3 text[],
  created_at timestamptz DEFAULT now()
);

-- Create point_logs table
CREATE TABLE IF NOT EXISTS point_logs (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  amount integer NOT NULL,
  order_id integer REFERENCES orders(id),
  note text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT USING (true);

CREATE POLICY "Orders viewable by owner"
  ON orders FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tier = 'ADMIN')
  );

CREATE POLICY "Orders insertable by authenticated"
  ON orders FOR INSERT WITH CHECK (true);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, is_recommended, is_available, image_url) VALUES
('กะเพราหมูสับ', 'กะเพราร้อนๆ หมูสับเนื้อแน่น ผัดพริกสด', 55, 'kaprao', true, true, '/images/kaprao-moo-sap.jpg'),
('กะเพราหมูกรอบ', 'หมูกรอบกรอบนอกนุ่มใน ผัดกะเพราสูตรพิเศษ', 65, 'kaprao', true, true, '/images/kaprao-moo-krob.jpg'),
('กะเพราไข่ย้อมม้า', 'ไข่ย้อมม้าสุดฮิต คู่กับกะเพราร้อนๆ', 75, 'kaprao', true, true, '/images/kaprao-kai-yiao-ma.jpg'),
('กะเพรากุ้ง', 'กุ้งสดตัวใหญ่ ผัดกะเพราหอมกลิ่นกระเทียม', 85, 'kaprao', false, true, '/images/kaprao-kung.jpg'),
('กะเพราหมูเด้ง', 'หมูเด้งนุ่มหนึบ สูตรเฉพาะร้าน', 70, 'kaprao', false, true, '/images/kaprao-moo-deng.jpg'),
('ข้าวผัดกระเทียม', 'ข้าวผัดกระเทียมเจียวหอมๆ', 50, 'garlic', false, true, '/images/kaprao-san-ko.jpg'),
('ไข่เจียวโรยหน้าพริกสด', 'ไข่เจียวฟูๆ โรยหน้าพริกสด', 40, 'others', false, true, '/images/khai-jiao-prik-sot.jpg'),
('ไข่ดาวร้อนรอมะขาม', 'ไข่ดาวกรอบนอก ราดซอสมะขามเปรี้ยวหวาน', 35, 'others', false, true, '/images/khai-dao-rod-sot-makham.jpg'),
('ผัดนกไม้', 'ผัดนกไม้กรอบๆ กับกะเพรา', 60, 'kaprao', false, true, '/images/kaprao-nor-mai.jpg');

-- Create realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
