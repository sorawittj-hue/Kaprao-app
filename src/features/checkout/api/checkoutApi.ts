import { supabase } from '@/lib/supabase'
import type { Order, CartItem } from '@/types'

export interface CheckoutData {
  userId?: string
  lineUserId?: string
  customerName: string
  phoneNumber: string
  address?: string
  items: CartItem[]
  subtotalPrice: number
  discountAmount: number
  discountCode?: string
  pointsRedeemed: number
  paymentMethod: 'cod' | 'transfer' | 'promptpay'
  deliveryMethod: 'workplace' | 'village'
  specialInstructions?: string
}

export async function createOrder(checkoutData: CheckoutData): Promise<Order> {
  const totalPrice = checkoutData.subtotalPrice - checkoutData.discountAmount - (checkoutData.pointsRedeemed / 10)
  const pointsEarned = Math.floor(totalPrice / 10)

  const orderData = {
    user_id: checkoutData.userId,
    line_user_id: checkoutData.lineUserId,
    customer_name: checkoutData.customerName,
    phone_number: checkoutData.phoneNumber,
    address: checkoutData.address,
    items: checkoutData.items.map(item => ({
      menu_item_id: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      options: item.selectedOptions,
      note: item.note,
      subtotal: item.subtotal,
    })),
    status: 'placed',
    total_price: totalPrice,
    subtotal_price: checkoutData.subtotalPrice,
    discount_amount: checkoutData.discountAmount,
    discount_code: checkoutData.discountCode,
    points_redeemed: checkoutData.pointsRedeemed,
    points_earned: pointsEarned,
    delivery_method: checkoutData.deliveryMethod,
    special_instructions: checkoutData.specialInstructions,
    payment_method: checkoutData.paymentMethod,
    payment_status: 'pending',
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Map database response back to Order type
  return {
    id: data.id,
    userId: data.user_id || undefined,
    lineUserId: data.line_user_id || undefined,
    customerName: data.customer_name,
    phoneNumber: data.phone_number || '',
    address: data.address || undefined,
    deliveryMethod: data.delivery_method as Order['deliveryMethod'],
    specialInstructions: data.special_instructions || undefined,
    items: data.items as any,
    status: data.status as Order['status'],
    totalPrice: data.total_price,
    subtotalPrice: data.subtotal_price,
    discountAmount: data.discount_amount,
    discountCode: data.discount_code || undefined,
    pointsRedeemed: data.points_redeemed,
    pointsEarned: data.points_earned,
    paymentMethod: data.payment_method as Order['paymentMethod'],
    paymentStatus: data.payment_status as Order['paymentStatus'],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function validateDiscountCode(code: string): Promise<{ valid: boolean; discount: number }> {
  // Mock validation - replace with actual API call
  const validCodes: Record<string, number> = {
    'KAPRAO10': 10,
    'WELCOME20': 20,
    'VIP50': 50,
  }

  const discount = validCodes[code.toUpperCase()]

  return {
    valid: !!discount,
    discount: discount || 0,
  }
}
