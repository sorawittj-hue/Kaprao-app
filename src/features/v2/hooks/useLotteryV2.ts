// ============================================
// Lottery 2.0 Hooks
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useCallback } from 'react'
import type {
  LottoTicketV2,
  LottoResultV2,
  LottoTicketPrice,
  WinCheckResult,
} from '@/types/v2'
import {
  LOTTO_TICKET_PRICES,
  LOTTO_PRIZES
} from '@/types/v2'
import {
  fetchUserTickets,
  fetchGuestTickets,
  fetchLatestResult,
  fetchAllResults,
  purchaseTicket,
  checkTicketWin,
  claimPrize,
  fetchUserLotteryStats,
  generateRandomNumber,
  generateLuckyNumber,
  validateNumber,
  getNextDrawDate,
  getCountdownToDraw,
  generateOrderTickets,
  type PurchaseTicketParams,
  type PurchaseTicketResult,
  type GenerateOrderTicketsParams,

} from '../api/lotteryApi'

// =====================================================
// TICKETS
// =====================================================

export function useUserTickets(userId: string | null) {
  return useQuery({
    queryKey: ['lottery', 'tickets', userId],
    queryFn: () => fetchUserTickets(userId!),
    enabled: !!userId,
  })
}

export function useGuestTickets(guestId: string | null) {
  return useQuery({
    queryKey: ['lottery', 'tickets', 'guest', guestId],
    queryFn: () => fetchGuestTickets(guestId!),
    enabled: !!guestId,
  })
}

// Unified ticket hook (works for both guest and member)
export function useTickets(userId?: string, guestId?: string) {
  const userTickets = useUserTickets(userId || null)
  const guestTickets = useGuestTickets(guestId || null)

  if (userId) {
    return { ...userTickets, tickets: userTickets.data || [] }
  }
  if (guestId) {
    return { ...guestTickets, tickets: guestTickets.data || [] }
  }
  return { tickets: [], isLoading: false, error: null }
}

// =====================================================
// RESULTS
// =====================================================

export function useLatestResult(refetchInterval: number = 5 * 60 * 1000) {
  return useQuery({
    queryKey: ['lottery', 'results', 'latest'],
    queryFn: fetchLatestResult,
    refetchInterval,
  })
}

export function useAllResults() {
  return useQuery({
    queryKey: ['lottery', 'results'],
    queryFn: fetchAllResults,
  })
}

// =====================================================
// COUNTDOWN
// =====================================================

export function useCountdown() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })
  const [nextDrawDate, setNextDrawDate] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => {
      setCountdown(getCountdownToDraw())
      setNextDrawDate(getNextDrawDate())
    }

    update()
    const interval = setInterval(update, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return { countdown, nextDrawDate }
}

// =====================================================
// PURCHASE TICKET
// =====================================================

export function usePurchaseTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: PurchaseTicketParams) => {
      return purchaseTicket(params)
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate both user and guest ticket queries
        if (variables.userId) {
          queryClient.invalidateQueries({
            queryKey: ['lottery', 'tickets', variables.userId]
          })
        }
        if (variables.guestId) {
          queryClient.invalidateQueries({
            queryKey: ['lottery', 'tickets', 'guest', variables.guestId]
          })
        }
        if (variables.userId) {
          queryClient.invalidateQueries({
            queryKey: ['user', variables.userId]
          })
        }
      }
    },
  })
}

// =====================================================
// GENERATE ORDER TICKETS
// =====================================================

export function useGenerateOrderTickets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: GenerateOrderTicketsParams) => {
      return generateOrderTickets(params)
    },
    onSuccess: (data, variables) => {
      if (data.success && data.ticketsGenerated > 0) {
        // Invalidate ticket queries
        if (variables.userId) {
          queryClient.invalidateQueries({
            queryKey: ['lottery', 'tickets', variables.userId]
          })
        }
        if (variables.guestId) {
          queryClient.invalidateQueries({
            queryKey: ['lottery', 'tickets', 'guest', variables.guestId]
          })
        }
      }
    },
  })
}

// =====================================================
// WIN CHECKING
// =====================================================

export function useWinCheck(
  tickets: LottoTicketV2[],
  result: LottoResultV2 | null | undefined
) {
  const [winningTickets, setWinningTickets] = useState<
    { ticket: LottoTicketV2; result: WinCheckResult }[]
  >([])

  useEffect(() => {
    if (!result || !tickets.length) {
      setWinningTickets([])
      return
    }

    const winners = tickets
      .map(ticket => {
        const check = checkTicketWin(ticket.number, result)
        const winResult: WinCheckResult = {
          ticketId: ticket.id,
          number: ticket.number,
          prizeType: check.prizeType as any,
          matchedDigits: check.matched.length,
          matchedPosition: (check.matched[0] as any) || 'last2',
        }
        return { ticket, result: winResult, isWin: check.isWin }
      })
      .filter(({ isWin }) => isWin)
      .map(({ ticket, result }) => ({ ticket, result }))

    setWinningTickets(winners)
  }, [tickets, result])

  return winningTickets
}

// =====================================================
// CLAIM PRIZE
// =====================================================

export function useClaimPrize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticketId: number) => {
      return claimPrize(ticketId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lottery', 'tickets'] })
    },
  })
}

// =====================================================
// STATS
// =====================================================

export function useLotteryStats(userId: string | null) {
  return useQuery({
    queryKey: ['lottery', 'stats', userId],
    queryFn: () => fetchUserLotteryStats(userId!),
    enabled: !!userId,
  })
}

// =====================================================
// NUMBER GENERATION
// =====================================================

export function useNumberGenerator(length: number = 6) {
  const [number, setNumber] = useState<string>('')

  const generate = useCallback(() => {
    const newNumber = generateRandomNumber(length)
    setNumber(newNumber)
    return newNumber
  }, [length])

  const generateLucky = useCallback(() => {
    const newNumber = generateLuckyNumber()
    setNumber(newNumber.slice(0, length).padStart(length, '0'))
    return newNumber
  }, [length])

  const validate = useCallback((input: string) => {
    return validateNumber(input, length)
  }, [length])

  return {
    number,
    setNumber,
    generate,
    generateLucky,
    validate,
    isValid: validate(number),
  }
}

// =====================================================
// PRICES
// =====================================================

export function useTicketPrices() {
  return LOTTO_TICKET_PRICES
}

// =====================================================
// PRIZE INFO
// =====================================================

export function usePrizeInfo() {
  return LOTTO_PRIZES
}

// =====================================================
// COMBINED HOOK (main lottery hook)
// =====================================================

export interface LotteryState {
  // Tickets
  tickets: LottoTicketV2[]
  isLoading: boolean

  // Results
  latestResult: LottoResultV2 | null

  // Countdown
  countdown: { days: number; hours: number; minutes: number }
  nextDrawDate: Date | null

  // Winners
  winningTickets: { ticket: LottoTicketV2; result: WinCheckResult }[]

  // Actions
  purchase: (number: string, price: number) => Promise<PurchaseTicketResult>
  claim: (ticketId: number) => Promise<boolean>

  // Prices
  prices: LottoTicketPrice[]
  prizes: typeof LOTTO_PRIZES
}

export function useLottery(userId?: string, guestId?: string): LotteryState {
  // Fetch data
  const { tickets = [], isLoading } = useTickets(userId, guestId)
  const { data: latestResult } = useLatestResult()
  const { countdown, nextDrawDate } = useCountdown()
  const winningTickets = useWinCheck(tickets, latestResult)

  // Mutations
  const purchaseMutation = usePurchaseTicket()
  const claimMutation = useClaimPrize()

  // Prices
  const prices = useTicketPrices()
  const prizes = usePrizeInfo()

  // Actions
  const purchase = async (number: string, price: number): Promise<PurchaseTicketResult> => {
    // Allow purchase if either userId or guestId exists
    if (!userId && !guestId) {
      return { success: false, error: 'Must be logged in or have guest ID to purchase tickets' }
    }

    return purchaseMutation.mutateAsync({
      userId,
      guestId,
      number,
      drawDate: nextDrawDate?.toISOString() || getNextDrawDate().toISOString(),
      price,
    })
  }

  const claim = async (ticketId: number): Promise<boolean> => {
    return claimMutation.mutateAsync(ticketId)
  }

  return {
    tickets,
    isLoading,
    latestResult: latestResult || null,
    countdown,
    nextDrawDate,
    winningTickets,
    purchase,
    claim,
    prices,
    prizes,
  }
}
