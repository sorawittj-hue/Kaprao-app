// ============================================
// Admin Types - Complete Type Definitions
// ============================================

import type { Order, OrderStatus, MenuItem, User } from './index'

// ==================== Dashboard Types ====================

export interface AdminStats {
  // Order Stats
  pendingOrders: number
  cookingOrders: number
  readyOrders: number
  completedOrders: number
  cancelledOrders: number
  
  // Revenue Stats
  todayRevenue: number
  yesterdayRevenue: number
  weekRevenue: number
  monthRevenue: number
  
  // Customer Stats
  totalCustomers: number
  newCustomersToday: number
  activeCustomers: number
  
  // Menu Stats
  totalMenuItems: number
  availableItems: number
  outOfStockItems: number
  
  // Performance
  averageOrderValue: number
  totalOrdersToday: number
  averagePreparationTime: number
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

// ==================== Order Management Types ====================

export interface OrderFilter {
  status: OrderStatus | 'all'
  dateFrom?: string
  dateTo?: string
  searchQuery: string
  sortBy: 'date' | 'total' | 'status'
  sortOrder: 'asc' | 'desc'
}

export interface OrderWithDetails extends Order {
  customerProfile?: User
  preparationTime?: number
  itemCount: number
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  statusBreakdown: Record<OrderStatus, number>
}

// ==================== Menu Management Types ====================

export interface MenuCategory {
  id: string
  name: string
  nameEn: string
  description?: string
  icon: string
  color: string
  gradient: string
  sortOrder: number
  isActive: boolean
  itemCount?: number
}

export interface MenuItemWithStats extends MenuItem {
  orderCount: number
  revenue: number
  lastOrderedAt?: string
  isPopular: boolean
}

export interface MenuItemFormData {
  name: string
  description?: string
  price: number
  category: string
  imageUrl?: string
  imageFile?: File
  isAvailable: boolean
  isRecommended: boolean
  requiresMeat: boolean
  spiceLevels: number[]
  options: MenuOptionFormData[]
}

export interface MenuOptionFormData {
  id?: string
  name: string
  price: number
  category: 'meat' | 'egg' | 'spicy' | 'extra'
}

// ==================== Customer Management Types ====================

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
  favoriteItems?: number[]
  addresses?: CustomerAddress[]
}

export interface CustomerAddress {
  id: string
  label: string
  address: string
  isDefault: boolean
}

export interface CustomerOrderHistory {
  orderId: number
  orderDate: string
  total: number
  items: string[]
  status: OrderStatus
}

export interface CustomerFilters {
  tier: string | 'all'
  searchQuery: string
  sortBy: 'orders' | 'spent' | 'points' | 'recent'
  dateRange?: { from: string; to: string }
}

// ==================== Reports & Analytics Types ====================

export type ReportPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'custom'

export interface SalesReport {
  period: ReportPeriod
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalItemsSold: number
  topSellingItems: TopSellingItem[]
  hourlyBreakdown: { hour: number; orders: number; revenue: number }[]
  categoryBreakdown: { category: string; revenue: number; count: number }[]
}

export interface CustomerReport {
  period: ReportPeriod
  newCustomers: number
  returningCustomers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  topCustomers: CustomerWithStats[]
}

// ==================== Settings Types ====================

export interface ShopSettings {
  shopName: string
  phoneNumber: string
  address: string
  openingHours: {
    day: string
    open: string
    close: string
    isClosed: boolean
  }[]
  deliverySettings: {
    villageDeliveryFee: number
    workplaceDeliveryFee: number
    minimumOrder: number
    freeDeliveryThreshold: number
  }
  notificationSettings: {
    emailNotifications: boolean
    lineNotifications: boolean
    soundAlerts: boolean
    autoPrintReceipt: boolean
  }
}

// ==================== Notification Types ====================

export interface AdminNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  createdAt: string
  isRead: boolean
  actionUrl?: string
  actionLabel?: string
}

// ==================== Export/Import Types ====================

export interface ExportData {
  type: 'orders' | 'customers' | 'menu' | 'full'
  format: 'csv' | 'excel' | 'json'
  dateRange?: { from: string; to: string }
  filters?: Record<string, unknown>
}

// ==================== Real-time Types ====================

export interface RealtimeOrderUpdate {
  orderId: number
  status: OrderStatus
  timestamp: string
  updatedBy?: string
}

export interface KitchenDisplayOrder {
  orderId: number
  customerName: string
  items: {
    name: string
    quantity: number
    options: string[]
    note?: string
  }[]
  status: OrderStatus
  createdAt: string
  estimatedReadyTime?: string
  priority: 'normal' | 'high' | 'rush'
}
