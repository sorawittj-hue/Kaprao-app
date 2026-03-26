// ============================================
// Unified Order API v2.0
// ============================================

import { supabase } from '@/lib/supabase'
import { isValidUUID } from '@/utils/validation'
import type {
  UnifiedOrder,
  QueueStatus,
  GuestIdentity,
  GuestSyncResult
} from '@/types/v2'

// =====================================================
// GUEST IDENTITY
// =====================================================

export function generateGuestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getOrCreateGuestIdentity(): GuestIdentity {
  const stored = localStorage.getItem('kaprao_guest_identity')

  if (stored) {
    try {
      const identity = JSON.parse(stored) as GuestIdentity

      // If legacy guest id (contains underscore or is not UUID format), regenerate
      if (!identity.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identity.id)) {
        identity.id = generateGuestId()
      }

      // Update last active
      identity.lastActiveAt = new Date().toISOString()
      localStorage.setItem('kaprao_guest_identity', JSON.stringify(identity))
      return identity
    } catch {
      // JSON parse error, fallback to create new
    }
  }

  // Create new guest identity
  const newIdentity: GuestIdentity = {
    id: generateGuestId(),
    displayName: `Guest_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  }

  localStorage.setItem('kaprao_guest_identity', JSON.stringify(newIdentity))
  return newIdentity
}

export function clearGuestIdentity(): void {
  localStorage.removeItem('kaprao_guest_identity')
}

// =====================================================
// QUEUE SYSTEM
// =====================================================

export async function generateQueueNumber(
  deliveryMethod: 'workplace' | 'village',
  isPreorder: boolean = false
): Promise<{ type: string; number: number; display: string }> {
  const { data, error } = await supabase
    .rpc('generate_queue_number', {
      p_delivery_method: deliveryMethod,
      p_is_preorder: isPreorder,
    })

  if (error || !data) {
    console.error('Generate queue error:', error)
    // Fallback
    return {
      type: deliveryMethod === 'workplace' ? 'A' : 'B',
      number: 1,
      display: deliveryMethod === 'workplace' ? 'A001' : 'B001',
    }
  }

  return {
    type: data[0].out_queue_type,
    number: data[0].out_queue_number,
    display: data[0].out_queue_display,
  }
}

export async function getQueueStatus(orderId: number): Promise<QueueStatus | null> {
  const { data, error } = await supabase
    .rpc('get_queue_status', {
      p_order_id: orderId,
    })

  if (error || !data) {
    console.error('Get queue status error:', error)
    return null
  }

  return {
    queueDisplay: data.queue_display,
    queueType: data.queue_type as 'A' | 'B' | 'C' | 'D',
    ordersAhead: data.orders_ahead,
    estimatedMinutes: data.estimated_minutes,
    status: data.status as QueueStatus['status'],
  }
}

// =====================================================
// ORDER CREATION
// =====================================================

export interface CreateOrderParams {
  guestId?: string
  userId?: string
  lineUserId?: string
  customerName: string
  phoneNumber: string
  items: any[]
  subtotalPrice: number
  discountAmount: number
  discountCode?: string
  pointsRedeemed: number
  totalPrice: number
  paymentMethod: 'cod' | 'transfer' | 'promptpay'
  deliveryMethod: 'workplace' | 'village'
  address?: string
  specialInstructions?: string
  isPreorder?: boolean
  scheduledFor?: string
}

export async function createUnifiedOrder(
  params: CreateOrderParams
): Promise<UnifiedOrder> {
  // Generate queue number
  const queue = await generateQueueNumber(
    params.deliveryMethod,
    params.isPreorder
  )

  const orderData = {
    guest_id: isValidUUID(params.guestId) ? params.guestId : null,
    user_id: isValidUUID(params.userId) ? params.userId : null,
    line_user_id: params.lineUserId || null,
    customer_name: params.customerName,
    phone_number: params.phoneNumber,
    items: (params.items || []).map(item => ({
      menu_item_id: item.menuItem?.id || item.menuItemId || 0,
      name: item.menuItem?.name || item.name || 'Unknown Item',
      price: item.menuItem?.price || item.price || 0,
      quantity: item.quantity || 1,
      options: item.selectedOptions || item.options || [],
      note: item.note || null,
      subtotal: item.subtotal || 0,
    })),
    status: params.isPreorder ? 'scheduled' : 'placed',
    subtotal_price: params.subtotalPrice,
    discount_amount: params.discountAmount,
    discount_code: params.discountCode || null,
    points_redeemed: params.pointsRedeemed,
    total_price: params.totalPrice,
    points_earned: Math.floor(params.totalPrice / 10),
    payment_method: params.paymentMethod,
    payment_status: 'pending',
    delivery_method: params.deliveryMethod,
    address: params.address || null,
    special_instructions: params.specialInstructions || null,
    queue_type: queue.type,
    queue_number: queue.number,
    queue_display: queue.display,
    is_preorder: params.isPreorder || false,
    scheduled_for: params.scheduledFor || null,
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return mapOrderFromDB(data)
}

// =====================================================
// ORDER FETCHING
// =====================================================

export async function getOrderById(orderId: number): Promise<UnifiedOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !data) {
    console.error('Get order error:', error)
    return null
  }

  return mapOrderFromDB(data)
}

export async function getOrdersByGuestId(guestId: string): Promise<UnifiedOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Get guest orders error:', error)
    return []
  }

  return data.map(mapOrderFromDB)
}

// =====================================================
// GUEST SYNC
// =====================================================

export async function syncGuestToMember(
  guestId: string,
  userId: string
): Promise<GuestSyncResult> {
  const { data, error } = await supabase
    .rpc('sync_guest_to_member', {
      p_guest_id: guestId,
      p_user_id: userId,
    })

  if (error) {
    console.error('Sync error:', error)
    return {
      success: false,
      ordersSynced: 0,
      pointsAdded: 0,
      ticketsTransferred: 0,
      error: error.message,
    }
  }

  return {
    success: data.success,
    ordersSynced: data.orders_synced,
    pointsAdded: data.points_added,
    ticketsTransferred: data.tickets_transferred,
  }
}

// =====================================================
// HELPERS
// =====================================================

function mapOrderFromDB(data: Record<string, unknown>): UnifiedOrder {
  return {
    id: data.id as number,
    guestId: data.guest_id as string | undefined,
    userId: data.user_id as string | undefined,
    lineUserId: data.line_user_id as string | undefined,
    customerName: data.customer_name as string,
    phoneNumber: data.phone_number as string,
    items: ((data.items as unknown[]) || []).map((item) => {
      const itemRecord = item as Record<string, unknown>
      const optionsArray = (itemRecord.options as unknown[]) || []
      return {
        id: (itemRecord.id as string) || `${Date.now()}_${Math.random()}`,
        menuItemId: itemRecord.menu_item_id as number,
        name: itemRecord.name as string,
        price: itemRecord.price as number,
        quantity: itemRecord.quantity as number,
        options: optionsArray.map((opt) => {
          const optRecord = opt as Record<string, unknown>
          return {
            optionId: optRecord.option_id as string,
            name: optRecord.name as string,
            price: optRecord.price as number,
          }
        }),
        note: itemRecord.note as string | undefined,
        subtotal: itemRecord.subtotal as number,
      }
    }),
    subtotalPrice: data.subtotal_price as number,
    discountAmount: data.discount_amount as number,
    discountCode: data.discount_code as string | undefined,
    pointsRedeemed: data.points_redeemed as number,
    totalPrice: data.total_price as number,
    status: data.status as UnifiedOrder['status'],
    queue: data.queue_type ? {
      type: data.queue_type as 'A' | 'B' | 'C' | 'D',
      number: data.queue_number as number,
      display: data.queue_display as string,
      estimatedMinutes: data.estimated_minutes as number || 15,
    } : undefined,
    isPreorder: data.is_preorder as boolean,
    scheduledFor: data.scheduled_for as string | undefined,
    paymentMethod: data.payment_method as UnifiedOrder['paymentMethod'],
    paymentStatus: data.payment_status as UnifiedOrder['paymentStatus'],
    paymentSlipUrl: data.payment_slip_url as string | undefined,
    deliveryMethod: data.delivery_method as UnifiedOrder['deliveryMethod'],
    address: data.address as string | undefined,
    specialInstructions: data.special_instructions as string | undefined,
    pointsEarned: data.points_earned as number,
    guestSynced: data.guest_synced as boolean,
    guestSyncedAt: data.guest_synced_at as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    estimatedReadyTime: data.estimated_ready_time as string | undefined,
  }
}
