// ============================================
// Kaprao52 v2.0 — Unified Order System Types
// ============================================

// =====================================================
// GUEST IDENTITY SYSTEM
// =====================================================

export interface GuestIdentity {
  id: string
  fingerprint?: string
  displayName: string
  metadata?: Record<string, unknown>
  createdAt: string
  lastActiveAt: string
}

export interface GuestRewards {
  guestId: string
  orders: GuestOrderReward[]
  totalPoints: number
  totalTickets: number
}

export interface GuestOrderReward {
  orderId: number
  points: number
  tickets: LottoTicketV2[]
  createdAt: string
}

// =====================================================
// UNIFIED ORDER SYSTEM
// =====================================================

export type QueueType = 'A' | 'B' | 'C' | 'D'

export interface QueueInfo {
  type: QueueType
  number: number
  display: string  // "A023"
  estimatedMinutes: number
}

export interface QueueStatus {
  queueDisplay: string
  queueType: QueueType
  ordersAhead: number
  estimatedMinutes: number
  status: OrderStatusV2
}

export type OrderStatusV2 = 
  | 'pending'
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'
  | 'scheduled'

export interface UnifiedOrder {
  id: number
  
  // Identity (มีได้แค่อย่างใดอย่างหนึ่ง)
  guestId?: string
  userId?: string
  lineUserId?: string
  
  // Customer
  customerName: string
  phoneNumber: string
  
  // Items
  items: OrderItemV2[]
  
  // Pricing
  subtotalPrice: number
  discountAmount: number
  discountCode?: string
  pointsRedeemed: number
  totalPrice: number
  
  // Status
  status: OrderStatusV2
  
  // Queue System (ใหม่)
  queue?: QueueInfo
  
  // Pre-order (ใหม่)
  isPreorder?: boolean
  scheduledFor?: string
  
  // Payment
  paymentMethod: 'cod' | 'transfer' | 'promptpay'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentSlipUrl?: string
  
  // Delivery
  deliveryMethod: 'workplace' | 'village'
  address?: string
  specialInstructions?: string
  
  // Rewards
  pointsEarned: number
  lottoTickets?: LottoTicketV2[]
  
  // Guest sync status
  guestSynced?: boolean
  guestSyncedAt?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  estimatedReadyTime?: string
}

export interface OrderItemV2 {
  id: string
  menuItemId: number
  name: string
  price: number
  quantity: number
  options: SelectedOptionV2[]
  note?: string
  subtotal: number
}

export interface SelectedOptionV2 {
  optionId: string
  name: string
  price: number
}

// =====================================================
// LOTTERY 2.0
// =====================================================

export type LottoNumberType = 'auto' | 'manual' | 'vip'
export type LottoSource = 'order_free' | 'points_purchase' | 'bonus' | 'streak' | 'vip_monthly'
export type LottoTicketStatus = 'active' | 'won' | 'expired'
export type LottoPrizeType = 'free_meal'

export interface WinCheckResult {
  ticketId: number
  number: string
  prizeType: LottoPrizeType
  matchedDigits: number
  matchedPosition: 'last2' | 'last3' | 'first3' | 'first6'
}

export interface LotteryStats {
  totalTickets: number
  activeTickets: number
  wonTickets: number
  totalWonAmount: number
  nextDrawDate: string
  daysUntilDraw: number
}

export interface LottoTicketV2 {
  id: number
  orderId?: number
  userId?: string
  guestId?: string
  
  // Number
  number: string  // 2-6 digits
  numberType: LottoNumberType
  
  // Source
  source: LottoSource
  purchasePrice: number  // points used
  
  // Draw
  drawDate: string
  
  // Status
  status: LottoTicketStatus
  
  // Prize
  prize?: {
    type: LottoPrizeType
    amount: number
    claimed: boolean
    claimedAt?: string
  }
  
  // Meta
  notificationSent: boolean
  createdAt: string
  updatedAt: string
}

export interface LottoResultV2 {
  drawDate: string
  
  // Standard Thai lottery results
  firstPrize: string  // 6 digits
  last2Digits: string  // 2 digits
  last3Digits: string[]  // array of 3 digits
  first3Digits: string[]  // array of 3 digits
  
  // Meta
  source: 'manual' | 'api'
  verified: boolean
  createdAt: string
}

export interface LottoTicketPrice {
  type: 'standard' | 'premium' | 'vip'
  points: number
  numberLength: number
  description: string
}

export const LOTTO_TICKET_PRICES: LottoTicketPrice[] = [
  { type: 'standard', points: 100, numberLength: 2, description: 'เลข 2 ตัว' },
  { type: 'premium', points: 500, numberLength: 4, description: 'เลข 4 ตัว' },
  { type: 'vip', points: 1000, numberLength: 6, description: 'เลข 6 ตัว' },
]

export const LOTTO_PRIZES: Record<LottoPrizeType, { amount: number; description: string }> = {
  free_meal: { amount: 0, description: 'กินฟรี 1 มื้อ! 🍛' },
}

// =====================================================
// CHECKOUT FLOW
// =====================================================

export interface CheckoutFormData {
  customerName: string
  phoneNumber: string
  deliveryMethod: 'workplace' | 'village'
  address?: string
  paymentMethod: 'cod' | 'transfer' | 'promptpay'
  specialInstructions?: string
  
  // Pre-order
  isPreorder?: boolean
  scheduledFor?: string
  
  // Lotto options
  lottoOptions?: {
    customizeNumber?: boolean
    customNumber?: string
    purchaseExtra?: number  // จำนวนตั๋วที่จะซื้อเพิ่ม
  }
}

export interface CheckoutSummary {
  items: OrderItemV2[]
  subtotal: number
  discountAmount: number
  pointsUsed: number
  total: number
  
  // Rewards preview
  pointsToEarn: number
  ticketsToEarn: number
  
  // Additional costs
  extraTicketCost?: number
}

// =====================================================
// SYNC
// =====================================================

export interface GuestSyncResult {
  success: boolean
  ordersSynced: number
  pointsAdded: number
  ticketsTransferred: number
  error?: string
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export type NotificationType = 
  | 'order_status'
  | 'lotto_won'
  | 'points_earned'
  | 'queue_ready'
  | 'reminder'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

// =====================================================
// STREAK BONUS
// =====================================================

export interface StreakBonus {
  days: number
  tickets: number
  points: number
}

export const STREAK_BONUSES: StreakBonus[] = [
  { days: 3, tickets: 1, points: 10 },
  { days: 7, tickets: 2, points: 50 },
  { days: 14, tickets: 3, points: 100 },
  { days: 30, tickets: 5, points: 300 },
]
