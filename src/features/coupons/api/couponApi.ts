import { supabase } from '@/lib/supabase'
import type { 
  Coupon, 
  CouponUsage, 
  ValidationResult, 
  CouponStats,
  CouponFormData 
} from '../types/coupon.types'

// Helper type for RPC calls that are not in the generated types
type SupabaseWithRPC = typeof supabase & {
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
}

// ==================== Public Coupon Functions ====================

export async function validateCoupon(
  code: string, 
  orderTotal: number, 
  menuItemIds: number[]
): Promise<ValidationResult> {
  const { data, error } = await (supabase as SupabaseWithRPC)
    .rpc('validate_and_apply_coupon', {
      p_coupon_code: code.toUpperCase().trim(),
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_order_total: orderTotal,
      p_menu_item_ids: menuItemIds,
    })

  if (error) {
    console.error('Error validating coupon:', error)
    return { valid: false, message: 'ไม่สามารถตรวจสอบคูปองได้' }
  }

  return data as ValidationResult
}

export async function getAvailableCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching available coupons:', error)
    return []
  }

  return (data || []).map(mapCoupon)
}

export async function getUserCouponHistory(): Promise<CouponUsage[]> {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return []

  const { data, error } = await supabase
    .from('coupon_usages')
    .select(`
      *,
      coupon:coupons(*)
    `)
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupon history:', error)
    return []
  }

  return (data || []).map(mapCouponUsage)
}

export async function applyCouponToOrder(
  couponId: number, 
  orderId: number,
  discountAmount: number
): Promise<void> {
  const { data: user } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('coupon_usages')
    .insert({
      coupon_id: couponId,
      user_id: user.user?.id,
      order_id: orderId,
      discount_amount: discountAmount,
    } as never)

  if (error) {
    throw new Error(`Failed to apply coupon: ${error.message}`)
  }

  // Increment usage count on coupon
  const { error: updateError } = await (supabase as SupabaseWithRPC)
    .rpc('increment_coupon_usage', {
      p_coupon_id: couponId,
    })

  if (updateError) {
    console.error('Error incrementing coupon usage:', updateError)
  }
}

// ==================== Admin Coupon Functions ====================

export async function getAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch coupons: ${error.message}`)
  }

  return (data || []).map(mapCoupon)
}

export async function getCouponStats(couponId: number): Promise<CouponStats> {
  const { data, error } = await supabase
    .from('coupon_usages')
    .select('discount_amount, user_id')
    .eq('coupon_id', couponId)

  if (error) {
    console.error('Error fetching coupon stats:', error)
    return {
      totalUsage: 0,
      totalDiscountGiven: 0,
      uniqueUsers: 0,
      conversionRate: 0,
    }
  }

  const usages = data || []
  const uniqueUsers = new Set(usages.map(u => (u as Record<string, unknown>).user_id as string)).size
  const totalDiscount = usages.reduce((sum, u) => sum + ((u as Record<string, unknown>).discount_amount as number || 0), 0)

  return {
    totalUsage: usages.length,
    totalDiscountGiven: totalDiscount,
    uniqueUsers,
    conversionRate: 0, // Would need total views to calculate
  }
}

export async function createCoupon(coupon: CouponFormData): Promise<Coupon> {
  const { data: user } = await supabase.auth.getUser()

  const insertData: Record<string, unknown> = {
    code: coupon.code.toUpperCase().trim(),
    name: coupon.name,
    description: coupon.description || null,
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    min_order_amount: coupon.minOrderAmount || 0,
    max_discount: coupon.maxDiscount ?? null,
    usage_limit: coupon.usageLimit ?? null,
    per_user_limit: coupon.perUserLimit || 1,
    applicable_items: coupon.applicableItems || null,
    excluded_items: coupon.excludedItems || null,
    starts_at: coupon.startsAt,
    expires_at: coupon.expiresAt || null,
    is_active: coupon.isActive ?? true,
    created_by: user.user?.id,
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    if (error.message.includes('unique constraint')) {
      throw new Error('รหัสคูปองนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น')
    }
    throw new Error(`Failed to create coupon: ${error.message}`)
  }

  return mapCoupon(data)
}

export async function updateCoupon(
  id: number, 
  updates: Partial<CouponFormData>
): Promise<Coupon> {
  const updateData: Record<string, unknown> = {}

  if (updates.code !== undefined) updateData.code = updates.code.toUpperCase().trim()
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description || null
  if (updates.discountType !== undefined) updateData.discount_type = updates.discountType
  if (updates.discountValue !== undefined) updateData.discount_value = updates.discountValue
  if (updates.minOrderAmount !== undefined) updateData.min_order_amount = updates.minOrderAmount || 0
  if (updates.maxDiscount !== undefined) updateData.max_discount = updates.maxDiscount ?? null
  if (updates.usageLimit !== undefined) updateData.usage_limit = updates.usageLimit ?? null
  if (updates.perUserLimit !== undefined) updateData.per_user_limit = updates.perUserLimit || 1
  if (updates.applicableItems !== undefined) updateData.applicable_items = updates.applicableItems || null
  if (updates.excludedItems !== undefined) updateData.excluded_items = updates.excludedItems || null
  if (updates.startsAt !== undefined) updateData.starts_at = updates.startsAt
  if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt || null
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('coupons')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update coupon: ${error.message}`)
  }

  return mapCoupon(data)
}

export async function deactivateCoupon(id: number): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    } as never)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to deactivate coupon: ${error.message}`)
  }
}

export async function deleteCoupon(id: number): Promise<void> {
  // Check if coupon has been used
  const { count, error: countError } = await supabase
    .from('coupon_usages')
    .select('*', { count: 'exact', head: true })
    .eq('coupon_id', id)

  if (countError) {
    throw new Error(`Failed to check coupon usage: ${countError.message}`)
  }

  if (count && count > 0) {
    // Deactivate instead of delete if coupon has been used
    await deactivateCoupon(id)
    return
  }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete coupon: ${error.message}`)
  }
}

// ==================== Helper Functions ====================

function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: row.id as number,
    code: (row.code as string) || '',
    name: (row.name as string) || '',
    description: row.description as string | null,
    discountType: (row.discount_type as Coupon['discountType']) || 'fixed',
    discountValue: (row.discount_value as number) || 0,
    minOrderAmount: (row.min_order_amount as number) || 0,
    maxDiscount: row.max_discount as number | null,
    usageLimit: row.usage_limit as number | null,
    usageCount: (row.usage_count as number) || 0,
    perUserLimit: (row.per_user_limit as number) || 1,
    applicableItems: row.applicable_items as number[] | null,
    excludedItems: row.excluded_items as number[] | null,
    startsAt: (row.starts_at as string) || new Date().toISOString(),
    expiresAt: row.expires_at as string | null,
    isActive: (row.is_active as boolean) ?? true,
    createdBy: row.created_by as string | null,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  }
}

function mapCouponUsage(row: Record<string, unknown>): CouponUsage {
  return {
    id: row.id as number,
    couponId: row.coupon_id as number,
    userId: row.user_id as string | null,
    orderId: row.order_id as number | null,
    discountAmount: (row.discount_amount as number) || 0,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    coupon: row.coupon ? mapCoupon(row.coupon as Record<string, unknown>) : undefined,
  }
}

// ==================== Discount Calculation ====================

export function calculateDiscount(
  coupon: Coupon,
  orderTotal: number
): number {
  if (!coupon.isActive) return 0
  if (coupon.minOrderAmount > orderTotal) return 0

  let discount = 0

  switch (coupon.discountType) {
    case 'fixed':
      discount = coupon.discountValue
      break
    case 'percentage':
      discount = (orderTotal * coupon.discountValue) / 100
      if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscount)
      }
      break
    case 'free_delivery':
      // Free delivery typically means a fixed discount for delivery fee
      discount = coupon.discountValue || 0
      break
  }

  // Ensure discount doesn't exceed order total
  return Math.min(discount, orderTotal)
}

export function isCouponValid(coupon: Coupon): boolean {
  if (!coupon.isActive) return false

  const now = new Date()
  const startsAt = new Date(coupon.startsAt)
  
  if (startsAt > now) return false

  if (coupon.expiresAt) {
    const expiresAt = new Date(coupon.expiresAt)
    if (expiresAt < now) return false
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
    if (coupon.usageCount >= coupon.usageLimit) return false
  }

  return true
}

export function formatCouponCode(code: string): string {
  return code.toUpperCase().trim().replace(/\s/g, '')
}
