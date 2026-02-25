import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createOrder, validateDiscountCode } from '../api/checkoutApi'
import { useCartStore, useAuthStore } from '@/store'
import type { CheckoutData } from '../api/checkoutApi'

export function useCheckout() {
  const { items, subtotal, discountAmount, pointsUsed, deliveryMethod, specialInstructions, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)

  const createOrderMutation = useMutation({
    mutationFn: ({ customerName, phoneNumber, address }: { customerName: string; phoneNumber: string; address?: string }) => {
      const checkoutData: CheckoutData = {
        userId: user?.id,
        lineUserId: user?.lineUserId,
        customerName,
        phoneNumber,
        address,
        items,
        subtotalPrice: subtotal,
        discountAmount: discountAmount + appliedDiscount,
        discountCode: discountCode || undefined,
        pointsRedeemed: pointsUsed,
        paymentMethod: 'cod',
        deliveryMethod,
        specialInstructions,
      }
      return createOrder(checkoutData)
    },
    onSuccess: () => {
      clearCart()
    },
  })

  const applyDiscountMutation = useMutation({
    mutationFn: validateDiscountCode,
    onSuccess: (result) => {
      if (result.valid) {
        setAppliedDiscount(result.discount)
      }
    },
  })

  return {
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    error: createOrderMutation.error,
    discountCode,
    setDiscountCode,
    appliedDiscount,
    applyDiscount: applyDiscountMutation.mutate,
    isValidatingDiscount: applyDiscountMutation.isPending,
  }
}
