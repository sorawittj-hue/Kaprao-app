import { supabase } from '@/lib/supabase'
import type { PointLog } from '@/types'

export async function fetchUserPoints(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user points:', error)
    return 0
  }

  return ((data as Record<string, unknown> | null)?.points as number) || 0
}

export async function fetchPointLogs(userId: string): Promise<PointLog[]> {
  const normalizedUserId = normalizeUserId(userId)
  
  const { data, error } = await supabase
    .from('point_logs')
    .select('*')
    .eq('user_id', String(normalizedUserId))
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching point logs:', error)
    return []
  }

  return (data || []).map((row: unknown) => ({
    id: (row as Record<string, unknown>).id as number,
    userId: (row as Record<string, unknown>).user_id as string,
    action: (row as Record<string, unknown>).action as PointLog['action'],
    amount: (row as Record<string, unknown>).amount as number,
    orderId: (row as Record<string, unknown>).order_id as number | undefined,
    note: (row as Record<string, unknown>).note as string | undefined,
    balanceAfter: (row as Record<string, unknown>).balance_after as number,
    createdAt: (row as Record<string, unknown>).created_at as string,
  }))
}

/**
 * Convert user ID to number if needed
 * Some user IDs are strings (like LINE user IDs), but database expects bigint
 */
function normalizeUserId(userId: string): string | number {
  // If it's a pure number string, convert to number
  if (/^\d+$/.test(userId)) {
    return parseInt(userId, 10)
  }
  // If it contains underscore (like "1771761322688_jr41xo2lv"), 
  // try to extract the numeric part or use as-is
  const numericPart = userId.split('_')[0]
  if (numericPart && /^\d+$/.test(numericPart)) {
    return parseInt(numericPart, 10)
  }
  // Fallback: return original string (will likely fail if DB expects bigint)
  return userId
}

export async function addPoints(
  userId: string, 
  amount: number, 
  action: PointLog['action'] = 'EARN',
  note?: string,
  orderId?: number
): Promise<void> {
  // Get current points
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single()

  const currentPoints = ((profile as Record<string, unknown> | null)?.points as number) || 0
  const newBalance = currentPoints + amount

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      points: newBalance,
      updated_at: new Date().toISOString()
    } as never)
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Failed to update points: ${updateError.message}`)
  }

  // Log the transaction
  const { error: logError } = await supabase
    .from('point_logs')
    .insert({
      user_id: userId,
      action,
      amount,
      order_id: orderId,
      note,
      balance_after: newBalance,
    } as never)

  if (logError) {
    console.error('Error logging point transaction:', logError)
  }
}

export async function redeemPoints(
  userId: string,
  amount: number,
  orderId?: number
): Promise<boolean> {
  // Get current points
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userId)
    .single()

  const currentPoints = ((profile as Record<string, unknown> | null)?.points as number) || 0

  if (currentPoints < amount) {
    return false // Not enough points
  }

  const newBalance = currentPoints - amount

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      points: newBalance,
      updated_at: new Date().toISOString()
    } as never)
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Failed to redeem points: ${updateError.message}`)
  }

  // Log the transaction
  const { error: logError } = await supabase
    .from('point_logs')
    .insert({
      user_id: userId,
      action: 'REDEEM',
      amount: -amount,
      order_id: orderId,
      balance_after: newBalance,
    } as never)

  if (logError) {
    console.error('Error logging point redemption:', logError)
  }

  return true
}

// Calculate points earned from order amount
export function calculatePointsEarned(orderAmount: number): number {
  // 1 point per 10 baht spent
  return Math.floor(orderAmount / 10)
}

// Calculate discount from points (10 points = 1 baht)
export function calculateDiscountFromPoints(points: number): number {
  return Math.floor(points / 10)
}

// Point tiers
export const POINT_TIERS = {
  MEMBER: { min: 0, discount: 0, name: 'สมาชิก' },
  SILVER: { min: 500, discount: 5, name: 'Silver' },
  GOLD: { min: 1000, discount: 10, name: 'Gold' },
  VIP: { min: 2000, discount: 15, name: 'VIP' },
}

export function getUserTier(points: number): keyof typeof POINT_TIERS {
  if (points >= POINT_TIERS.VIP.min) return 'VIP'
  if (points >= POINT_TIERS.GOLD.min) return 'GOLD'
  if (points >= POINT_TIERS.SILVER.min) return 'SILVER'
  return 'MEMBER'
}

export function getNextTier(points: number): { name: string; pointsNeeded: number } | null {
  if (points < POINT_TIERS.SILVER.min) {
    return { 
      name: POINT_TIERS.SILVER.name, 
      pointsNeeded: POINT_TIERS.SILVER.min - points 
    }
  }
  if (points < POINT_TIERS.GOLD.min) {
    return { 
      name: POINT_TIERS.GOLD.name, 
      pointsNeeded: POINT_TIERS.GOLD.min - points 
    }
  }
  if (points < POINT_TIERS.VIP.min) {
    return { 
      name: POINT_TIERS.VIP.name, 
      pointsNeeded: POINT_TIERS.VIP.min - points 
    }
  }
  return null // Already at max tier
}
