-- ============================================================
-- KAPRAO52 — อัปเดตรูปภาพเมนูอาหาร (UPDATE MENU IMAGES)
-- วิธีใช้: วาง SQL นี้ใน Supabase SQL Editor แล้วกด Run
-- ============================================================

-- อัปเดตรูปภาพตาม ID (แน่นอนที่สุด)
UPDATE public.menu_items SET image_url = '/images/kaprao-moo-sap.jpg'       WHERE id = 1;
UPDATE public.menu_items SET image_url = '/images/kaprao-moo-krob.jpg'      WHERE id = 2;
UPDATE public.menu_items SET image_url = '/images/kaprao-kai-yiao-ma.jpg'   WHERE id = 3;
UPDATE public.menu_items SET image_url = '/images/kaprao-kung.jpg'          WHERE id = 4;
UPDATE public.menu_items SET image_url = '/images/moo-sap-kra-thiam.jpg'    WHERE id = 5;
UPDATE public.menu_items SET image_url = '/images/kung-kra-thiam.jpg'       WHERE id = 6;
UPDATE public.menu_items SET image_url = '/images/prik-kang-moo-chin.jpg'   WHERE id = 7;
UPDATE public.menu_items SET image_url = '/images/khai-dao-rod-sot-makham.jpg' WHERE id = 8;
UPDATE public.menu_items SET image_url = '/images/khai-jiao-prik-sot.jpg'   WHERE id = 9;
UPDATE public.menu_items SET image_url = '/images/khai-khon.jpg'            WHERE id = 10;
UPDATE public.menu_items SET image_url = '/images/khao-pad-moo-chin.jpg'    WHERE id = 11;
UPDATE public.menu_items SET image_url = '/images/kung-rod-sot-makham.jpg'  WHERE id = 12;
UPDATE public.menu_items SET image_url = '/images/kaprao-moo-deng.jpg'      WHERE id = 13;
UPDATE public.menu_items SET image_url = '/images/mama-pad-kaprao.jpg'      WHERE id = 14;
UPDATE public.menu_items SET image_url = '/images/kaprao-san-ko.jpg'        WHERE id = 15;
UPDATE public.menu_items SET image_url = '/images/san-ko-kra-thiam.jpg'     WHERE id = 16;
UPDATE public.menu_items SET image_url = '/images/kaprao-nor-mai.jpg'       WHERE id = 17;

-- ถ้ามีเมนูเพิ่มเติมที่ไม่มีใน ID ข้างต้น ให้อัปเดตตามชื่อ
-- (กรณีเพิ่มเมนูใหม่หรือ ID ไม่ตรง)
UPDATE public.menu_items SET image_url = '/images/kaprao-moo-sap.jpg'       WHERE name = 'กะเพราหมูสับ';
UPDATE public.menu_items SET image_url = '/images/kaprao-moo-krob.jpg'      WHERE name = 'กะเพราหมูกรอบ';
UPDATE public.menu_items SET image_url = '/images/kaprao-kai-yiao-ma.jpg'   WHERE name = 'กะเพราไข่เยี่ยวม้า';
UPDATE public.menu_items SET image_url = '/images/kaprao-kung.jpg'          WHERE name = 'กะเพรากุ้ง';
UPDATE public.menu_items SET image_url = '/images/moo-sap-kra-thiam.jpg'    WHERE name = 'หมูสับกระเทียม';
UPDATE public.menu_items SET image_url = '/images/kung-kra-thiam.jpg'       WHERE name = 'กุ้งกระเทียม';
UPDATE public.menu_items SET image_url = '/images/prik-kang-moo-chin.jpg'   WHERE name = 'พริกแกงหมูชิ้น';
UPDATE public.menu_items SET image_url = '/images/khai-dao-rod-sot-makham.jpg' WHERE name = 'ไข่ดาวราดซอสมะขาม';
UPDATE public.menu_items SET image_url = '/images/khai-jiao-prik-sot.jpg'   WHERE name = 'ไข่เจียวพริกสด';
UPDATE public.menu_items SET image_url = '/images/khai-khon.jpg'            WHERE name = 'ไข่คั่ว';
UPDATE public.menu_items SET image_url = '/images/khao-pad-moo-chin.jpg'    WHERE name = 'ข้าวผัดหมูชิ้น';
UPDATE public.menu_items SET image_url = '/images/kung-rod-sot-makham.jpg'  WHERE name = 'กุ้งราดซอสมะขาม';
UPDATE public.menu_items SET image_url = '/images/kaprao-moo-deng.jpg'      WHERE name = 'กะเพราหมูเด้ง';
UPDATE public.menu_items SET image_url = '/images/mama-pad-kaprao.jpg'      WHERE name = 'มาม่าผัดกะเพรา';
UPDATE public.menu_items SET image_url = '/images/kaprao-san-ko.jpg'        WHERE name = 'กะเพราสันคอหมู';
UPDATE public.menu_items SET image_url = '/images/san-ko-kra-thiam.jpg'     WHERE name = 'สันคอหมูกระเทียม';
UPDATE public.menu_items SET image_url = '/images/kaprao-nor-mai.jpg'       WHERE name = 'หน่อไม้ผัดกะเพรา';

-- ============================================================
-- ตรวจสอบผลลัพธ์ (ดูว่าอัปเดตครบหรือไม่)
-- ============================================================
SELECT id, name, image_url, category 
FROM public.menu_items 
ORDER BY id;
