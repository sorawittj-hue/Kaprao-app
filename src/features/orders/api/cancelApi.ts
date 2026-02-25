import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'

// Cancellation window in minutes
const CANCELLATION_WINDOW_MINUTES = 15

export interface CancellationResult {
  success: boolean
  message: string
  canCancel: boolean
}

export function canCancelOrder(order: Order): CancellationResult {
  // Check if already cancelled
  if (order.status === 'cancelled') {
    return {
      success: false,
      canCancel: false,
      message: 'ออเดอร์นี้ถูกยกเลิกแล้ว'
    }
  }

  // Check if already delivered or ready
  if (['delivered', 'ready'].includes(order.status)) {
    return {
      success: false,
      canCancel: false,
      message: 'ออเดอร์นี้เสร็จสิ้นแล้ว ไม่สามารถยกเลิกได้'
    }
  }

  // Check time window for 'placed' orders
  if (order.status === 'placed') {
    const orderTime = new Date(order.createdAt).getTime()
    const now = Date.now()
    const diffMinutes = (now - orderTime) / (1000 * 60)

    if (diffMinutes > CANCELLATION_WINDOW_MINUTES) {
      return {
        success: false,
        canCancel: false,
        message: `หมดเวลายกเลิกอัตโนมัติ (${CANCELLATION_WINDOW_MINUTES} นาที)`
      }
    }

    return {
      success: true,
      canCancel: true,
      message: 'สามารถยกเลิกได้'
    }
  }

  // For confirmed/preparing orders - only admin can cancel
  if (['confirmed', 'preparing'].includes(order.status)) {
    return {
      success: false,
      canCancel: false,
      message: 'ออเดอร์กำลังดำเนินการ กรุณาติดต่อร้านโดยตรง'
    }
  }

  return {
    success: true,
    canCancel: true,
    message: 'สามารถยกเลิกได้'
  }
}

export async function cancelOrder(
  orderId: number,
  reason?: string
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      notes: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to cancel order: ${error.message}`)
  }

  // Log cancellation (optional)
  await supabase.from('order_cancellations').insert({
    order_id: orderId,
    reason: reason || 'Customer cancelled',
    cancelled_at: new Date().toISOString(),
    cancelled_by: (await supabase.auth.getUser()).data.user?.id
  })
}

export function getCancellationTimeRemaining(order: Order): number {
  if (order.status !== 'placed') return 0

  const orderTime = new Date(order.createdAt).getTime()
  const deadline = orderTime + (CANCELLATION_WINDOW_MINUTES * 60 * 1000)
  const remaining = deadline - Date.now()

  return Math.max(0, remaining)
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'หมดเวลา'

  const minutes = Math.floor(ms / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return `${seconds} วินาที`
}
