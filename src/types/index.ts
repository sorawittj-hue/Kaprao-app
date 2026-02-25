// ============================================
// Core Type Definitions for Kaprao52 React App
// ============================================

// User & Auth Types
export interface User {
  id: string
  lineUserId?: string
  displayName: string
  pictureUrl?: string
  points: number
  totalOrders: number
  tier: 'MEMBER' | 'SILVER' | 'GOLD' | 'VIP'
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

// Menu Types
export type CategoryType =
  | 'favorites'
  | 'kaprao'
  | 'curry'
  | 'noodle'
  | 'bamboo'
  | 'garlic'
  | 'others'

export interface MenuItem {
  id: number
  name: string
  description?: string
  price: number
  category: CategoryType
  imageUrl?: string
  requiresMeat: boolean
  isRecommended: boolean
  isAvailable: boolean
  spiceLevels?: number[]
  options?: MenuOption[]
  createdAt?: string
}

export interface MenuOption {
  id: string
  name: string
  price: number
  category: 'meat' | 'egg' | 'spicy' | 'extra'
}

export interface MenuCategory {
  id: CategoryType
  name: string
  nameEn: string
  icon: string
  color: string
  gradient: string
}

// Cart Types
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  selectedOptions: SelectedOption[]
  note?: string
  subtotal: number
}

export interface SelectedOption {
  optionId: string
  name: string
  price: number
}

export interface CartState {
  items: CartItem[]
  couponCode: string | null
  discountAmount: number
  pointsUsed: number
  deliveryMethod: 'workplace' | 'village'
  specialInstructions?: string
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: number
  userId?: string
  lineUserId?: string
  customerName: string
  phoneNumber: string
  address?: string
  deliveryMethod: 'workplace' | 'village'
  specialInstructions?: string
  items: OrderItem[]
  status: OrderStatus
  totalPrice: number
  subtotalPrice: number
  discountAmount: number
  discountCode?: string
  pointsRedeemed: number
  pointsEarned: number
  paymentMethod: 'cod' | 'transfer' | 'promptpay'
  paymentStatus: 'pending' | 'paid' | 'failed'
  trackingToken?: string
  paymentSlipUrl?: string
  createdAt: string
  updatedAt: string
  estimatedReadyTime?: string
}

export interface OrderItem {
  id: string
  menuItemId: number
  name: string
  price: number
  quantity: number
  options: SelectedOption[]
  note?: string
  subtotal: number
}

// Points & Lottery Types
export interface PointLog {
  id: number
  userId: string
  action: 'EARN' | 'REDEEM' | 'BONUS' | 'ADJUST'
  amount: number
  orderId?: number
  note?: string
  balanceAfter: number
  createdAt: string
}

export interface LottoTicket {
  id: number
  orderId: number
  userId: string
  number: string
  drawDate: string
  createdAt: string
}

export interface LottoResult {
  drawDate: string
  last2: string
  first3: string[]
  createdAt: string
}

// UI Types
export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'cart-add'
  title: string
  message?: string
  imageUrl?: string
  duration?: number
}

export interface ModalState {
  isOpen: boolean
  type: 'login' | 'food-detail' | 'checkout' | 'order-tracking' | 'points' | 'tickets' | null
  data?: unknown
}

// Admin Types
export interface AdminStats {
  pendingOrders: number
  cookingOrders: number
  readyOrders: number
  completedOrders: number
  cancelledOrders: number
  todayRevenue: number
  yesterdayRevenue: number
  weekRevenue: number
  monthRevenue: number
  totalCustomers: number
  newCustomersToday: number
  activeCustomers: number
  totalMenuItems: number
  availableItems: number
  outOfStockItems: number
  averageOrderValue: number
  totalOrdersToday: number
  averagePreparationTime: number
  chartData?: { label: string; value: number }[]
}

export interface CustomerWithStats {
  id: string
  displayName: string
  pictureUrl?: string
  phoneNumber?: string
  email?: string
  points: number
  totalOrders: number
  totalSpent: number
  tier: 'MEMBER' | 'SILVER' | 'GOLD' | 'VIP'
  tierProgress: number
  lastOrderAt?: string
  joinedAt: string
  isActive: boolean
  notes?: string
}

export interface SalesChartData {
  labels: string[]
  data: number[]
  period: 'day' | 'week' | 'month' | 'year'
}

export interface TopSellingItem {
  id: number
  name: string
  category: string
  totalSold: number
  revenue: number
  imageUrl?: string
}

export interface RecentActivity {
  id: string
  type: 'order' | 'customer' | 'menu' | 'system'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface RealtimeChange<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T | null
}

// Animation Types
export interface AnimationVariants {
  hidden: Record<string, number | string>
  visible: Record<string, number | string>
  exit?: Record<string, number | string>
}

export interface FlyToCartParams {
  startX: number
  startY: number
  endX: number
  endY: number
  imageUrl: string
}

// Voice Order Types
export interface VoiceOrderResult {
  items: {
    menuItemId: number
    name: string
    quantity: number
    options?: SelectedOption[]
  }[]
  confidence: number
  rawText: string
}

// Group Order Types
export interface GroupSession {
  id: string
  hostId: string
  hostName: string
  participants: GroupParticipant[]
  cartItems: CartItem[]
  status: 'active' | 'ordering' | 'completed'
  expiresAt: string
  createdAt: string
}

export interface GroupParticipant {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen: string
}

// AI Recommendation Types
export interface AIRecommendation {
  menuItem: MenuItem
  reason: string
  confidence: number
  basedOn: string[]
}

// Shop Config Types
export interface ContactInfo {
  phone: string
  line_id: string
  line_oa_id: string
}

export interface ShopHours {
  open: string
  close: string
  days_open: number[]
  timezone: string
}

export interface OrderLimits {
  max_orders_per_slot: number
  slot_duration_minutes: number
  max_items_per_order: number
}

export interface PaymentConfig {
  promptpay_number: string
  promptpay_name: string
  bank_accounts: BankAccount[]
}

export interface BankAccount {
  bank_name: string
  account_number: string
  account_name: string
}

// Global Options for stock management
export interface GlobalOption {
  id: string
  name: string
  isAvailable: boolean
  updatedAt: string
}
