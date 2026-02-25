# Kaprao52 - คู่มือตั้งค่า

## ⚠️ สำคัญ: ต้องตั้งค่าก่อนใช้งาน

แอพนี้ต้องการการเชื่อมต่อกับ Supabase ก่อนใช้งานจริง

## ขั้นตอนที่ 1: สร้าง Supabase Project

1. ไปที่ https://app.supabase.com
2. สร้างโปรเจคใหม่
3. คัดลอกค่าต่อไปนี้จาก Project Settings > API:
   - `Project URL` → ใส่ใน `VITE_SUPABASE_URL`
   - `anon public` → ใส่ใน `VITE_SUPABASE_ANON_KEY`

## ขั้นตอนที่ 2: ตั้งค่า Database

1. ไปที่ SQL Editor ใน Supabase Dashboard
2. เปิดไฟล์ `supabase_setup.sql` ในโปรเจคนี้
3. Copy ทั้งหมดและ Paste ลงใน SQL Editor
4. กด Run

## ขั้นตอนที่ 3: ตั้งค่า Environment

แก้ไขไฟล์ `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key

# ถ้าต้องการใช้ LINE LIFF (optional)
VITE_LIFF_ID=your-liff-id
```

## ขั้นตอนที่ 4: รันแอพ

```bash
npm install
npm run dev
```

## การตั้งค่า LINE LIFF (Optional)

ถ้าต้องการใช้งานผ่าน LINE:

1. ไปที่ https://developers.line.biz/console/
2. สร้าง Provider ใหม่
3. สร้าง LINE Login channel
4. สร้าง LIFF app
5. คัดลอก LIFF ID มาใส่ใน `.env`

## ตรวจสอบการทำงาน

ถ้าตั้งค่าถูกต้อง หน้าตั้งค่าจะหายไปและแอพจะแสดงเมนูอาหารจาก Supabase
