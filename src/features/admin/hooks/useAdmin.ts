import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { supabase } from '@/lib/supabase'
import type { OrderStatus, MenuItem } from '@/types'
import * as adminApi from '../api/adminApi'

// ==================== Dashboard Queries ====================

export function useAdminStats(period: 'today' | 'week' | 'month' = 'today') {
  return useQuery({
    queryKey: [...queryKeys.admin.stats(), period],
    queryFn: () => adminApi.fetchAdminStats(period),
    refetchInterval: 30 * 1000,
    staleTime: 10 * 1000,
  })
}

export function useSalesChartData(period: 'today' | 'week' | 'month' = 'today') {
  return useQuery({
    queryKey: [...queryKeys.admin.all(), 'chart', period],
    queryFn: () => adminApi.fetchSalesChartData(period),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopSellingItems(limit: number = 5) {
  return useQuery({
    queryKey: [...queryKeys.admin.all(), 'top-items', limit],
    queryFn: () => adminApi.fetchTopSellingItems(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: [...queryKeys.admin.all(), 'activity', limit],
    queryFn: () => adminApi.fetchRecentActivity(limit),
    refetchInterval: 10 * 1000,
    staleTime: 5 * 1000,
  })
}

// ==================== Order Queries ====================

export function useAllOrders() {
  return useQuery({
    queryKey: queryKeys.admin.orders(),
    queryFn: adminApi.fetchAllOrders,
    refetchInterval: 10 * 1000,
    staleTime: 5 * 1000,
  })
}

export function useOrdersByStatus(status: OrderStatus) {
  return useQuery({
    queryKey: [...queryKeys.admin.orders(), 'status', status],
    queryFn: () => adminApi.fetchOrdersByStatus(status),
    refetchInterval: 10 * 1000,
    staleTime: 5 * 1000,
  })
}

export function useOrderDetail(orderId: number) {
  return useQuery({
    queryKey: [...queryKeys.admin.orders(), 'detail', orderId],
    queryFn: () => adminApi.fetchOrderById(orderId),
    enabled: orderId > 0,
  })
}

// ==================== Customer Queries ====================

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.admin.customers(),
    queryFn: adminApi.fetchCustomers,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: [...queryKeys.admin.customers(), 'detail', customerId],
    queryFn: () => adminApi.fetchCustomerById(customerId),
    enabled: !!customerId,
  })
}

// ==================== Order Mutations ====================

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason?: string }) =>
      adminApi.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => adminApi.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

// ==================== Menu Mutations ====================

export function useCreateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: Partial<MenuItem>) => adminApi.createMenuItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<MenuItem> }) =>
      adminApi.updateMenuItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() })
    },
  })
}

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      adminApi.toggleMenuItemAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
    },
  })
}

// ==================== Customer Mutations ====================

export function useUpdateCustomerPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, points, reason }: { customerId: string; points: number; reason?: string }) =>
      adminApi.updateCustomerPoints(customerId, points, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.customers(), 'detail', variables.customerId] })
    },
  })
}

export function useUpdateCustomerNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, notes }: { customerId: string; notes: string }) =>
      adminApi.updateCustomerNotes(customerId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers() })
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.customers(), 'detail', variables.customerId] })
    },
  })
}

// ==================== Real-time Subscriptions ====================

export function subscribeToOrders(callback: (payload: { new: unknown; old: unknown; eventType: string }) => void) {
  return supabase
    .channel('orders:admin')
    .on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      callback as never
    )
    .subscribe()
}

export function subscribeToMenuChanges(callback: (payload: { new: unknown; old: unknown; eventType: string }) => void) {
  return supabase
    .channel('menu:admin')
    .on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table: 'menu_items',
      },
      callback as never
    )
    .subscribe()
}

export function subscribeToCustomerChanges(callback: (payload: { new: unknown; old: unknown; eventType: string }) => void) {
  return supabase
    .channel('customers:admin')
    .on(
      'postgres_changes' as never,
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
      },
      callback as never
    )
    .subscribe()
}
