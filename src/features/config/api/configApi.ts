import { supabase } from '@/lib/supabase'
import type { ContactInfo, ShopHours, OrderLimits, PaymentConfig } from '@/types'

export async function getShopConfig<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('shop_config')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) return null
  return data.value as T
}

export async function updateShopConfig<T>(key: string, value: T): Promise<void> {
  const { error } = await supabase
    .from('shop_config')
    .update({
      value: value as any,
      updated_at: new Date().toISOString()
    })
    .eq('key', key)

  if (error) throw new Error(error.message)
}

export async function getContactInfo(): Promise<ContactInfo> {
  const config = await getShopConfig<ContactInfo>('contact')
  return config || {
    phone: '0812345678',
    line_id: '@kaprao52',
    line_oa_id: '@772ysswn'
  }
}

export async function getShopHours(): Promise<ShopHours> {
  const config = await getShopConfig<ShopHours>('shop_hours')
  return config || {
    open: '08:00',
    close: '17:00',
    days_open: [1, 2, 3, 4, 5],
    timezone: 'Asia/Bangkok'
  }
}

export async function getOrderLimits(): Promise<OrderLimits> {
  const config = await getShopConfig<OrderLimits>('order_limits')
  return config || {
    max_orders_per_slot: 20,
    slot_duration_minutes: 30,
    max_items_per_order: 50
  }
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const config = await getShopConfig<PaymentConfig>('payment')
  return config || {
    promptpay_number: '0812345678',
    promptpay_name: 'นายสมชาย ใจดี',
    bank_accounts: []
  }
}

export async function isShopOpen(): Promise<boolean> {
  const { data, error } = await (supabase.rpc as any)('is_shop_open')
  if (error) {
    // Fallback: check manually
    const hours = await getShopHours()
    return checkShopOpenLocal(hours)
  }
  return data || false
}

export async function getNextOpeningTime(): Promise<string | null> {
  const hours = await getShopHours()
  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Check if still open today
  if (hours.days_open.includes(currentDay) && currentTime < hours.close) {
    return `วันนี้ ${hours.close} น.`
  }

  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7
    if (hours.days_open.includes(nextDay)) {
      const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
      return `${dayNames[nextDay]} ${hours.open} น.`
    }
  }

  return null
}

function checkShopOpenLocal(hours: ShopHours): boolean {
  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Check if today is in days_open
  if (!hours.days_open.includes(currentDay)) {
    return false
  }

  // Check time
  return currentTime >= hours.open && currentTime <= hours.close
}
