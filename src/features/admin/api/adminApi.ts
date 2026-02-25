import { supabase } from '@/lib/supabase'
import type { 
  Order, OrderStatus, MenuItem, CustomerWithStats, AdminStats, 
  TopSellingItem, RecentActivity 
} from '@/types'

// ==================== Dashboard & Analytics ====================

export async function fetchAdminStats(_period: 'today' | 'week' | 'month' = 'today'): Promise<AdminStats> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const startOfDay = `${today}T00:00:00`
  const endOfDay = `${today}T23:59:59`
  
  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayStart = `${yesterdayStr}T00:00:00`
  const yesterdayEnd = `${yesterdayStr}T23:59:59`
  
  // Week ago
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString()
  
  // Month ago
  const monthAgo = new Date(now)
  monthAgo.setDate(monthAgo.getDate() - 30)
  const monthAgoStr = monthAgo.toISOString()

  // Fetch today's orders
  const { data: todayOrders, error: todayError } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  if (todayError) {
    console.error('Error fetching today orders:', todayError)
  }

  // Fetch yesterday's orders for comparison
  const { data: yesterdayOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', yesterdayStart)
    .lte('created_at', yesterdayEnd)

  // Fetch week's orders
  const { data: weekOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', weekAgoStr)

  // Fetch month's orders
  const { data: monthOrders } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', monthAgoStr)

  // Calculate stats
  const pendingOrders = todayOrders?.filter((o) => ['placed', 'pending'].includes((o as Record<string, unknown>).status as string)).length || 0
  const cookingOrders = todayOrders?.filter((o) => ['preparing', 'confirmed'].includes((o as Record<string, unknown>).status as string)).length || 0
  const readyOrders = todayOrders?.filter((o) => (o as Record<string, unknown>).status === 'ready').length || 0
  const completedOrders = todayOrders?.filter((o) => (o as Record<string, unknown>).status === 'delivered').length || 0
  const cancelledOrders = todayOrders?.filter((o) => (o as Record<string, unknown>).status === 'cancelled').length || 0
  
  const todayRevenue = todayOrders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
  const yesterdayRevenue = yesterdayOrders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
  const weekRevenue = weekOrders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
  const monthRevenue = monthOrders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0

  // Get customer stats
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // New customers today
  const { count: newCustomersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay)

  // Get menu stats
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')

  const totalMenuItems = menuItems?.length || 0
  const availableItems = menuItems?.filter((m) => (m as Record<string, unknown>).is_available !== false).length || 0
  const outOfStockItems = totalMenuItems - availableItems

  // Calculate averages
  const totalOrdersToday = todayOrders?.length || 0
  const averageOrderValue = totalOrdersToday > 0 ? todayRevenue / totalOrdersToday : 0

  return {
    pendingOrders,
    cookingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    todayRevenue,
    yesterdayRevenue,
    weekRevenue,
    monthRevenue,
    totalCustomers: totalCustomers || 0,
    newCustomersToday: newCustomersToday || 0,
    activeCustomers: totalCustomers || 0,
    totalMenuItems,
    availableItems,
    outOfStockItems,
    averageOrderValue,
    totalOrdersToday,
    averagePreparationTime: 15, // Default value
  }
}

export async function fetchSalesChartData(period: 'today' | 'week' | 'month' = 'today'): Promise<{ label: string; value: number }[]> {
  const now = new Date()
  const data: { label: string; value: number }[] = []

  if (period === 'today') {
    // Hourly data for today
    for (let i = 0; i < 24; i += 2) {
      const hourStart = `${now.toISOString().split('T')[0]}T${String(i).padStart(2, '0')}:00:00`
      const hourEnd = `${now.toISOString().split('T')[0]}T${String(i + 1).padStart(2, '0')}:59:59`
      
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', hourStart)
        .lte('created_at', hourEnd)

      const revenue = orders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
      data.push({ label: `${i}:00`, value: revenue })
    }
  } else if (period === 'week') {
    // Daily data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`)

      const revenue = orders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
      data.push({ 
        label: date.toLocaleDateString('th-TH', { weekday: 'short' }), 
        value: revenue 
      })
    }
  } else {
    // Weekly data for last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6))
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() - (i * 7))
      
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())

      const revenue = orders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
      data.push({ label: `สัปดาห์ ${4-i}`, value: revenue })
    }
  }

  return data
}

export async function fetchTopSellingItems(limit: number = 5): Promise<TopSellingItem[]> {
  // Get order items from recent orders
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .eq('status', 'delivered')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(200)

  if (!orders) return []

  // Aggregate item sales
  const itemSales: Record<number, { name: string; category: string; count: number; revenue: number; imageUrl?: string }> = {}

  orders.forEach((order) => {
    const items = (order as Record<string, unknown>).items as Array<{ menuItemId: number; name: string; quantity: number; subtotal: number }>
    items?.forEach((item) => {
      if (!itemSales[item.menuItemId]) {
        itemSales[item.menuItemId] = {
          name: item.name,
          category: 'other',
          count: 0,
          revenue: 0,
        }
      }
      itemSales[item.menuItemId].count += item.quantity
      itemSales[item.menuItemId].revenue += item.subtotal
    })
  })

  // Get menu item details
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, category, image_url')
    .in('id', Object.keys(itemSales).map(Number))

  // Merge data
  menuItems?.forEach((item) => {
    const id = (item as Record<string, unknown>).id as number
    if (itemSales[id]) {
      itemSales[id].category = (item as Record<string, unknown>).category as string
      itemSales[id].imageUrl = (item as Record<string, unknown>).image_url as string
    }
  })

  return Object.entries(itemSales)
    .map(([id, data]) => ({
      id: Number(id),
      name: data.name,
      category: data.category,
      totalSold: data.count,
      revenue: data.revenue,
      imageUrl: data.imageUrl,
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit)
}

export async function fetchRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = []

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  recentOrders?.forEach((order) => {
    const o = order as Record<string, unknown>
    activities.push({
      id: `order-${o.id}`,
      type: 'order',
      title: `ออเดอร์ใหม่ #${o.id}`,
      description: `${o.customer_name} - ${formatPrice((o.total_price as number) || 0)}`,
      timestamp: o.created_at as string,
      metadata: { orderId: o.id, status: o.status },
    })
  })

  // Sort by timestamp and return
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

// ==================== Order Management ====================

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString()
    } as never)
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`)
  }
}

export async function cancelOrder(orderId: number, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
      notes: reason
    } as never)
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to cancel order: ${error.message}`)
  }
}

export async function deleteOrder(orderId: number): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to delete order: ${error.message}`)
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return (data || []).map(mapOrder)
}

export async function fetchOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch orders by status: ${error.message}`)
  }

  return (data || []).map(mapOrder)
}

export async function fetchOrderById(orderId: number): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  return data ? mapOrder(data as Record<string, unknown>) : null
}

// ==================== Menu Management ====================

export async function createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl,
      is_available: item.isAvailable ?? true,
      is_recommended: item.isRecommended ?? false,
      requires_meat: item.requiresMeat ?? true,
    } as never)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create menu item: ${error.message}`)
  }

  return mapMenuItem(data)
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
  const updateData: Record<string, unknown> = {}

  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
  if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable
  if (updates.isRecommended !== undefined) updateData.is_recommended = updates.isRecommended
  if (updates.requiresMeat !== undefined) updateData.requires_meat = updates.requiresMeat

  const { data, error } = await supabase
    .from('menu_items')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update menu item: ${error.message}`)
  }

  return mapMenuItem(data)
}

export async function deleteMenuItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete menu item: ${error.message}`)
  }
}

export async function toggleMenuItemAvailability(id: number, isAvailable: boolean): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable } as never)
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to toggle availability: ${error.message}`)
  }
}

// ==================== Customer Management ====================

export async function fetchCustomers(): Promise<CustomerWithStats[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('total_orders', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  // Calculate total spent for each customer
  const customers = await Promise.all((data || []).map(async (profile) => {
    const p = profile as Record<string, unknown>
    
    // Get total spent from orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price')
      .eq('user_id', p.id as string)
      .eq('status', 'delivered')
    
    const totalSpent = orders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0
    
    return {
      id: p.id as string,
      displayName: (p.display_name as string) || 'Anonymous',
      pictureUrl: p.picture_url as string | undefined,
      phoneNumber: p.phone_number as string | undefined,
      email: p.email as string | undefined,
      points: (p.points as number) || 0,
      totalOrders: (p.total_orders as number) || 0,
      totalSpent,
      tier: (p.tier as 'MEMBER' | 'SILVER' | 'GOLD' | 'VIP') || 'MEMBER',
      tierProgress: Math.min(100, ((p.total_orders as number) || 0) * 10),
      lastOrderAt: p.updated_at as string | undefined,
      joinedAt: (p.created_at as string) || new Date().toISOString(),
      isActive: true,
      notes: p.notes as string | undefined,
    }
  }))

  return customers
}

export async function fetchCustomerById(customerId: string): Promise<CustomerWithStats | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', customerId)
    .single()

  if (error || !data) return null

  const p = data as Record<string, unknown>
  
  // Get total spent
  const { data: orders } = await supabase
    .from('orders')
    .select('total_price')
    .eq('user_id', p.id as string)
    .eq('status', 'delivered')
  
  const totalSpent = orders?.reduce((sum, o) => sum + ((o as Record<string, unknown>).total_price as number || 0), 0) || 0

  return {
    id: p.id as string,
    displayName: (p.display_name as string) || 'Anonymous',
    pictureUrl: p.picture_url as string | undefined,
    phoneNumber: p.phone_number as string | undefined,
    email: p.email as string | undefined,
    points: (p.points as number) || 0,
    totalOrders: (p.total_orders as number) || 0,
    totalSpent,
    tier: (p.tier as 'MEMBER' | 'SILVER' | 'GOLD' | 'VIP') || 'MEMBER',
    tierProgress: Math.min(100, ((p.total_orders as number) || 0) * 10),
    lastOrderAt: p.updated_at as string | undefined,
    joinedAt: (p.created_at as string) || new Date().toISOString(),
    isActive: true,
    notes: p.notes as string | undefined,
  }
}

export async function updateCustomerPoints(customerId: string, points: number, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ points } as never)
    .eq('id', customerId)

  if (error) {
    throw new Error(`Failed to update customer points: ${error.message}`)
  }

  // Log the points change
  await supabase.from('point_logs').insert({
    user_id: customerId,
    action: reason?.includes('adjust') ? 'ADJUST' : 'BONUS',
    amount: points,
    note: reason,
    created_at: new Date().toISOString(),
  } as never)
}

export async function updateCustomerNotes(customerId: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ notes } as never)
    .eq('id', customerId)

  if (error) {
    throw new Error(`Failed to update customer notes: ${error.message}`)
  }
}

// ==================== Helper Functions ====================

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    userId: row.user_id as string | undefined,
    lineUserId: row.line_user_id as string | undefined,
    customerName: (row.customer_name as string) || '',
    phoneNumber: (row.phone_number as string) || '',
    address: (row.address as string) || undefined,
    deliveryMethod: (row.delivery_method as 'workplace' | 'village') || 'workplace',
    specialInstructions: (row.special_instructions as string) || undefined,
    items: (row.items as Order['items']) || [],
    status: row.status as Order['status'],
    totalPrice: (row.total_price as number) || 0,
    subtotalPrice: (row.subtotal_price as number) || 0,
    discountAmount: (row.discount_amount as number) || 0,
    discountCode: row.discount_code as string | undefined,
    pointsRedeemed: (row.points_redeemed as number) || 0,
    pointsEarned: (row.points_earned as number) || 0,
    paymentMethod: row.payment_method as Order['paymentMethod'],
    paymentStatus: row.payment_status as Order['paymentStatus'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    estimatedReadyTime: row.estimated_ready_time as string | undefined,
  }
}

function mapMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    id: (row as Record<string, unknown>).id as number,
    name: ((row as Record<string, unknown>).name as string) || '',
    description: (row as Record<string, unknown>).description as string | undefined,
    price: ((row as Record<string, unknown>).price as number) || 0,
    category: (((row as Record<string, unknown>).category as string) || 'others') as import('@/types').CategoryType,
    imageUrl: (row as Record<string, unknown>).image_url as string | undefined,
    isAvailable: (row as Record<string, unknown>).is_available as boolean ?? true,
    isRecommended: (row as Record<string, unknown>).is_recommended as boolean ?? false,
    requiresMeat: (row as Record<string, unknown>).requires_meat as boolean ?? true,
    spiceLevels: (row as Record<string, unknown>).spice_levels as number[] | undefined,
    options: (row as Record<string, unknown>).options as MenuItem['options'],
    createdAt: (row as Record<string, unknown>).created_at as string | undefined,
  }
}

function formatPrice(price: number): string {
  return `฿${price.toLocaleString('th-TH')}`
}
