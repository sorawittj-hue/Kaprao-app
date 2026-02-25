import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import type { LottoTicket, LottoResult } from '@/types'
import * as lotteryApi from '../api/lotteryApi'

// ==================== Queries ====================

export function useUserTickets(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lottery.tickets(userId || ''),
    queryFn: () => lotteryApi.fetchUserTickets(userId!),
    enabled: !!userId,
    refetchInterval: 60 * 1000,
  })
}

export function useLottoResults() {
  return useQuery({
    queryKey: queryKeys.lottery.results(),
    queryFn: lotteryApi.fetchLottoResults,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLatestResult() {
  return useQuery({
    queryKey: [...queryKeys.lottery.results(), 'latest'],
    queryFn: lotteryApi.fetchLatestResult,
    refetchInterval: 60 * 1000,
  })
}

// ==================== Mutations ====================

export function useGenerateTickets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      orderId,
      orderAmount,
    }: {
      userId: string
      orderId: number
      orderAmount: number
    }) => lotteryApi.generateTicketsForOrder(userId, orderId, orderAmount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lottery.tickets(variables.userId),
      })
    },
  })
}

// ==================== Utilities ====================

export function useLottoUtils() {
  return {
    generateNumber: lotteryApi.generateLottoNumber,
    calculateTickets: lotteryApi.calculateTicketsFromOrder,
    getNextDrawDate: lotteryApi.getNextDrawDate,
    checkWin: lotteryApi.checkTicketWin,
    getCountdown: lotteryApi.getCountdownToDraw,
  }
}

// ==================== Types ====================

export type { LottoTicket, LottoResult }
