// ============================================
// Unified Order Hooks v2.0
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
// Types are used implicitly through function returns
import { useAuthStore } from '@/store'
import {
  getOrCreateGuestIdentity,
  clearGuestIdentity,
  createUnifiedOrder,
  getOrderById,
  getOrdersByGuestId,
  getQueueStatus,
  syncGuestToMember,
  type CreateOrderParams,
} from '../api/unifiedOrderApi'

// =====================================================
// GUEST IDENTITY HOOK
// =====================================================

export function useGuestIdentity() {
  const getIdentity = useCallback(() => {
    return getOrCreateGuestIdentity()
  }, [])

  const clearIdentity = useCallback(() => {
    clearGuestIdentity()
  }, [])

  return {
    getIdentity,
    clearIdentity,
  }
}

// =====================================================
// ORDER CREATION
// =====================================================

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { getIdentity } = useGuestIdentity()

  return useMutation({
    mutationFn: async (params: Omit<CreateOrderParams, 'guestId' | 'userId' | 'lineUserId'>) => {
      // Determine identity
      let guestId: string | undefined
      let userId: string | undefined
      let lineUserId: string | undefined

      if (user?.id) {
        userId = user.id
        lineUserId = user.lineUserId
      } else {
        const guest = getIdentity()
        guestId = guest.id
      }

      return createUnifiedOrder({
        ...params,
        guestId,
        userId,
        lineUserId,
      })
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: ['orders', data.userId] })
      }
      if (data.guestId) {
        queryClient.invalidateQueries({ queryKey: ['orders', 'guest', data.guestId] })
      }
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
    },
  })
}

// =====================================================
// ORDER QUERIES
// =====================================================

export function useOrder(orderId: number | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
  })
}

export function useGuestOrders(guestId: string | null) {
  return useQuery({
    queryKey: ['orders', 'guest', guestId],
    queryFn: () => getOrdersByGuestId(guestId!),
    enabled: !!guestId,
  })
}

// =====================================================
// QUEUE STATUS
// =====================================================

export function useQueueStatus(orderId: number | null, refetchInterval: number = 30000) {
  return useQuery({
    queryKey: ['queue', orderId],
    queryFn: () => getQueueStatus(orderId!),
    enabled: !!orderId,
    refetchInterval,
  })
}

// =====================================================
// GUEST SYNC
// =====================================================

export function useSyncGuestToMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ guestId, userId }: { guestId: string; userId: string }) => {
      return syncGuestToMember(guestId, userId)
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Clear guest identity
        clearGuestIdentity()
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['orders', 'guest', variables.guestId] })
        queryClient.invalidateQueries({ queryKey: ['orders', variables.userId] })
        queryClient.invalidateQueries({ queryKey: ['user', variables.userId] })
        queryClient.invalidateQueries({ queryKey: ['lottery', 'tickets', variables.userId] })
      }
    },
  })
}

// =====================================================
// UNIFIED AUTH HOOK
// =====================================================

export interface UnifiedUser {
  type: 'guest' | 'member'
  id: string
  displayName: string
  pictureUrl?: string
  points?: number
  totalOrders?: number
  tier?: string
}

export function useUnifiedUser(): UnifiedUser {
  const { user, isAuthenticated } = useAuthStore()
  const { getIdentity } = useGuestIdentity()

  if (isAuthenticated && user) {
    return {
      type: 'member',
      id: user.id,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
      points: user.points,
      totalOrders: user.totalOrders,
      tier: user.tier,
    }
  }

  const guest = getIdentity()
  return {
    type: 'guest',
    id: guest.id,
    displayName: guest.displayName,
  }
}
