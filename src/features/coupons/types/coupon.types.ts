// ============================================
// Coupon Types - Type Definitions for Coupon System
// ============================================

export type DiscountType = 'fixed' | 'percentage' | 'free_delivery'

export interface Coupon {
  id: number
  code: string
  name: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  perUserLimit: number
  applicableItems: number[] | null
  excludedItems: number[] | null
  startsAt: string
  expiresAt: string | null
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CouponUsage {
  id: number
  couponId: number
  userId: string | null
  orderId: number | null
  discountAmount: number
  createdAt: string
  coupon?: Coupon
}

export interface ValidationResult {
  valid: boolean
  couponId?: number
  discount?: number
  name?: string
  message?: string
}

export interface CouponWithUsage extends Coupon {
  userUsageCount?: number
  isApplicable?: boolean
}

export interface CouponStats {
  totalUsage: number
  totalDiscountGiven: number
  uniqueUsers: number
  conversionRate: number
}

export interface CouponFormData {
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number | null
  usageLimit?: number | null
  perUserLimit?: number
  applicableItems?: number[]
  excludedItems?: number[]
  startsAt: string
  expiresAt?: string | null
  isActive?: boolean
}
