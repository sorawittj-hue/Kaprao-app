# 🍛 Kaprao52 (กะเพรา 52)

> **World-Class Street Food Ordering App** — สั่งอาหาร, สะสมพอยต์, ลุ้นหวย, แลกรางวัล ทุกอย่างในแอพเดียว!

---

## 📱 About

**Kaprao52** เป็น Progressive Web App (PWA) สำหรับสั่งอาหารออนไลน์ สร้างด้วย React + TypeScript + Supabase พร้อมระบบ Gamification เต็มรูปแบบ ออกแบบมาให้ลูกค้ารู้สึกสนุกทุกครั้งที่สั่ง และกลับมาใช้งานซ้ำ!

### 🌟 Highlights
- **Seamless Guest-to-Member Flow** — สั่งอาหารได้ทันทีไม่ต้อง login, เพิ่ม LINE ทีหลังพอยต์ก็ยังได้
- **Real-time Order Tracking** — ติดตามสถานะออเดอร์แบบ real-time ผ่าน Supabase Realtime
- **Gamification System** — สะสมพอยต์ → เลื่อน tier → แลกรางวัล + ลุ้นหวย
- **LINE Integration** — ส่งออเดอร์ตรงถึง LINE OA, login ด้วย LINE LIFF

---

## ✨ Features

### 🛍️ ระบบสั่งอาหาร
- **Smart Menu** — หมวดหมู่ชัดเจน (กะเพรา, ของทอด, เส้น, แกง, เครื่องดื่ม)
- **Deep Customization** — เลือกความเผ็ด, เนื้อสัตว์, ท็อปปิ้ง (ไข่ดาว/เจียว/เยี่ยวม้า)
- **Smart Cart** — คำนวณส่วนลด, ใช้พอยต์, preview ตั๋วหวยก่อนสั่ง
- **Voice Order** — สั่งด้วยเสียง (สั่งด้วยเสียง ฟีเจอร์) 
- **Random Menu** — "คิดไม่ออก?" ให้ระบบสุ่มเมนูให้!

### 🚀 Guest → Member Conversion
- **Guest Ordering** — ไม่ต้อง login ก็สั่งได้ทันที
- **Points Preview** — Guest เห็น "พอยต์ที่จะได้" ก่อนกดสั่ง
- **Magic Claim** — Login LINE หลังสั่ง → พอยต์จาก guest order โอนเข้ากระเป๋าอัตโนมัติ
- **Tracking Token** — guest เปิดดู order detail ได้ผ่าน token

### 🛵 ติดตามสถานะ (Live Order Tracking)
- **Real-time Status** — 📝 รับออเดอร์ → 🔥 กำลังปรุง → 🛵 กำลังส่ง → ✅ เสร็จสิ้น
- **Visual Timeline** — animation สวยงาม เข้าใจง่าย
- **Phone Search** — guest ค้นหาออเดอร์ด้วยเบอร์โทรได้

### 🎰 Gamification & Loyalty
| Feature | Description |
|---------|-------------|
| ⭐ **Kaprao Points** | ทุก 10 บาท = 1 พอยต์, แลกรางวัลได้ |
| 🏆 **Tier System** | Member → Silver → Gold → VIP (สิทธิ์เพิ่มตาม tier) |
| 🎟️ **ตั๋วหวย** | ทุก 100 บาท = 1 ตั๋ว, ลุ้นเลข 2 ตัวท้าย Order ID ตรงหวยรัฐบาล = อาหารฟรี! |
| 🎡 **วงล้อเสี่ยงโชค** | หมุนฟรีทุกวัน ลุ้นส่วนลด/พอยต์พิเศษ |
| 🔥 **Streak Tracker** | สั่งติดต่อกัน → bonus points |
| 🎁 **แลกของรางวัล** | ส่วนลด, เมนูฟรี, ส่งฟรี |

### 👨‍🍳 Admin Dashboard
- **Order Management** — ดู/อัพเดทสถานะทุกออเดอร์
- **Menu Management** — เพิ่ม/แก้ไข/ปิดเมนู, จัดการ sold out
- **Points Adjustment** — ปรับพอยต์ให้ลูกค้าได้ (เพิ่ม/หัก)
- **Shop Toggle** — เปิด/ปิดร้านได้จากแอพ

### 💬 LINE Integration
- **LINE LIFF Login** — ดึงชื่อ, รูป profile จาก LINE อัตโนมัติ
- **Order to LINE OA** — ส่งรายละเอียดออเดอร์ครบ (เมนู, ราคา, ที่อยู่, พอยต์, ตั๋วหวย) ไปยัง LINE OA
- **Guest CTA** — ข้อความ LINE มี call-to-action ให้ guest login เพื่อรับพอยต์

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Styling** | TailwindCSS + Custom CSS Variables |
| **Animation** | Framer Motion |
| **State** | Zustand (with persist + devtools) |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + RPC) |
| **Auth** | LINE LIFF SDK + Supabase Auth |
| **Build** | Vite |
| **PWA** | vite-plugin-pwa + Service Worker |
| **Icons** | Lucide React |
| **Data Fetching** | TanStack React Query |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (with SQL migrations applied)
- LINE Developers account (LIFF app)

### Installation

```bash
# Clone
git clone https://github.com/Sorawittj/Kaprao-app.git
cd Kaprao-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Supabase & LIFF credentials

# Run development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_LIFF_ID=your-liff-id
```

### Database Setup

Run these SQL files in order in Supabase SQL Editor:
1. `SUPABASE_COMPLETE_SETUP.sql` — Tables, indexes, RLS policies, triggers
2. `MENU_OVERHAUL.sql` — Menu items & categories seed data
3. `GUEST_ORDER_MERGE_SQL.sql` — Guest order claim functions & phone search

---

## 📂 Project Structure

```
Kaprao-app/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx    # Auth init, welcome modal, guest claim
│   │   └── App.tsx                 # Root app with routing
│   ├── components/
│   │   ├── layout/                 # Container, BottomNavbar
│   │   └── ui/                     # Button, Card, Skeleton, Toast, etc.
│   ├── features/
│   │   ├── menu/                   # Menu grid, hero slider, search
│   │   ├── orders/                 # Order tracking, realtime, hooks
│   │   ├── points/                 # Points system, streak tracker
│   │   ├── lottery/                # Lottery tickets, draw logic
│   │   └── gamification/          # Wheel of fortune, random menu
│   ├── lib/
│   │   ├── auth.ts                 # Login, logout, guest mode, claim
│   │   ├── liff.ts                 # LINE LIFF SDK wrapper
│   │   ├── supabase.ts             # Supabase client
│   │   └── analytics.ts            # Page view tracking
│   ├── pages/
│   │   ├── HomePage.tsx            # Menu browsing + guest banner
│   │   ├── CheckoutPage.tsx        # Cart review + payment + LINE send
│   │   ├── OrdersPage.tsx          # Order history + phone search
│   │   ├── OrderDetailPage.tsx     # Single order + guest CTA
│   │   ├── ProfilePage.tsx         # Membership card + settings + rewards
│   │   └── LotteryPage.tsx         # Lottery tickets + results
│   ├── store/
│   │   ├── authStore.ts            # Auth state (user, isGuest, isAuth)
│   │   ├── cartStore.ts            # Cart items + calculations
│   │   ├── menuStore.ts            # Category filter + search
│   │   └── uiStore.ts              # Toasts + modals
│   ├── utils/
│   │   ├── buildLineMessage.ts     # LINE OA message formatter
│   │   ├── formatPrice.ts          # Currency formatting
│   │   └── formatDate.ts           # Thai date formatting
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── SUPABASE_COMPLETE_SETUP.sql     # Main database schema
├── MENU_OVERHAUL.sql               # Menu seed data
├── GUEST_ORDER_MERGE_SQL.sql       # Guest claim functions
├── .env                            # Environment variables
├── vite.config.ts                  # Vite configuration
└── package.json
```

---

## 🔄 User Journey

```
┌──────────────────────────────────────────────────┐
│                  FIRST VISIT                      │
│                                                   │
│  Welcome Modal → [Login LINE] or [Guest Mode]     │
└──────────────┬───────────────────┬───────────────┘
               │                   │
        ┌──────▼──────┐    ┌──────▼──────┐
        │  LINE User  │    │    Guest    │
        │ (Full perks)│    │ (Can order) │
        └──────┬──────┘    └──────┬──────┘
               │                   │
               └────────┬─────────┘
                        │
                ┌───────▼───────┐
                │  Browse Menu  │
                │  Add to Cart  │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │   Checkout    │ ← Points preview for guests
                │  + Payment    │
                └───────┬───────┘
                        │
                ┌───────▼───────┐
                │ Order Created │ → LINE OA message sent
                │ + Confetti 🎊 │
                └───────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
       ┌──────▼──────┐    ┌──────▼──────┐
       │  LINE User  │    │    Guest    │
       │ Gets points │    │ Sees CTA:  │
       │ Gets tickets│    │ "Login for │
       │ Immediately │    │  points!"  │
       └─────────────┘    └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │ Guest logs  │
                          │ in w/ LINE  │
                          │ → Points    │
                          │   claimed!  │
                          └─────────────┘
```

---

## 📱 LINE Message Format

เมื่อสั่งอาหาร ข้อความจะถูกส่งไปยัง LINE OA ในรูปแบบ:

```
╔══════════════════════╗
   🔥 กะเพรา 52 — ออเดอร์ใหม่!
╚══════════════════════╝

📋 ออเดอร์ #42
👤 คุณสมชาย
📞 081-234-5678
🕐 22/02/2569 — 20:30 น.
🏢 ส่งที่ทำงาน (พรุ่งนี้)
💳 โอนเงิน/พร้อมเพย์ ✅

━━━ รายการอาหาร ━━━━━━━━
1. กะเพราหมูกรอบ
   ↳ เผ็ดมาก, ไข่ดาว
   💰 75฿
2. น้ำเปล่า x2
   💰 20฿

━━━ สรุปยอด ━━━━━━━━━━━
   ราคารวม:     95฿
   🎁 ส่วนลด:   -10฿ (FIRST10)
   ✅ สุทธิ:     85฿

━━━ สิทธิพิเศษ ━━━━━━━━━
   ⭐ พอยต์ที่ได้: +8 pts
   🎟️ ตั๋วหวย: 1 ใบ
   🔢 เลขลุ้นโชค: 42
   📅 งวดวันที่: 01/03/2569

╔══════════════════════╗
   ขอบคุณที่อุดหนุน
   ร้านกะเพรา 52 ครับ! 🙏
╚══════════════════════╝
```

---

## 🔒 Security

- **Row Level Security (RLS)** — ทุก table มี policy ป้องกันการเข้าถึงข้ามผู้ใช้
- **Server-side RPC** — guest order claim ใช้ Supabase RPC function (SECURITY DEFINER)
- **Tracking Token** — guest ดูออเดอร์ได้เฉพาะเมื่อมี token ที่ถูกต้อง
- **Phone Search** — ใช้ server-side function เพื่อป้องกันการเข้าถึงข้อมูลส่วนตัว

---

## 📄 License

Private project — developed for Kaprao52 street food shop.

---

**Developed with ❤️ by Sorawittj**
*Version 3.0 — World-Class Edition 🚀*

 #   K a p r a o - a p p   ( N e w   R e p o s i t o r y ) 
 L a t e s t   p u s h   b y   s o r a w i t t j - h u e  
 