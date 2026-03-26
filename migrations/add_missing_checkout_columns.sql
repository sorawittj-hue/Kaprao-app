-- This SQL adds missing columns required for the checkout process
-- Run this in your Supabase SQL Editor

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS special_instructions text;

-- After running this, PostgREST will usually reload the schema cache automatically.
-- If you still get the schema cache error, run:
NOTIFY pgrst, 'reload config';
