import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import * as inventoryApi from '../api/inventoryApi'

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory.list(),
    queryFn: inventoryApi.getInventoryItems,
  })
}

export function useLowStockItems() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: inventoryApi.getLowStockItems,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useUpdateStock() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({
      inventoryId, quantity, type, reason
    }: {
      inventoryId: number
      quantity: number
      type: 'in' | 'out' | 'adjust'
      reason?: string
    }) => inventoryApi.updateStock(inventoryId, quantity, type, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() })
    },
  })
}
