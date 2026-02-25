# 🚨 รายงานการตรวจสอบและแก้ไข: ปัญหาออเดอร์หาย

## 📋 สรุปปัญหา

**ปัญหาหลัก**: ลูกค้ากดสั่งออเดอร์สำเร็จ แต่พอไปดูที่หน้า "รายการสั่งซื้อ" กลับไม่มีประวัติการสั่ง

---

## 🔍 Root Cause Analysis

### 1. ปัญหาหลัก: Guest User Orders หาย

**สาเหตุ**:
```
1. CheckoutPage สร้างออเดอร์ด้วย user_id = null (สำหรับ Guest)
2. useOrders.ts ดึงข้อมูลด้วยเงื่อนไข .eq('user_id', userId) เท่านั้น
3. ถ้าไม่มี userId หรือ userId ไม่ตรง → ไม่มีข้อมูลแสดง
```

**ไฟล์ที่มีปัญหา**:
- `src/features/orders/hooks/useOrders.ts` (บรรทัด 34, 40)
- `src/pages/OrdersPage.tsx` (บรรทัด 17)

### 2. ปัญหารอง: RLS Policy จำกัดการเข้าถึง

```sql
-- Policy เดิม
CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);
```

ปัญหา: Guest users ที่มี `user_id = null` จะไม่สามารถดึงออเดอร์ได้

---

## ✅ การแก้ไขที่ทำไปแล้ว (Pure Supabase - No LocalStorage)

### 🎯 หลักการ: ใช้ Supabase อย่างเดียว ไม่ใช้ LocalStorage!

### 1. แก้ไข `useOrders.ts` - รองรับหลายวิธีการดึงข้อมูล

```typescript
// รองรับการดึงข้อมูล 3 วิธี:
// 1. ด้วย user_id (authenticated users)
// 2. ด้วย line_user_id (LINE users)
// 3. ด้วย phone_number (guest users via RPC)

export async function fetchOrders(
  userId?: string,
  lineUserId?: string,
  phoneNumber?: string
): Promise<Order[]>
```

### 2. แก้ไข `OrdersPage.tsx` - เพิ่มการค้นหาด้วยเบอร์โทร

```typescript
// Guest users สามารถค้นหาออเดอร์ด้วยเบอร์โทรได้
{isGuest && (
  <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
    <p>ค้นหาออเดอร์ด้วยเบอร์โทรศัพท์</p>
    <input type="tel" ... />
    <button>ค้นหา</button>
  </div>
)}
```

### 3. SQL Migration - สร้าง RPC Function และ RLS Policies

**ไฟล์**: `fix_orders_rls_policy.sql`

```sql
-- RPC Function สำหรับค้นหาด้วยเบอร์โทร
CREATE FUNCTION public.get_orders_by_phone(phone_input text)
RETURNS TABLE (...) 
SECURITY DEFINER;

-- RLS Policies ใหม่:
-- 1. orders_select_by_user_id: สำหรับ authenticated users
-- 2. orders_select_by_line_user_id: สำหรับ LINE users
-- 3. orders_select_by_id: ใครก็ได้ (ถ้ารู้ ID)
-- 4. orders_insert_any: ทุกคนสั่งอาหารได้
-- 5. orders_update_own_or_admin: เจ้าของหรือ admin แก้ไขได้
-- 6. orders_delete_admin_only: เฉพาะ admin ลบได้
```

---

## 🧪 Flow การทำงานหลังแก้ไข (Pure Supabase)

### Scenario 1: Guest User สั่งอาหาร
```
1. Guest เข้าแอพ → กด "เข้าชมก่อน"
2. เลือกเมนู → Checkout
3. กรอกข้อมูล (ชื่อ + เบอร์โทร) → สั่งซื้อ
4. ระบบบันทึก Order ลง Supabase (user_id = null, มี phone_number)
5. Success Page แสดง Order ID
6. พอกด "ดูรายการสั่งซื้อ":
   - Guest ต้องกรอกเบอร์โทรค้นหา
   - ระบบเรียก RPC get_orders_by_phone()
   - แสดงออเดอร์ที่มีเบอร์ตรงกัน!
```

### Scenario 2: Guest กลับมาดูอีกรอบ
```
1. เปิดแอพใหม่ → ยังเป็น Guest
2. ไปที่หน้าออเดอร์
3. กรอกเบอร์โทรเดิม → ค้นหา
4. ระบบดึงจาก Supabase → แสดงได้!
```

### Scenario 3: LINE User
```
1. Login ด้วย LINE → มี line_user_id
2. สั่งอาหาร → บันทึก line_user_id ลงออเดอร์
3. ดูออเดอร์ → ดึงด้วย line_user_id ได้ทันที (ไม่ต้องกรอกเบอร์)
```

### Scenario 4: Authenticated User
```
1. Login → มี user_id (Supabase Auth UID)
2. สั่งอาหาร → บันทึก user_id ลงออเดอร์
3. ดูออเดอร์ → ดึงด้วย user_id ได้ทันที
```

---

## 📋 ขั้นตอนถัดไปที่ต้องทำ

### 1️⃣ รัน SQL Migration (สำคัญที่สุด!)
```sql
-- ไปที่ Supabase SQL Editor
-- วางโค้ดจาก fix_orders_rls_policy.sql
-- กด Run
```

### 2️⃣ ทดสอบ Flow ต่างๆ
- [ ] Guest สั่งอาหาร → กรอกเบอร์ → ค้นหา → เจอออเดอร์
- [ ] LINE User สั่ง → ดูออเดอร์ได้ทันที
- [ ] Authenticated User สั่ง → ดูออเดอร์ได้ทันที
- [ ] Admin ดูออเดอร์ทั้งหมดได้

---

## 🎯 สรุป: ทำไมถึงไม่ใช้ LocalStorage?

| วิธีการ | ข้อดี | ข้อเสีย |
|--------|-------|---------|
| **LocalStorage** | เร็ว, ไม่ต้อง query DB | หายได้ (clear browser), ไม่ sync ระหว่างอุปกรณ์, ไม่ secure |
| **Supabase Only** | Sync ทุกอุปกรณ์, ข้อมูลถาวร, ปลอดภัย, รองรับ multi-device | ต้องมี internet, ต้องกรอกเบอร์ค้นหา (สำหรับ guest) |

### ✅ แนวทางที่เลือก: Supabase Only

**เหตุผล**:
1. **Data Persistence** - ข้อมูลอยู่บน Database ถาวร ไม่หายแน่นอน
2. **Cross-Device** - ลูกค้าเปิดมือถือเครื่องใหม่ก็ยังเจอออเดอร์
3. **Security** - RLS policies ควบคุมการเข้าถึงได้ดีกว่า
4. **Consistency** - ข้อมูลตรงกันทุกที่ ไม่มีปัญหา sync

---

## 📝 ไฟล์ที่แก้ไขทั้งหมด

| ไฟล์ | การแก้ไข |
|------|----------|
| `src/features/orders/hooks/useOrders.ts` | ลบ LocalStorage, ใช้ RPC function สำหรับค้นหาด้วยเบอร์ |
| `src/pages/OrdersPage.tsx` | เพิ่ม UI ค้นหาด้วยเบอร์โทรสำหรับ Guest |
| `src/pages/CheckoutPage.tsx` | ลบการใช้ LocalStorage |
| `src/pages/OrderDetailPage.tsx` | ลบการใช้ LocalStorage |
| `fix_orders_rls_policy.sql` | สร้าง RPC function + RLS policies ใหม่ |

---

**วันที่ตรวจสอบ**: 2026-02-22  
**ผู้ตรวจสอบ**: Kimi Code CLI  
**เวอร์ชั่น**: Kaprao52 v2.0 React Edition - **Pure Supabase Approach**
