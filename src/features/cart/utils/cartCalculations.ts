import type { CartItem, SelectedOption } from '@/types'

export function calculateItemSubtotal(
  price: number,
  quantity: number,
  options: SelectedOption[]
): number {
  const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0)
  return (price + optionsTotal) * quantity
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}

export function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function calculatePointsEarned(total: number): number {
  return Math.floor(total / 10)
}

export function calculateDiscount(pointsUsed: number): number {
  return pointsUsed / 10
}
