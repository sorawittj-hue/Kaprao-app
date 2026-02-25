import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import type { CouponFormData } from '../types/coupon.types'
import * as couponApi from '../api/couponApi'

// ==================== Public Hooks ====================

export function useValidateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      code,
      orderTotal,
      menuItemIds,
    }: {
      code: string
      orderTotal: number
      menuItemIds: number[]
    }) => couponApi.validateCoupon(code, orderTotal, menuItemIds),
    onSuccess: () => {
      // Invalidate available coupons to refresh usage counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.available(),
      })
    },
  })
}

export function useAvailableCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons.available(),
    queryFn: couponApi.getAvailableCoupons,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCouponHistory(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.coupons.history(userId || ''),
    queryFn: couponApi.getUserCouponHistory,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useApplyCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      couponId,
      orderId,
      discountAmount,
    }: {
      couponId: number
      orderId: number
      discountAmount: number
    }) => couponApi.applyCouponToOrder(couponId, orderId, discountAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.available(),
      })
      // Invalidate user's order history
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all(),
      })
    },
  })
}

// ==================== Admin Hooks ====================

export function useAllCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons.list(),
    queryFn: couponApi.getAllCoupons,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCouponStats(couponId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.coupons.stats(couponId || 0),
    queryFn: () => couponApi.getCouponStats(couponId!),
    enabled: !!couponId,
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (coupon: CouponFormData) => couponApi.createCoupon(coupon),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.list(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.available(),
      })
    },
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number
      updates: Partial<CouponFormData>
    }) => couponApi.updateCoupon(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.list(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.detail(variables.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.available(),
      })
    },
  })
}

export function useDeactivateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: couponApi.deactivateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.list(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.available(),
      })
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: couponApi.deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.list(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupons.available(),
      })
    },
  })
}

// ==================== Utility Hooks ====================

export function useDiscountCalculator() {
  return {
    calculateDiscount: couponApi.calculateDiscount,
    isCouponValid: couponApi.isCouponValid,
    formatCouponCode: couponApi.formatCouponCode,
  }
}

export function useBestCoupon(orderTotal: number, menuItemIds: number[]) {
  const { data: availableCoupons } = useAvailableCoupons()
  const { calculateDiscount } = useDiscountCalculator()

  const bestCoupon = availableCoupons
    ?.filter(coupon => {
      // Check minimum order amount
      if (coupon.minOrderAmount > orderTotal) return false
      
      // Check if coupon applies to any items in cart
      if (coupon.applicableItems && coupon.applicableItems.length > 0) {
        const hasApplicableItem = menuItemIds.some(id => 
          coupon.applicableItems?.includes(id)
        )
        if (!hasApplicableItem) return false
      }
      
      // Check excluded items
      if (coupon.excludedItems && coupon.excludedItems.length > 0) {
        const hasExcludedItem = menuItemIds.some(id => 
          coupon.excludedItems?.includes(id)
        )
        if (hasExcludedItem) return false
      }
      
      return true
    })
    .map(coupon => ({
      coupon,
      discount: calculateDiscount(coupon, orderTotal),
    }))
    .sort((a, b) => b.discount - a.discount)[0]

  return bestCoupon
}
