import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import * as cancelApi from '../api/cancelApi'
import type { Order } from '@/types'

export function useCanCancelOrder(order: Order) {
  return useQuery({
    queryKey: queryKeys.orders.canCancel(order.id),
    queryFn: () => cancelApi.canCancelOrder(order),
    refetchInterval: 10000, // Refetch every 10 seconds to update timer
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason?: string }) =>
      cancelApi.cancelOrder(orderId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useCancellationTimer(order: Order) {
  return useQuery({
    queryKey: [...queryKeys.orders.canCancel(order.id), 'timer'],
    queryFn: () => cancelApi.getCancellationTimeRemaining(order),
    refetchInterval: 1000, // Update every second
    enabled: order.status === 'placed',
  })
}
