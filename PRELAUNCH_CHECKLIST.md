# 🚀 Kaprao52 Pre-Launch Checklist

## ✅ สิ่งที่พัฒนาเสร็จแล้ว

### 1. Database Schema (migrations/001_complete_prelaunch_setup.sql)
- [x] `shop_config` - ตั้งค่าร้าน (แทนที่ hardcoded values)
- [x] `reviews` - ระบบรีวิว/ให้คะแนน
- [x] `coupons` - ระบบคูปองส่วนลดแบบเต็มรูปแบบ
- [x] `order_slots` - จำกัดจำนวนออเดอร์ต่อช่วงเวลา
- [x] `inventory_items` - ระบบจัดการสต็อกวัตถุดิบ
- [x] `menu_item_ingredients` - เชื่อมโยงเมนูกับวัตถุดิบ
- [x] `inventory_transactions` - ประวัติการเคลื่อนไหวสต็อก
- [x] `push_tokens` - เก็บ token สำหรับ push notification
- [x] `notifications` - ระบบแจ้งเตือน in-app
- [x] `backup_logs` - บันทึกการสำรองข้อมูล
- [x] `order_cancellations` - บันทึกการยกเลิกออเดอร์

### 2. Payment System (src/features/payment/)
- [x] `api/paymentApi.ts` - QR PromptPay generation, slip upload
- [x] `hooks/usePayment.ts` - React Query hooks
- [x] `components/PaymentQRModal.tsx` - Modal แสดง QR
- [x] `components/PaymentSlipUpload.tsx` - อัพโหลดสลิป

### 3. Notification System (src/features/notifications/)
- [x] `api/notificationApi.ts` - CRUD operations
- [x] `hooks/useNotifications.ts` - Query hooks
- [x] `components/NotificationBell.tsx` - UI component
- [x] Real-time subscription support

### 4. Shop Config System (src/features/config/)
- [x] `api/configApi.ts` - ดึง/แก้ไขการตั้งค่า
- [x] `hooks/useShopConfig.ts` - Query hooks
- [x] `components/ShopClosedBanner.tsx` - แสดงสถานะร้านปิด
- [x] `is_shop_open()` database function

### 5. Coupon System (src/features/coupons/) — จาก Subagent
- [x] `api/couponApi.ts` - Validation, CRUD
- [x] `hooks/useCoupons.ts` - 13+ hooks
- [x] `components/CouponInput.tsx` - Input + validation
- [x] `components/CouponList.tsx` - List available coupons
- [x] `components/AdminCouponManager.tsx` - Admin interface
- [x] `validate_and_apply_coupon()` database function

### 6. Review System (src/features/reviews/)
- [x] `api/reviewApi.ts` - CRUD + helpful votes
- [x] `hooks/useReviews.ts` - Query hooks
- [x] `components/ReviewForm.tsx` - Form ให้คะแนน
- [x] `types/index.ts` - Type definitions

### 7. Order Cancellation (src/features/orders/)
- [x] `api/cancelApi.ts` - Cancellation logic + time window
- [x] `hooks/useCancelOrder.ts` - Query hooks
- [x] `components/CancelOrderButton.tsx` - UI component
- [x] 15-minute cancellation window

### 8. Inventory Management (src/features/inventory/)
- [x] `api/inventoryApi.ts` - Stock management
- [x] `hooks/useInventory.ts` - Query hooks
- [x] Auto-deduct on order confirmed
- [x] Auto-disable menu when stock low
- [x] Low stock alerts

### 9. Query Keys (src/lib/queryClient.ts)
- [x] payment, notifications, config, reviews, inventory keys

### 10. Types (src/types/index.ts)
- [x] ContactInfo, ShopHours, OrderLimits, PaymentConfig

---

## 🔧 ขั้นตอนการติดตั้ง (Setup Instructions)

### 1. รัน Database Migrations

```bash
# ใน Supabase SQL Editor, รันไฟล์นี้ตามลำดับ:
1. migrations/001_complete_prelaunch_setup.sql
2. migrations/002_functions_and_triggers.sql
```

### 2. สร้าง Storage Bucket

```sql
-- ใน Supabase Storage
CREATE bucket payment-slips (private: false);

-- Add RLS policy
CREATE POLICY "Authenticated users can upload slips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-slips');
```

### 3. ติดตั้ง Dependencies

```bash
npm install qrcode.react
```

### 4. อัพเดท Environment Variables

```env
# .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_LIFF_ID=your_liff_id

# Optional: OneSignal for push notifications
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

### 5. ตั้งค่า Shop Config ครั้งแรก

```sql
-- อัพเดทข้อมูลร้านของคุณ
UPDATE shop_config 
SET value = '{"phone": "YOUR_PHONE", "line_id": "@YOUR_LINE", "line_oa_id": "@YOUR_OA"}'
WHERE key = 'contact';

UPDATE shop_config 
SET value = '{"promptpay_number": "YOUR_PROMPTPAY", "promptpay_name": "YOUR_NAME"}'
WHERE key = 'payment';

UPDATE shop_config 
SET value = '{"open": "08:00", "close": "17:00", "days_open": [1,2,3,4,5]}'
WHERE key = 'shop_hours';
```

---

## 📱 การใช้งาน Features

### Payment System
```tsx
import { PaymentQRModal, usePaymentStatus } from '@/features/payment'

// ใน CheckoutPage
<PaymentQRModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  orderId={order.id}
  amount={order.totalPrice}
/>
```

### Coupon System
```tsx
import { CouponInput } from '@/features/coupons'

<CouponInput
  orderTotal={cartTotal}
  menuItemIds={cartItems.map(i => i.menuItem.id)}
  onApply={(result) => setDiscount(result.discount)}
/>
```

### Shop Config
```tsx
import { ShopClosedBanner, useContactInfo } from '@/features/config'

// แสดง banner ถ้าร้านปิด
<ShopClosedBanner />

// ดึงข้อมูลติดต่อ
const { data: contact } = useContactInfo()
```

### Reviews
```tsx
import { ReviewForm } from '@/features/reviews'

<ReviewForm
  order={order}
  onSuccess={() => showToast('ขอบคุณสำหรับรีวิว')}
/>
```

### Order Cancellation
```tsx
import { CancelOrderButton } from '@/features/orders'

<CancelOrderButton
  order={order}
  onCancelSuccess={() => navigate('/orders')}
/>
```

### Notifications
```tsx
import { NotificationBell } from '@/features/notifications'

// ใน Header
<NotificationBell />
```

---

## 🔔 Push Notifications Setup (OneSignal)

1. สร้างบัญชี OneSignal (https://onesignal.com)
2. สร้าง Web Push app
3. ใส่ OneSignal App ID ใน .env
4. ติดตั้ง SDK:

```tsx
// src/main.tsx
import OneSignal from 'react-onesignal'

await OneSignal.init({
  appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
  allowLocalhostAsSecureOrigin: true,
})

// Request permission
OneSignal.Slidedown.promptPush()
```

---

## 📊 Admin Features

### สำหรับหน้า Admin Dashboard:

```tsx
// Admin Inventory Management
import { useInventory, useLowStockItems } from '@/features/inventory'

// Admin Coupon Management  
import { AdminCouponManager } from '@/features/coupons'

// Admin Review Moderation
import { useAllReviews, useApproveReview } from '@/features/reviews'
```

---

## ⚠️ สิ่งที่ต้องทำเพิ่มเติมก่อนเปิดร้าน

### High Priority
- [ ] ทดสอบการสั่งซื้อ End-to-End (ทุก payment method)
- [ ] ตั้งค่า LINE Messaging API สำหรับส่งข้อความ
- [ ] ตั้งค่า OneSignal สำหรับ Push Notification
- [ ] อัพโหลดรูป QR Code PromptPay จริง
- [ ] ทดสอบระบบอัพโหลดสลิป
- [ ] สร้าง sample coupons สำหรับ soft launch

### Medium Priority  
- [ ] เพิ่ม loading skeletons
- [ ] ปรับปรุง error boundaries
- [ ] SEO meta tags
- [ ] Analytics event tracking
- [ ] ระบบสำรองข้อมูลอัตโนมัติ (Supabase Scheduled Functions)

### Low Priority
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

## 🆘 Troubleshooting

### ปัญหา: QR Code ไม่แสดง
- ตรวจสอบว่า `qrcode.react` ติดตั้งแล้ว
- ตรวจสอบ `promptpay_number` ใน shop_config

### ปัญหา: อัพโหลดสลิปไม่ได้
- ตรวจสอบ Storage bucket `payment-slips` สร้างแล้ว
- ตรวจสอบ RLS policies
- ดู error ใน browser console

### ปัญหา: Real-time updates ไม่ทำงาน
- ตรวจสอบว่าเปิด Realtime ใน Supabase Project Settings
- ตรวจสอบ RLS policies อนุญาต real-time

---

## 📞 การสนับสนุน

หากมีปัญหา:
1. ตรวจสอบ browser console
2. ตรวจสอบ Supabase Logs
3. ตรวจสอบ SQL syntax ใน migrations

---

**Version 1.0 | Pre-Launch Edition** 🎉
