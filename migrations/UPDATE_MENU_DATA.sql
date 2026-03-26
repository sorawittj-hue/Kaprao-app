-- ============================================================
-- KAPRAO52 — อัปเดตชื่อและรายละเอียดเมนูอาหารให้ตรงกับภาพ
-- วิธีใช้: วาง SQL นี้ใน Supabase SQL Editor แล้วกด Run
-- ============================================================

UPDATE public.menu_items 
SET name = 'กะเพราไข่เยี่ยวม้า', description = 'ไข่เยี่ยวม้าสุดฮิต คู่กับกะเพราร้อนๆ' 
WHERE id = 3;

UPDATE public.menu_items 
SET name = 'ไข่ดาวราดซอสมะขาม', description = 'ไข่ดาวกรอบร้อน ราดซอสมะขามหวานอมเปรี้ยว' 
WHERE id = 8;

UPDATE public.menu_items 
SET name = 'กุ้งราดซอสมะขาม', description = 'กุ้งทอดร้อน ราดซอสมะขาม' 
WHERE id = 12;

UPDATE public.menu_items 
SET name = 'กะเพราหมูเด้ง', description = 'กะเพราหมูเด้งเนื้อหนึบ หอมกลิ่นกะเพรา' 
WHERE id = 13;

UPDATE public.menu_items 
SET name = 'กะเพราสันคอหมู', description = 'สันคอหมูนุ่มๆ ผัดกะเพราจัดจ้าน' 
WHERE id = 15;

UPDATE public.menu_items 
SET name = 'สันคอหมูกระเทียม', description = 'สันคอหมูนุ่ม ผัดกระเทียมพริกไทย' 
WHERE id = 16;

-- ถ้าหากอ้างอิงจากชื่อเก่าที่ผิด (เพื่อความครอบคลุม)
UPDATE public.menu_items SET name = 'กะเพราไข่เยี่ยวม้า' WHERE name = 'กะเพราไข่ย้อมม้า';
UPDATE public.menu_items SET name = 'ไข่ดาวราดซอสมะขาม' WHERE name = 'ไข่ดาวซอสมะขาม' OR name = 'ไข่ดาวร้อนโซตะมะขาม';
UPDATE public.menu_items SET name = 'กุ้งราดซอสมะขาม' WHERE name = 'กุ้งซอสมะขาม' OR name = 'กุ้งร้อนโซตะมะขาม';
UPDATE public.menu_items SET name = 'กะเพราหมูเด้ง' WHERE name = 'หม้อแดงกะเพรา';
UPDATE public.menu_items SET name = 'กะเพราสันคอหมู' WHERE name = 'ซันโก้ผัดกะเพรา';
UPDATE public.menu_items SET name = 'สันคอหมูกระเทียม' WHERE name = 'ซันโก้กระเทียม';

-- ============================================================
-- ตรวจสอบผลลัพธ์
-- ============================================================
SELECT id, name, description, image_url
FROM public.menu_items 
ORDER BY id;
