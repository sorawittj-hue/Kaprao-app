# 🍛 Kaprao52 - ระบบสั่งอาหารครบวงจร

## 📋 สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [Database Schema](#database-schema)
3. [User Flow](#user-flow)
4. [Feature ทั้งหมด](#feature-ทั้งหมด)
5. [Admin Flow](#admin-flow)
6. [Gamification](#gamification)
7. [Integration](#integration)

---

## 🎯 ภาพรวมระบบ

**Kaprao52** เป็นแอพสั่งอาหารสตรีทฟู้ดที่มาพร้อมระบบสมาชิกและเกมสะสมแต้ม ออกแบบมาเพื่อเพิ่ม engagement และให้ลูกค้ากลับมาใช้งานซ้ำ

### 🏗️ Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **State Management**: Zustand + React Query
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Auth**: Supabase Auth + LINE LIFF
- **Storage**: LocalStorage (Cart persistence)

---

## 🗄️ Database Schema

### 1. profiles (ข้อมูลผู้ใช้)
```sql
- id: uuid (PK)
- line_user_id: text (UNIQUE)
- display_name: text
- picture_url: text
- points: integer (default: 0)
- total_orders: integer (default: 0)
- tier: text (default: 'MEMBER')
- created_at: timestamptz
- updated_at: timestamptz
```

### 2. menu_items (เมนูอาหาร)
```sql
- id: serial (PK)
- name: text
- description: text
- price: integer
- category: text
- image_url: text
- requires_meat: boolean
- is_recommended: boolean
- is_available: boolean
- spice_levels: integer[]
- options: jsonb
- created_at: timestamptz
```

### 3. orders (ออเดอร์)
```sql
- id: serial (PK)
- user_id: uuid (FK -> profiles)
- line_user_id: text
- customer_name: text
- phone_number: text
- address: text
- items: jsonb
- status: text (pending/placed/confirmed/preparing/ready/delivered/cancelled)
- total_price: integer
- subtotal_price: integer
- discount_amount: integer
- discount_code: text
- points_redeemed: integer
- points_earned: integer
- payment_method: text (cod/transfer/promptpay)
- payment_status: text (pending/paid/failed)
- delivery_method: text (pickup/delivery)
- special_instructions: text
- created_at: timestamptz
- updated_at: timestamptz
```

### 4. lotto_pool (ตั๋วหวย)
```sql
- id: serial (PK)
- order_id: integer (FK -> orders)
- user_id: uuid (FK -> profiles)
- number: text (2 digits)
- draw_date: date
- created_at: timestamptz
```

### 5. lotto_results (ผลหวย)
```sql
- draw_date: date (PK)
- last2: text
- first3: text[]
- created_at: timestamptz
```

### 6. point_logs (ประวัติพอยต์)
```sql
- id: serial (PK)
- user_id: uuid (FK -> profiles)
- action: text (EARN/REDEEM/BONUS/ADJUST)
- amount: integer
- order_id: integer
- note: text
- balance_after: integer
- created_at: timestamptz
```

---

## 👤 User Flow

### 1. เข้าสู่ระบบ
```
[Home] → [Profile] → เลือก Login วิธี:
  ├─ LINE Login (ผ่าน LIFF)
  └─ Guest Login (Anonymous)
```

### 2. สั่งอาหาร (Core Flow)
```
[Home] → เลือกเมนู → [MenuItemModal]
  ├─ เลือกเนื้อสัตว์ (ถ้ามี)
  ├─ เลือกไข่
  ├─ เลือกระดับความเผ็ด
  ├─ เลือก topping พิเศษ
  ├─ ใส่หมายเหตุ
  └─ กด "เพิ่มลงตะกร้า"

[FloatingCart] → กดดูตะกร้า → [CartPage]
  ├─ ปรับจำนวน
  ├─ ใส่โค้ดส่วนลด
  ├─ ใช้พอยต์ (10 points = 1 บาท)
  └─ กด "สั่งซื้อ"

[CheckoutPage]
  ├─ กรอกชื่อ-นามสกุล
  ├─ กรอกเบอร์โทร
  ├─ เลือกวิธีรับ (รับที่ร้าน/ส่งถึงที่)
  ├─ เลือกวิธีชำระเงิน
  └─ กด "ยืนยันการสั่งซื้อ"

→ บันทึก Order ลง Supabase
→ Trigger: คำนวณ points_earned
→ Trigger: สร้าง lotto ticket
→ [OrderSuccess] → [OrderDetailPage]
```

### 3. ติดตามออเดอร์
```
[OrdersPage] → แสดงรายการออเดอร์ทั้งหมด
  └─ กดที่ออเดอร์ → [OrderDetailPage]
       ├─ ดูรายละเอียด
       ├─ ดู timeline สถานะ (Realtime)
       └─ แชร์ออเดอร์
```

### 4. ระบบสะสมแต้ม (Points)
```
ทุกการสั่งซื้อ 10 บาท = 1 Point

[ProfilePage] → ดู Points คงเหลือ
  ├─ ระดับสมาชิก (MEMBER/SILVER/GOLD/VIP)
  ├─ ประวัติการสะสม
  └─ แลกส่วนลดที่ [CheckoutPage]

Tiers:
- MEMBER: 0+ points
- SILVER: 500+ points (ลด 5%)
- GOLD: 1000+ points (ลด 10%)
- VIP: 2000+ points (ลด 15%)
```

### 5. ระบบหวย (Lottery)
```
ทุกออเดอร์ → ได้รับเลขท้าย 2 ตัวจาก Order ID

[LotteryPage]
  ├─ ดูตั๋วหวยที่มี
  ├─ ดู countdown ถึงวันประกาศผล
  ├─ ตรวจรางวัลอัตโนมัติ (เทียบกับ lotto_results)
  └─ ประกาศผลทุกวันที่ 1 และ 16 ของเดือน

รางวัล:
- เลขท้าย 2 ตัวตรง: 2,000 บาท
- เลขหน้า 3 ตัว: 4,000 บาท
- ทั้ง 2 อย่าง: 100,000 บาท (รางวัลที่ 1)
```

---

## 🎮 Gamification Features

### 1. 🎡 Wheel of Fortune (วงล้อเสี่ยงโชค)
```
Location: [HomePage] → กดไอคอน "วงล้อ"
Frequency: 3 ครั้ง/วัน/คน

Prizes:
- ลด 30 บาท (โอกาสน้อย)
- ลด 20 บาท
- ลด 15 บาท
- ลด 10 บาท
- ลด 5 บาท
- ลองใหม่ (หลายช่อง)

เก็บ state ที่: localStorage (per user, per day)
```

### 2. 🎲 Food Randomizer (สุ่มอาหาร)
```
Location: [HomePage] → กดไอคอน "สุ่มเมนู"
Use case: "คิดไม่ออกว่าจะกินอะไร"

Flow:
1. กด "สุ่มเลย"
2. แสดง animation สลับเมนูเร็วๆ
3. หยุดที่เมนูสุ่มได้
4. เลือก: สั่งเลย หรือ สุ่มใหม่
```

### 3. 🎤 Voice Order (สั่งด้วยเสียง)
```
Location: [HomePage] → กดไอคอน "สั่งด้วยเสียง"
Tech: Web Speech API (with fallback)

Flow:
1. กด "เริ่มพูด"
2. แสดง animation เสียง
3. ประมวลผลคำสั่ง
4. แสดงเมนูที่ตรงกัน
5. เลือกเพื่อเพิ่มลงตะกร้า

Example: "กะเพราหมูสับไข่ดาวพิเศษ"
```

### 4. 🔄 Quick Reorder
```
Location: [HomePage] → กดไอคอน "สั่งซ้ำ"
Data: 5 ออเดอร์ล่าสุดจากประวัติ

Flow:
1. แสดงรายการออเดอร์ที่เคยสั่ง
2. กดเพื่อดูรายละเอียด
3. กด "สั่งซ้ำ" → เพิ่มทุกรายการลงตะกร้า
```

---

## 👨‍🍳 Admin Flow

### เข้าสู่ระบบ Admin
```
[Home] → [Profile] → กด "โหมดเจ้าของร้าน"
Password: 5252
```

### 1. Dashboard
```
[AdminDashboard]
  ├─ สถิติวันนี้:
  │   ├─ ออเดอร์ใหม่
  │   ├─ กำลังทำ
  │   ├─ เสร็จสิ้น
  │   └─ รายได้รวม
  ├─ Quick Actions:
  │   ├─ ดูออเดอร์
  │   ├─ จัดการเมนู
  │   ├─ ลูกค้า
  │   └─ รายงาน
  └─ Realtime updates (Supabase subscription)
```

### 2. Order Management
```
[AdminOrdersPage]
  ├─ Filter by status: ทั้งหมด/ใหม่/กำลังทำ/พร้อมรับ/เสร็จสิ้น/ยกเลิก
  ├─ Search by order ID
  ├─ Sort by time
  └─ Actions per order:
      ├─ อัพเดทสถานะ (dropdown)
      ├─ ดูรายละเอียด
      ├─ พิมพ์ใบเสร็จ
      └─ ยกเลิกออเดอร์
```

### 3. Menu Management
```
[AdminMenuPage]
  ├─ รายการเมนูทั้งหมด
  ├─ Toggle availability (เปิด/ปิด)
  ├─ Add new menu
  ├─ Edit menu details
  └─ Delete menu
```

---

## 🔌 Integration

### LINE LIFF
```
- Login with LINE
- ดึง profile (รูป, ชื่อ)
- Share to LINE (แชร์ออเดอร์)
- Close LIFF app
```

### Supabase Realtime
```
- ติดตามสถานะออเดอร์แบบ realtime
- แจ้งเตือนเมื่อมีออเดอร์ใหม่ (Admin)
- อัพเดท points แบบ realtime
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── layout/
│   │   ├── RootLayout.tsx
│   │   └── AdminLayout.tsx
│   └── providers/
├── components/
│   ├── ui/ (Button, Card, Toast, etc.)
│   ├── layout/ (Container, BottomNav)
│   └── feedback/ (LoadingScreen, ErrorBoundary)
├── features/
│   ├── menu/ (MenuGrid, MenuItemModal, etc.)
│   ├── cart/ (CartDrawer, FloatingCart, cartStore)
│   ├── checkout/ (CheckoutPage, checkoutApi)
│   ├── orders/ (OrderCard, useOrders)
│   ├── points/ (Points display, usePoints)
│   ├── lottery/ (TicketCard, LotteryPage)
│   ├── admin/ (AdminDashboard, AdminOrders)
│   └── games/ (NEW: WheelOfFortune, Randomizer, VoiceOrder, QuickOrder)
├── store/ (Zustand stores)
├── lib/ (Supabase, LIFF, Analytics)
├── utils/ (formatters, helpers)
└── types/ (TypeScript definitions)
```

---

## 🔐 Security

### RLS Policies (Supabase)
```sql
-- Users can only see their own orders
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT USING (auth.uid() = user_id);

-- Anonymous can create orders (guest checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT WITH CHECK (true);

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
```

---

## 🚀 Deployment Checklist

- [ ] Setup Supabase project
- [ ] Run migration SQL files
- [ ] Configure environment variables (.env)
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_LIFF_ID (optional)
- [ ] Seed initial menu data
- [ ] Test all user flows
- [ ] Test admin flows
- [ ] Verify realtime subscriptions
- [ ] Build and deploy

---

## 📱 PWA Features

- Service Worker (sw.js)
- Offline fallback page
- Add to Home Screen
- Push notifications (future)

---

## 📝 Notes

### การคำนวณ Points
- 1 Point = การใช้จ่าย 10 บาท
- ใช้ Points ลดเงิน: 10 Points = 1 บาท
- Points ไม่มีวันหมดอายุ

### การสร้าง Lotto Ticket
- ใช้เลขท้าย 2 ตัวของ Order ID
- อัตโนมัติผ่าน database trigger
- ประกาศผลวันที่ 1 และ 16

### การจัดการออเดอร์ (สถานะ)
1. placed - ลูกค้าสั่งซื้อ
2. confirmed - ร้านรับออเดอร์
3. preparing - กำลังปรุง
4. ready - พร้อมรับ/ส่ง
5. delivered - ลูกค้าได้รับ
6. cancelled - ยกเลิก

---

**Last Updated**: 2026-02-21
**Version**: 2.0.0 React Edition
