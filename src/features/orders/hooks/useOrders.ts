import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryKeys } from '@/lib/queryClient'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'

function mapOrder(order: any): Order {
  return {
    id: order.id,
    userId: order.user_id,
    lineUserId: order.line_user_id,
    customerName: order.customer_name,
    phoneNumber: order.phone_number,
    address: order.address,
    deliveryMethod: order.delivery_method,
    specialInstructions: order.special_instructions,
    items: order.items,
    status: order.status,
    totalPrice: order.total_price,
    subtotalPrice: order.subtotal_price,
    discountAmount: order.discount_amount,
    discountCode: order.discount_code,
    pointsRedeemed: order.points_redeemed,
    pointsEarned: order.points_earned,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    estimatedReadyTime: order.estimated_ready_time,
  }
}

// ============================================
// STRATEGY: ใช้ Supabase อย่างเดียว ไม่ใช้ LocalStorage
// ============================================

// Fetch orders by user_id (authenticated users)
async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase error fetching orders by user_id:', error)
      return []
    }

    return data as unknown as Order ? data.map(mapOrder) : []
  } catch (err) {
    console.error('Error fetching orders by user_id:', err)
    return []
  }
}

// Fetch orders by line_user_id (for LINE users)
async function fetchOrdersByLineId(lineUserId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('line_user_id', lineUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase error fetching orders by line_user_id:', error)
      return []
    }

    return data ? data.map(mapOrder) : []
  } catch (err) {
    console.error('Error fetching orders by line_user_id:', err)
    return []
  }
}

// Fetch orders by guest_id (for guests who haven't linked LINE)
async function fetchOrdersByGuestId(guestId: string): Promise<Order[]> {
  if (!guestId) return []

  // Ensure guestId is a valid UUID before querying to prevent 400 Bad Request (invalid input syntax for type uuid)
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guestId)
  if (!isValidUUID) {
    console.warn('⚠️ Invalid guestId format (expected UUID), skipping fetch:', guestId)
    return []
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase error fetching orders by guest_id:', error)
      return []
    }

    return data ? data.map(mapOrder) : []
  } catch (err) {
    console.error('Error fetching orders by guest_id:', err)
    return []
  }
}

// Fetch orders by phone number (for guest users - legacy)
// ใช้ RPC function เพื่อความปลอดภัย (ไม่เปิดเผยข้อมูลคนอื่น)
async function fetchOrdersByPhone(phoneNumber: string): Promise<Order[]> {
  if (!phoneNumber || phoneNumber.length < 9) return []

  try {
    // ใช้ RPC function ที่สร้างไว้ใน Supabase
    const { data, error } = await (supabase.rpc as any)('get_orders_by_phone', {
      phone_input: phoneNumber
    })

    if (error) {
      console.warn('Supabase error fetching orders by phone:', error)
      return []
    }

    return data ? (data as any[]).map(mapOrder) : []
  } catch (err) {
    console.error('Error fetching orders by phone:', err)
    return []
  }
}

// Fetch single order by ID - ใช้สำหรับ order detail
// อันนี้ใช้ได้ทุกคน เพราะต้องรู้ ID ก่อนถึงจะดูได้
export async function fetchOrderById(id: number): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null

    return data ? mapOrder(data) : null
  } catch (err) {
    return null
  }
}

// ============================================
// Main fetch function - combines strategies
// ============================================
export async function fetchOrders(
  userId?: string,
  lineUserId?: string,
  phoneNumber?: string,
  guestId?: string
): Promise<Order[]> {
  const allOrders: Order[] = []
  const seenIds = new Set<number>()

  // Strategy 1: Fetch by user_id (authenticated users)
  if (userId) {
    const orders = await fetchOrdersByUserId(userId)
    orders.forEach(order => {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id)
        allOrders.push(order)
      }
    })
  }

  // Strategy 2: Fetch by line_user_id (LINE users)
  if (lineUserId) {
    const orders = await fetchOrdersByLineId(lineUserId)
    orders.forEach(order => {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id)
        allOrders.push(order)
      }
    })
  }

  // Strategy 3: Fetch by phone number (guest users)
  if (phoneNumber && phoneNumber.length >= 9) {
    const orders = await fetchOrdersByPhone(phoneNumber)
    orders.forEach(order => {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id)
        allOrders.push(order)
      }
    })
  }

  // Strategy 4: Fetch by guest_id (from local storage)
  if (guestId) {
    const orders = await fetchOrdersByGuestId(guestId)
    orders.forEach(order => {
      if (!seenIds.has(order.id)) {
        seenIds.add(order.id)
        allOrders.push(order)
      }
    })
  }

  // Sort by created_at desc
  return allOrders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order as never)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapOrder(data)
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq('id', orderId)

  if (error) {
    throw new Error(error.message)
  }
}

// Hook for fetching orders
export function useOrders(userId?: string, lineUserId?: string, phoneNumber?: string, guestId?: string) {
  return useQuery({
    queryKey: queryKeys.orders.byUser(userId || lineUserId || phoneNumber || guestId || 'guest'),
    queryFn: () => fetchOrders(userId, lineUserId, phoneNumber, guestId),
    enabled: !!(userId || lineUserId || guestId || (phoneNumber && phoneNumber.length >= 9)),
    staleTime: 10 * 1000, // 10 seconds
    refetchOnWindowFocus: true,
  })
}

export function useOrderDetail(orderId: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => fetchOrderById(orderId),
    enabled: orderId > 0,
  })
}

export function useOrderRealtime(orderId: number) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!orderId) return

    const subscription = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new) {
            queryClient.setQueryData(
              queryKeys.orders.detail(orderId),
              mapOrder(payload.new)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId, queryClient])
}

export function useAllOrdersRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabase
      .channel('orders:all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
          queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
}
