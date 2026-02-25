# 🚀 Kaprao52 Unified Order System v2.0

> **"One Flow, Two Experiences — Seamless Guest-to-Member Journey"**

## 🎯 ปัญหาของระบบเดิม

| ปัญหา | ผลกระทบ |
|-------|---------|
| Guest กับ Member ต้องใช้คนละ flow | งง, maintenance ยาก |
| Guest ไม่ได้รับพอยต์/ตั๋วหวยทันที | ขาดแรงจูงใจให้สั่ง |
| ต้อง login หลังสั่งเพื่อ claim | friction สูง, drop-off สูง |
| ระบบหวยใช้แค่เลข order id | ไม่สนุก, ไม่มีความยืดหยุ่น |
| ไม่มีระบบคิวที่ชัดเจน | ลูกค้างงว่าต้องรอนานแค่ไหน |

---

## ✨ แนวคิดใหม่: "Unified Flow with Progressive Enhancement"

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED ORDER FLOW v2.0                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   [เข้าเว็บ] ──→ [เลือกเมนู] ──→ [ตะกร้า] ──→ [Checkout] ──→ [สั่งสำเร็จ]   │
│       │                                                              │       │
│       │         ┌───────────────────────────────────────────────────┘       │
│       │         │                                                           │
│       │    ┌────▼────┐    ┌────────┐    ┌────────┐                         │
│       └───→│  Guest  │ or │  LINE  │ or │ Member │ (เลือกตอน checkout)      │
│            │  Mode   │    │  Login │    │ (auto) │                         │
│            └────┬────┘    └────┬───┘    └────┬───┘                         │
│                 │              │             │                              │
│                 └──────────────┴─────────────┘                              │
│                                │                                            │
│                    ┌───────────▼────────────┐                               │
│                    │   POST-ORDER MAGIC ✨   │                               │
│                    └───────────┬────────────┘                               │
│                                │                                            │
│        ┌───────────────────────┼───────────────────────┐                    │
│        │                       │                       │                    │\n│   ┌────▼────┐           ┌─────▼─────┐         ┌──────▼──────┐               │
│   │ Guest   │           │  Guest →  │         │   Member    │               │
│   │ Receipt │           │  Member   │         │   Perks     │               │
│   │ (Token) │           │  Convert  │         │  (Instant)  │               │
│   └────┬────┘           └─────┬─────┘         └──────┬──────┘               │
│        │                      │                      │                       │
│        │  Login LINE ─────────┘                      │                       │
│        │         │                                   │                       │
│        │         ▼                                   │                       │
│        │    ┌─────────┐    ┌─────────┐              │                       │
│        └───→│ Auto    │───→│ Points  │──────────────┘                       │
│             │ Claim   │    │ + Tickets                                         │
│             └─────────┘    └─────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ สถาปัตยกรรมใหม่

### 1. Anonymous Guest Identity (Persistent)

```typescript
// สร้าง guest identity ถาวรตั้งแต่เข้าเว็บครั้งแรก
interface GuestIdentity {
  id: string;           // uuid ถาวร (เก็บใน localStorage)
  displayName: string;  // "Guest_8A3F"
  createdAt: string;
  isGuest: true;
}

// เก็บทุกอย่างใน localStorage ก่อน login
// พอ login → sync ทั้งหมดเข้า Supabase
```

**ประโยชน์:**
- Guest ได้รับพอยต์/ตั๋วหวยทันที (แต่เก็บใน localStorage ก่อน)
- พอ login → ข้อมูลทั้งหมด sync เข้า account โดยอัตโนมัติ
- ไม่มีการ "claim" ที่ลำบาก

### 2. Unified Order State

```typescript
interface UnifiedOrder {
  // Core
  id: number;
  guestId?: string;        // สำหรับ guest (persistent)
  userId?: string;         // สำหรับ LINE user (หลัง login)
  
  // Customer Info
  customerName: string;
  phoneNumber: string;
  
  // Items & Pricing
  items: OrderItem[];
  totalPrice: number;
  
  // Status
  status: OrderStatus;
  
  // NEW: Smart Queue System
  queueNumber?: string;    // "A015", "B023"
  estimatedTime?: number;  // นาที
  
  // NEW: Pre-order
  scheduledFor?: string;   // ISO date (สำหรับ pre-order)
  
  // Rewards (เก็บทั้ง Guest & Member)
  pointsEarned: number;
  lottoTickets: LottoTicket[];
  
  createdAt: string;
}
```

### 3. Smart Queue System

```typescript
interface QueueSystem {
  // Queue Types
  // A = ส่งที่ทำงาน (workplace)
  // B = ส่งในหมู่บ้าน (village)
  // C = รับที่ร้าน (pickup)
  // D = Pre-order (scheduled)
  
  currentQueue: {
    prefix: 'A' | 'B' | 'C' | 'D';
    number: number;
    waitTime: number;  // นาทีโดยเฉลี่ย
  };
  
  yourPosition: {
    queueNumber: string;  // "A015"
    ordersAhead: number;  // 3 ออเดอร์ก่อนหน้า
    estimatedMinutes: number;  // ~15 นาที
  };
}
```

---

## 🎰 Kaprao Lottery 2.0

### ปัญหาเดิม
- ได้เลขจาก order id อย่างเดียว → ไม่สนุก
- ไม่มีระบบซื้อตั๋วเพิ่ม
- ไม่มีการเลือกเลขเอง

### ระบบใหม่

```typescript
interface LottoTicket {
  id: number;
  orderId: number;
  userId?: string;       // ถ้า login แล้ว
  guestId?: string;      // ถ้ายังเป็น guest
  
  // Number Selection
  number: string;        // "52", "5252", "123456"
  numberType: 'auto' | 'manual' | 'vip';
  
  // Source
  source: 'order_free' | 'points_purchase' | 'bonus';
  purchasePrice?: number;  // ถ้าซื้อด้วยพอยต์
  
  // Status
  drawDate: string;
  status: 'active' | 'won' | 'expired';
  prize?: {
    type: 'free_meal' | 'cash_2000' | 'cash_4000' | 'jackpot';
    claimed: boolean;
    claimedAt?: string;
  };
  
  createdAt: string;
}

// ราคาซื้อตั๋วเพิ่ม
const TICKET_PRICES = {
  standard: { points: 100, numberLength: 2 },   // 100 pts = เลข 2 ตัว
  premium: { points: 500, numberLength: 4 },    // 500 pts = เลข 4 ตัว
  vip: { points: 1000, numberLength: 6 },       // 1000 pts = เลข 6 ตัว
};
```

### วิธีได้ตั๋วหวย

| วิธี | จำนวน | รายละเอียด |
|------|-------|-----------|
| สั่งอาหาร | 1 ใบ/ออเดอร์ | ได้ฟรีอัตโนมัติ |
| ซื้อด้วยพอยต์ | ไม่จำกัด | 100 pts = 2 ตัว, 500 pts = 4 ตัว |
| Streak Bonus | 1-3 ใบ | สั่งติดต่อกัน 7 วัน |
| VIP Monthly | 5 ใบ | สมาชิก VIP ได้ฟรีทุกเดือน |

### การออกรางวัล (ใหม่)

```typescript
// ใช้ผลหวยรัฐบาลไทยจริง (ผ่าน API)
// ประกาศผลทุกวันที่ 1 และ 16

interface LotteryResult {
  drawDate: string;
  
  // รางวัลจากหวยรัฐบาล
  firstPrize: string;      // รางวัลที่ 1 (6 ตัว)
  last2Digits: string;     // 2 ตัวท้าย
  last3Digits: string[];   // 3 ตัวท้าย 2 รางวัล
  first3Digits: string[];  // 3 ตัวหน้า 2 รางวัล
  
  // ตรวจรางวัลอัตโนมัติ
  winningTickets: {
    ticketId: number;
    prize: string;
    amount: number;
  }[];
}

// อัตราจ่าย
const PRIZES = {
  last2_match: { type: 'free_meal', value: 0, desc: 'กินฟรี 1 มื้อ' },
  last3_match: { type: 'cash_2000', value: 2000, desc: 'เงินรางวัล 2,000฿' },
  first3_match: { type: 'cash_2000', value: 2000, desc: 'เงินรางวัล 2,000฿' },
  last4_match: { type: 'cash_4000', value: 4000, desc: 'เงินรางวัล 4,000฿' },
  first6_match: { type: 'jackpot', value: 100000, desc: 'รางวัลที่ 1! 100,000฿' },
};
```

---

## 📱 UI/UX Flow ใหม่

### Checkout Page (Unified)

```
┌────────────────────────────────────────┐
│  ← ยืนยันการสั่งซื้อ                    │
├────────────────────────────────────────┤
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 👤 ข้อมูลผู้สั่ง                   │   │
│  ├────────────────────────────────┤   │
│  │ ชื่อ: [____________]            │   │
│  │ เบอร์: [____________] *         │   │
│  │                                  │   │
│  │ ⚡️ รับพอยต์ + ตั๋วหวยฟรี!        │   │
│  │ [🔐 Login LINE] หรือ [Continue  │   │
│  │     as Guest →]                 │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 🚚 วิธีรับอาหาร                   │   │
│  ├────────────────────────────────┤   │
│  │ ○ ส่งที่ทำงาน (พรุ่งนี้)          │   │
│  │ ● ส่งในหมู่บ้าน                  │   │
│  │   ที่อยู่: [________________]    │   │
│  │   ⏱ รอ ~15 นาที | คิวที่ B023   │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 💳 วิธีชำระเงิน                   │   │
│  ├────────────────────────────────┤   │
│  │ ● เงินสด                         │   │
│  │ ○ พร้อมเพย์                      │   │
│  │ ○ โอนเงิน                        │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 🎰 ตั๋วหวย (จะได้หลังสั่ง)        │   │
│  ├────────────────────────────────┤   │
│  │ เลขที่จะได้: [__52__]            │   │
│  │ [เลือกเลขเอง +100 pts]           │   │
│  │ [ซื้อเพิ่ม 1 ใบ / 100 pts]       │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 💰 สรุปยอด                       │   │
│  ├────────────────────────────────┤   │
│  │ ราคารวม:          ฿185          │   │
│  │ ส่วนลด:          -฿10           │   │
│  │ ─────────────────────────────   │   │
│  │ ยอดสุทธิ:         ฿175          │   │
│  │                                 │   │
│  │ 🎁 จะได้รับ: +17 pts, 1 ตั๋ว    │   │
│  └────────────────────────────────┘   │
│                                        │
│  [      ยืนยันการสั่งซื้อ ฿175       ] │
└────────────────────────────────────────┘
```

### Order Success Page (Guest Mode)

```
┌────────────────────────────────────────┐
│                                        │
│          ✅ สั่งซื้อสำเร็จ!             │
│                                        │
│         ┌──────────────┐              │
│         │              │              │
│         │   คิว B023   │              │
│         │              │              │
│         └──────────────┘              │
│                                        │
│   ออเดอร์ #5242                        │
│   ประมาณ 15 นาที                       │
│                                        │
│   ┌────────────────────────────────┐  │
│   │ 🎰 ตั๋วหวยของคุณ                │  │
│   ├────────────────────────────────┤  │
│   │   ┌─┬─┬─┬─┬─┐                  │  │
│   │   │0│0│0│0│5│2│                 │  │
│   │   └─┴─┴─┴─┴─┘                  │  │
│   │   งวด 1 มี.ค. 2568             │  │
│   │                                 │  │
│   │   ⚠️ Login เพื่อบันทึกตั๋ว      │  │
│   │   [🔐 Login LINE ตอนนี้]       │  │
│   └────────────────────────────────┘  │
│                                        │
│   ┌────────────────────────────────┐  │
│   │ ⭐ พอยต์รอการบันทึก             │  │
│   │                                 │  │
│   │   คุณจะได้รับ +17 พอยต์        │  │
│   │   Login เพื่อบันทึกเข้าบัญชี    │  │
│   │                                 │  │
│   │   [🎁 Login ตอนนี้]            │  │
│   └────────────────────────────────┘  │
│                                        │
│   [ดูรายละเอียด]  [แชร์ให้เพื่อน]     │
│                                        │
└────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Guest → Member Conversion (Seamless)

```typescript
// 1. Guest สั่งอาหาร
const guestOrder = {
  guestId: 'guest_8a3f29',  // จาก localStorage
  userId: null,
  items: [...],
  pointsEarned: 17,
  lottoTickets: [{ number: '000052', ... }],
}

// 2. เก็บใน localStorage ก่อน
localStorage.setItem('pending_guest_rewards', JSON.stringify({
  guestId: 'guest_8a3f29',
  orderId: 5242,
  points: 17,
  tickets: [{ number: '000052', ... }],
}));

// 3. Guest login LINE → Sync API ทำงานอัตโนมัติ
const syncResult = await syncGuestToMember({
  guestId: 'guest_8a3f29',
  lineUserId: 'Ua1b2c3d4...',
});

// 4. ผลลัพธ์
// - Points 17 บวกเข้า account
// - Tickets ทั้งหมดโอนเข้า user_id ใหม่
// - Order อัพเดท user_id
// - Guest data ลบทิ้ง
```

---

## 🗄️ Database Schema Updates

### New Tables

```sql
-- 1. Guest Identities (ถาวร)
CREATE TABLE guest_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint TEXT UNIQUE,  -- browser fingerprint
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lotto Tickets (ปรับปรุง)
CREATE TABLE lotto_tickets (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    user_id UUID REFERENCES profiles(id),
    guest_id UUID REFERENCES guest_identities(id),
    
    number TEXT NOT NULL,
    number_type TEXT DEFAULT 'auto', -- auto, manual, vip
    
    source TEXT DEFAULT 'order_free', -- order_free, points_purchase, bonus
    purchase_price INT DEFAULT 0,
    
    draw_date DATE NOT NULL,
    status TEXT DEFAULT 'active', -- active, won, expired
    
    prize_type TEXT, -- free_meal, cash_2000, cash_4000, jackpot
    prize_claimed BOOLEAN DEFAULT FALSE,
    prize_claimed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Queue Management
CREATE TABLE order_queues (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    queue_type TEXT NOT NULL, -- A, B, C, D
    queue_number INT NOT NULL,
    queue_display TEXT NOT NULL, -- "A023"
    
    estimated_minutes INT,
    actual_ready_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pre-orders
CREATE TABLE pre_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    scheduled_for TIMESTAMPTZ NOT NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎮 Gamification Integration

### Streak System + Lottery

```typescript
// สั่งติดต่อกัน = ได้ตั๋วโบนัส
const STREAK_BONUS = {
  3: { tickets: 1, points: 10 },
  7: { tickets: 2, points: 50 },
  14: { tickets: 3, points: 100 },
  30: { tickets: 5, points: 300 },
};

// VIP Monthly Lottery Bonus
const VIP_BONUS = {
  MEMBER: { monthlyTickets: 0 },
  SILVER: { monthlyTickets: 1 },
  GOLD: { monthlyTickets: 3 },
  VIP: { monthlyTickets: 5 },
};
```

---

## 📊 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Guest-to-Member conversion | ~5% | >20% |
| Order completion rate | ~60% | >85% |
| Lottery engagement | ~10% | >40% |
| Return rate (7 days) | ~15% | >35% |

---

## 🚀 Implementation Phases

### Phase 1: Core Unified Flow
- [ ] Guest Identity system
- [ ] Unified checkout flow
- [ ] Auto-sync on login

### Phase 2: Smart Queue
- [ ] Queue number generation
- [ ] Estimated time calculation
- [ ] Real-time queue updates

### Phase 3: Lottery 2.0
- [ ] New ticket system
- [ ] Number selection UI
- [ ] Points purchase
- [ ] Auto prize checking

### Phase 4: Pre-order
- [ ] Schedule ordering
- [ ] Reminder system
- [ ] Batch preparation

---

**Last Updated**: 2026-02-24  
**Version**: 2.0.0 — Unified Order System
