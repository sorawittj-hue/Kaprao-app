/**
 * Shop Configuration Types
 */

export interface ContactInfo {
  phone: string
  line_id: string
  line_oa_id: string
  email?: string
  facebook?: string
}

export interface ShopHours {
  open: string // Format: "HH:MM"
  close: string // Format: "HH:MM"
  days_open: number[] // 0 = Sunday, 6 = Saturday
  timezone: string // e.g., "Asia/Bangkok"
}

export interface OrderLimits {
  max_orders_per_slot: number
  slot_duration_minutes: number
}

export interface BankAccount {
  bank_name: string
  account_number: string
  account_name: string
  branch?: string
}

export interface PaymentConfig {
  promptpay_number: string
  promptpay_name: string
  bank_accounts: BankAccount[]
}

export interface ShopConfig {
  id: string
  key: string
  value: unknown
  updated_at: string
  updated_by?: string
}

export interface ShopStatus {
  isOpen: boolean
  nextOpenTime?: string
  message?: string
}

// Config keys used in database
export const CONFIG_KEYS = {
  CONTACT: 'contact',
  SHOP_HOURS: 'shop_hours',
  ORDER_LIMITS: 'order_limits',
  PAYMENT: 'payment',
} as const

export type ConfigKey = typeof CONFIG_KEYS[keyof typeof CONFIG_KEYS]
