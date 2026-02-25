import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import type { PointLog } from '@/types'
import * as pointsApi from '../api/pointsApi'

// ==================== Queries ====================

export function useUserPoints(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user.points(userId || ''),
    queryFn: () => pointsApi.fetchUserPoints(userId!),
    enabled: !!userId,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

export function usePointLogs(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.user.points(userId || ''), 'logs'],
    queryFn: () => pointsApi.fetchPointLogs(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== Mutations ====================

export function useAddPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      amount,
      action,
      note,
      orderId,
    }: {
      userId: string
      amount: number
      action?: PointLog['action']
      note?: string
      orderId?: number
    }) => pointsApi.addPoints(userId, amount, action, note, orderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.points(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.user.points(variables.userId), 'logs'],
      })
    },
  })
}

export function useRedeemPoints() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      amount,
      orderId,
    }: {
      userId: string
      amount: number
      orderId?: number
    }) => pointsApi.redeemPoints(userId, amount, orderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.points(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.user.points(variables.userId), 'logs'],
      })
    },
  })
}

// ==================== Utilities ====================

export function usePointsCalculator() {
  return {
    calculateEarned: pointsApi.calculatePointsEarned,
    calculateDiscount: pointsApi.calculateDiscountFromPoints,
    getTier: pointsApi.getUserTier,
    getNextTier: pointsApi.getNextTier,
    tiers: pointsApi.POINT_TIERS,
  }
}
