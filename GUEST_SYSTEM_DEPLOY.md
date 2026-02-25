# 🚀 GUEST SYSTEM v2.0 - DEPLOY GUIDE

## 📋 สรุปสิ่งที่แก้ไขแล้ว

### ✅ 1. CheckoutPage.tsx (หัวใจหลักของระบบ)
**ปัญหาเดิม:** ใช้การ insert order แบบเก่า ไม่รองรับ `guest_id`

**แก้ไข:**
- เปลี่ยนมาใช้ `createUnifiedOrder()` จาก `features/v2/api/unifiedOrderApi.ts`
- เพิ่ม `getOrCreateGuestIdentity()` สำหรับสร้าง/ดึงข้อมูล Guest
- รองรับทั้ง Member (มี user_id) และ Guest (มี guest_id)
- ได้รับ Queue Number อัตโนมัติ (A001, B023, etc.)

```typescript
// แก้ไขหลักใน handlePlaceOrder
const guestIdentity = !user?.id ? getOrCreateGuestIdentity() : null
const unifiedOrder = await createUnifiedOrder({
  guestId: guestIdentity?.id,
  userId: user?.id,
  lineUserId: user?.lineUserId,
  // ... other params
})
```

### ✅ 2. GuestConversionPanel Integration
**ปัญหาเดิม:** มี component แต่ไม่ได้ใช้งาน

**แก้ไข:**
- เพิ่ม `GuestConversionPanel` ในหน้า Checkout (variant="checkout")
- เพิ่ม `GuestConversionPanel` ในหน้า Success (variant="success")
- UI สวยงาม พร้อมปุ่ม Login LINE

### ✅ 3. Supabase Types Update
**เพิ่ม:**
- `guest_identities` table
- `lotto_tickets` table
- Orders table columns: `guest_id`, `queue_type`, `queue_number`, `queue_display`, etc.
- RPC Functions: `generate_queue_number`, `get_queue_status`, `sync_guest_to_member`, `claim_guest_order`

---

## 🎯 ขั้นตอนการ Deploy

### Step 1: รัน SQL ใน Supabase (สำคัญที่สุด!)

1. ไปที่ Supabase Dashboard → SQL Editor
2. เปิดไฟล์ `APPLY_GUEST_SYSTEM.sql`
3. Copy ทั้งหมดแล้ววางใน SQL Editor
4. กด "Run"
5. ตรวจสอบผลลัพธ์ว่าแสดง ✅ ทั้งหมด

### Step 2: Deploy Frontend

```bash
npm run build
# หรือ
npm run deploy
```

---

## 🔄 Workflow ที่ทำงานได้หลัง Deploy

### Guest Checkout Flow
```
1. User เข้าเว็บ → เลือก "ดูเมนูก่อน (ไม่ต้อง Login)"
   ↓
2. สร้าง Guest Identity อัตโนมัติ (เก็บใน localStorage + Supabase)
   ↓
3. เลือกเมนู → ตะกร้า → Checkout
   ↓
4. กรอกข้อมูล → กดสั่งซื้อ
   - ระบบสร้าง Queue Number (A001, B023)
   - บันทึก guest_id ลง order
   - Trigger สร้าง lotto_tickets อัตโนมัติ
   ↓
5. หน้า Success แสดง:
   - หมายเลขคิว (Queue Number)
   - พอยต์ที่จะได้รับ
   - ตั๋วหวย + เลขลุ้นโชค
   - ปุ่ม "Login LINE รับพอยต์"
   ↓
6. User กด Login LINE
   - บันทึก pending order
   - Redirect ไป LINE Login
   ↓
7. หลัง Login สำเร็จ
   - AuthProvider เรียก sync_guest_to_member()
   - โอน orders, points, tickets เข้า account
   - แสดง toast แจ้งเตือน "ได้รับ X พอยต์"
```

### Member Checkout Flow
```
1. User Login LINE แล้ว
   ↓
2. Checkout ปกติ
   - ส่ง user_id กับ order
   - ได้รับ points ทันที
   - สร้าง lotto_tickets ทันที
```

---

## 📊 ตาราง Database ใหม่

### guest_identities
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| display_name | TEXT | เช่น "Guest_8A3F" |
| fingerprint | TEXT | Browser fingerprint (optional) |
| metadata | JSONB | ข้อมูลเพิ่มเติม |
| created_at | TIMESTAMPTZ | เวลาสร้าง |
| last_active_at | TIMESTAMPTZ | เวลาใช้งานล่าสุด |

### lotto_tickets (v2.0)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| order_id | BIGINT | FK to orders |
| user_id | UUID | FK to profiles (ถ้า login แล้ว) |
| guest_id | UUID | FK to guest_identities (ถ้ายังเป็น guest) |
| number | TEXT | เลขหวย 2-6 หลัก |
| number_type | TEXT | auto/manual/vip |
| source | TEXT | order_free/points_purchase/bonus |
| draw_date | DATE | วันออกรางวัล |
| status | TEXT | active/won/expired |
| prize_type | TEXT | free_meal |

### orders (เพิ่ม columns)
| Column | Type | Description |
|--------|------|-------------|
| guest_id | UUID | FK to guest_identities |
| queue_type | TEXT | A/B/C/D |
| queue_number | INT | เลขคิว |
| queue_display | TEXT | A001, B023 |
| guest_synced | BOOLEAN | sync แล้วหรือยัง |
| guest_synced_at | TIMESTAMPTZ | เวลา sync |

---

## 🎰 Queue System

| Prefix | Type | Description |
|--------|------|-------------|
| A | Workplace | ส่งที่ทำงาน |
| B | Village | ส่งในหมู่บ้าน |
| C | Pickup | รับที่ร้าน |
| D | Pre-order | สั่งล่วงหน้า |

---

## ⚠️ หมายเหตุ

### Errors ที่ยังเหลือ (ไม่สำคัญ)
- Unused imports/variables ในไฟล์อื่นๆ (AI, Collaboration, Analytics)
- Type errors ในไฟล์ที่ไม่เกี่ยวข้องกับ Guest System
- สามารถแก้ทีหลังได้

### ฟีเจอร์ที่ยังไม่ได้เปิดใช้
- Lottery 2.0 UI (ซื้อตั๋วเพิ่ม, เลือกเลขเอง)
- Pre-order scheduling
- Real-time queue updates

สามารถเปิดใช้ทีหลังได้หลังจาก Guest System ทำงานถูกต้อง

---

## ✅ Checklist ก่อนเปิดใช้งาน

- [ ] รัน SQL script ใน Supabase สำเร็จ
- [ ] Deploy frontend สำเร็จ
- [ ] ทดสอบ Guest Checkout
- [ ] ทดสอบ Guest → Member Conversion
- [ ] ตรวจสอบว่า Queue Number แสดงถูกต้อง
- [ ] ตรวจสอบว่า Lotto Ticket สร้างอัตโนมัติ

---

**สร้างเมื่อ:** 24 ก.พ. 2568  
**เวอร์ชัน:** Guest System v2.0
