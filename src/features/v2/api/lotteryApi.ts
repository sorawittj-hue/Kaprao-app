// ============================================
// Lottery 2.0 API
// ============================================

import { supabase } from '@/lib/supabase'
import { isValidUUID } from '@/utils/validation'
import type {
  LottoTicketV2,
  LottoResultV2,
  LottoPrizeType
} from '@/types/v2'

// =====================================================
// TICKET FETCHING
// =====================================================

export async function fetchUserTickets(userId: string): Promise<LottoTicketV2[]> {
  if (!isValidUUID(userId)) return []
  const { data, error } = await supabase
    .from('lotto_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }

  return (data || []).map(mapTicketFromDB)
}

export async function fetchGuestTickets(guestId: string): Promise<LottoTicketV2[]> {
  if (!isValidUUID(guestId)) return []
  const { data, error } = await supabase
    .from('lotto_tickets')
    .select('*')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching guest tickets:', error)
    return []
  }

  return (data || []).map(mapTicketFromDB)
}

export async function fetchTicketById(ticketId: number): Promise<LottoTicketV2 | null> {
  const { data, error } = await supabase
    .from('lotto_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (error || !data) {
    console.error('Error fetching ticket:', error)
    return null
  }

  return mapTicketFromDB(data)
}

// =====================================================
// TICKET PURCHASE
// =====================================================

export interface PurchaseTicketParams {
  userId?: string
  guestId?: string
  number: string
  drawDate: string
  price: number
}

export interface PurchaseTicketResult {
  success: boolean
  ticketId?: number
  pointsSpent?: number
  newBalance?: number
  error?: string
}

export async function purchaseTicket(
  params: PurchaseTicketParams
): Promise<PurchaseTicketResult> {
  // Must have either userId or guestId
  if (!params.userId && !params.guestId) {
    return {
      success: false,
      error: 'User ID or Guest ID is required',
    }
  }

  // Use empty string for null values (RPC expects strings)
  const userIdParam = params.userId || ''
  const guestIdParam = params.guestId || ''

  const { data, error } = await supabase
    .rpc('purchase_lotto_ticket', {
      p_user_id: userIdParam,
      p_guest_id: guestIdParam,
      p_number: params.number,
      p_draw_date: params.drawDate,
      p_price: params.price,
    })

  if (error) {
    console.error('Purchase ticket error:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: data.success,
    ticketId: data.ticket_id,
    pointsSpent: data.points_spent,
    newBalance: data.new_balance,
  }
}

// =====================================================
// TICKET GENERATION FOR ORDERS
// =====================================================

export interface GenerateOrderTicketsParams {
  userId?: string
  guestId?: string
  orderId: number
  orderAmount: number
}

export interface GenerateOrderTicketsResult {
  success: boolean
  ticketsGenerated: number
  ticketIds: number[]
  error?: string
}

/**
 * Generate lottery tickets for an order (free tickets based on order amount)
 * Works for both members and guests
 */
export async function generateOrderTickets(
  params: GenerateOrderTicketsParams
): Promise<GenerateOrderTicketsResult> {
  const { userId, guestId, orderId, orderAmount } = params

  // Calculate tickets: 1 ticket per 100 baht
  const ticketsToGenerate = Math.floor(orderAmount / 100)

  if (ticketsToGenerate === 0) {
    return { success: true, ticketsGenerated: 0, ticketIds: [] }
  }

  // Must have either userId or guestId
  if (!userId && !guestId) {
    return {
      success: false,
      ticketsGenerated: 0,
      ticketIds: [],
      error: 'User ID or Guest ID is required',
    }
  }

  const drawDate = getNextDrawDate().toISOString()

  // Generate ticket numbers based on order ID (deterministic)
  const tickets: Record<string, unknown>[] = []
  for (let i = 0; i < ticketsToGenerate; i++) {
    const ticketNumber = String(orderId).padStart(6, '0').slice(0, 4) +
      String(i).padStart(2, '0')
    tickets.push({
      order_id: orderId,
      user_id: userId || null,
      guest_id: guestId || null,
      number: ticketNumber,
      number_type: 'auto',
      source: 'order_free',
      purchase_price: 0,
      draw_date: drawDate,
      status: 'active',
    })
  }

  const { data, error } = await supabase
    .from('lotto_tickets')
    .insert(tickets as never[])
    .select('id')

  if (error) {
    console.error('Error generating order tickets:', error)
    return {
      success: false,
      ticketsGenerated: 0,
      ticketIds: [],
      error: error.message,
    }
  }

  const ticketIds = (data || []).map((row) => row.id as number)

  console.log(`🎫 Generated ${ticketIds.length} tickets for order #${orderId}`,
    userId ? `user: ${userId}` : `guest: ${guestId}`)

  return {
    success: true,
    ticketsGenerated: ticketIds.length,
    ticketIds,
  }
}

export function generateRandomNumber(length: number = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0')
}

export function generateLuckyNumber(): string {
  // Generate based on current time + random
  const time = Date.now().toString().slice(-4)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
  return time + random
}

export function validateNumber(number: string, length: number): boolean {
  if (!number || number.length !== length) return false
  if (!/^\d+$/.test(number)) return false
  return true
}

// =====================================================
// DRAW DATE
// =====================================================

export function getNextDrawDate(): Date {
  const now = new Date()
  const day = now.getDate()

  let targetDate: Date

  if (day >= 16) {
    // Next draw is 1st of next month
    targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  } else {
    // Next draw is 16th of this month
    targetDate = new Date(now.getFullYear(), now.getMonth(), 16)
  }

  // Set to 4 PM (draw time)
  targetDate.setHours(16, 0, 0, 0)

  return targetDate
}

export function getCountdownToDraw(): { days: number; hours: number; minutes: number } {
  const now = new Date()
  const drawDate = getNextDrawDate()

  const diff = drawDate.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
}

// =====================================================
// RESULTS
// =====================================================

export async function fetchLatestResult(): Promise<LottoResultV2 | null> {
  // Try to fetch from Thai lottery API first
  try {
    const response = await fetch('https://lotto.api.rayriffy.com/latest')
    const json = await response.json()

    if (json.status === 'success') {
      const resp = json.response

      return {
        drawDate: new Date().toISOString(),
        firstPrize: resp.prizes.find((p: { id: string }) => p.id === 'prizeFirst')?.number[0] || '',
        last2Digits: resp.runningNumbers.find((n: { id: string }) => n.id === 'runningNumberBackTwo')?.number[0] || '',
        last3Digits: resp.runningNumbers.find((n: { id: string }) => n.id === 'runningNumberBackThree')?.number || [],
        first3Digits: resp.runningNumbers.find((n: { id: string }) => n.id === 'runningNumberFrontThree')?.number || [],
        source: 'api',
        verified: true,
        createdAt: new Date().toISOString(),
      }
    }
  } catch (e) {
    console.warn('Failed to fetch from API, falling back to Supabase:', e)
  }

  // Fallback to Supabase
  const { data, error } = await supabase
    .from('lotto_results')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    console.error('Error fetching latest result:', error)
    return null
  }

  return {
    drawDate: data.draw_date,
    firstPrize: data.first_prize || '',
    last2Digits: data.last2 || '',
    last3Digits: data.last3_digits || [],
    first3Digits: data.first3 || [],
    source: data.source as 'manual' | 'api',
    verified: data.verified || false,
    createdAt: data.created_at,
  }
}

export async function fetchAllResults(): Promise<LottoResultV2[]> {
  const { data, error } = await supabase
    .from('lotto_results')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(10)

  if (error || !data) {
    console.error('Error fetching results:', error)
    return []
  }

  return data.map((row: Record<string, unknown>) => ({
    drawDate: row.draw_date as string,
    firstPrize: row.first_prize as string || '',
    last2Digits: row.last2 as string,
    last3Digits: (row.last3_digits as string[]) || [],
    first3Digits: (row.first3 as string[]) || [],
    source: row.source as 'manual' | 'api',
    verified: row.verified as boolean,
    createdAt: row.created_at as string,
  }))
}

// =====================================================
// WIN CHECKING
// =====================================================

// Local type for internal checking (will be converted to WinCheckResult)
interface CheckResult {
  isWin: boolean
  prizeType?: LottoPrizeType
  prizeAmount: number
  matched: string[]
}

// Check if a ticket is a winner
// กติกา: ถูกรางวัล = กินฟรี 1 มื้อเท่านั้น! ไม่มีเงินรางวัล
export function checkTicketWin(
  ticketNumber: string,
  result: LottoResultV2
): CheckResult {
  const matched: string[] = []

  // Check 6-digit match (first prize)
  const firstPrizeMatch = ticketNumber === result.firstPrize && result.firstPrize
  if (firstPrizeMatch) matched.push('first_prize')

  // Check last 2 digits
  const last2Match = ticketNumber.slice(-2) === result.last2Digits
  if (last2Match) matched.push('last2')

  // Check last 3 digits
  const last3Match = result.last3Digits.some(d =>
    ticketNumber.slice(-3) === d
  )
  if (last3Match) matched.push('last3')

  // Check first 3 digits
  const first3Match = result.first3Digits.some(d =>
    ticketNumber.slice(0, 3) === d
  )
  if (first3Match) matched.push('first3')

  // ถูกรางวัลใดก็ตาม = กินฟรีทั้งหมด! ไม่มีเงินรางวัล
  const isWin = firstPrizeMatch || last2Match || last3Match || first3Match

  if (isWin) {
    return {
      isWin: true,
      prizeType: 'free_meal',
      prizeAmount: 0,
      matched,
    }
  }

  return { isWin: false, prizeAmount: 0, matched: [] }
}

// =====================================================
// PRIZE CLAIMING
// =====================================================

export async function claimPrize(ticketId: number): Promise<boolean> {
  const { error } = await supabase
    .from('lotto_tickets')
    .update({
      prize_claimed: true,
      prize_claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)

  if (error) {
    console.error('Claim prize error:', error)
    return false
  }

  return true
}

// =====================================================
// STATS
// =====================================================

export interface LotteryStats {
  totalTickets: number
  activeTickets: number
  wonTickets: number
  totalWinnings: number
  unclaimedPrizes: number
}

export async function fetchUserLotteryStats(userId: string): Promise<LotteryStats> {
  if (!isValidUUID(userId)) {
    return {
      totalTickets: 0,
      activeTickets: 0,
      wonTickets: 0,
      totalWinnings: 0,
      unclaimedPrizes: 0,
    }
  }
  const { data, error } = await supabase
    .from('lotto_tickets')
    .select('*')
    .eq('user_id', userId)

  if (error || !data) {
    console.error('Fetch stats error:', error)
    return {
      totalTickets: 0,
      activeTickets: 0,
      wonTickets: 0,
      totalWinnings: 0,
      unclaimedPrizes: 0,
    }
  }

  const tickets = data.map(mapTicketFromDB)

  return {
    totalTickets: tickets.length,
    activeTickets: tickets.filter(t => t.status === 'active').length,
    wonTickets: tickets.filter(t => t.status === 'won').length,
    totalWinnings: tickets.reduce((sum, t) => sum + (t.prize?.amount || 0), 0),
    unclaimedPrizes: tickets.filter(t =>
      t.status === 'won' && t.prize && !t.prize.claimed
    ).length,
  }
}

// =====================================================
// HELPERS
// =====================================================

function mapTicketFromDB(row: Record<string, unknown>): LottoTicketV2 {
  return {
    id: row.id as number,
    orderId: row.order_id as number | undefined,
    userId: row.user_id as string | undefined,
    guestId: row.guest_id as string | undefined,
    number: row.number as string,
    numberType: row.number_type as 'auto' | 'manual' | 'vip',
    source: row.source as 'order_free' | 'points_purchase' | 'bonus' | 'streak' | 'vip_monthly',
    purchasePrice: row.purchase_price as number,
    drawDate: row.draw_date as string,
    status: row.status as 'active' | 'won' | 'expired',
    prize: row.prize_type ? {
      type: row.prize_type as LottoPrizeType,
      amount: row.prize_amount as number,
      claimed: row.prize_claimed as boolean,
      claimedAt: row.prize_claimed_at as string | undefined,
    } : undefined,
    notificationSent: row.notification_sent as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
