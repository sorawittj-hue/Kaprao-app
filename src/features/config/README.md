# Shop Configuration System

Centralized configuration management for Kaprao52 app.

## Features

- **Dynamic Configuration**: All shop settings stored in Supabase `shop_config` table
- **Real-time Updates**: Config changes sync instantly across all clients
- **Type-safe API**: Full TypeScript support
- **Admin Panel**: Built-in UI for managing configurations
- **Shop Hours Check**: Automatic open/closed status detection

## Configuration Keys

| Key | Type | Description |
|-----|------|-------------|
| `contact` | `ContactInfo` | Phone, LINE ID, email |
| `shop_hours` | `ShopHours` | Open/close times, days |
| `order_limits` | `OrderLimits` | Max orders per slot |
| `payment` | `PaymentConfig` | PromptPay, bank accounts |

## Quick Start

### Using Hooks

```tsx
import { useContactInfo, useShopHours, useIsShopOpen } from '@/features/config'

function MyComponent() {
  const { data: contact } = useContactInfo()
  const { data: hours } = useShopHours()
  const { isShopOpen } = useIsShopOpen()
  
  return (
    <div>
      <p>Phone: {contact?.phone}</p>
      <p>Open: {hours?.open} - {hours?.close}</p>
      <p>Status: {isShopOpen ? 'Open' : 'Closed'}</p>
    </div>
  )
}
```

### Using API Directly

```tsx
import { getContactInfo, isShopOpen } from '@/features/config'

async function handleCall() {
  const contact = await getContactInfo()
  window.location.href = `tel:${contact.phone}`
}
```

### Shop Closed Banner

```tsx
import { ShopClosedBanner } from '@/features/config'

function HomePage() {
  return (
    <div>
      <ShopClosedBanner />
      {/* Rest of page */}
    </div>
  )
}
```

### Admin Configuration Panel

```tsx
import { ShopConfigManager } from '@/features/config'

function AdminSettingsPage() {
  return <ShopConfigManager />
}
```

## Database Setup

Run the migration file:

```bash
psql -f add_shop_config_table.sql
```

Or execute SQL in Supabase SQL Editor.

## File Structure

```
src/features/config/
├── api/
│   └── configApi.ts       # API functions
├── components/
│   ├── ShopClosedBanner.tsx   # Closed notification
│   └── ShopConfigManager.tsx  # Admin panel
├── hooks/
│   └── useShopConfig.ts   # React Query hooks
├── utils/
│   └── timeUtils.ts       # Time calculations
├── types.ts               # TypeScript types
└── index.ts              # Public exports
```

## Default Values

If database is empty, these defaults are used:

- **Phone**: `0812345678`
- **LINE ID**: `@kaprao52`
- **LINE OA ID**: `@772ysswn`
- **Hours**: 09:00 - 20:00 (Mon-Sat)
- **Timezone**: Asia/Bangkok

## Security

- Read access: Public (all users can view config)
- Write access: Admin only (requires `user_roles.role = 'admin'`)
- RLS policies enforced at database level
