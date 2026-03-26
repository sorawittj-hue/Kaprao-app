import { supabase } from '@/lib/supabase'
import { isValidUUID } from '@/utils/validation'
import type { LottoTicket, LottoResult } from '@/types'

// ==================== Tickets ====================

export async function fetchUserTickets(userId: string): Promise<LottoTicket[]> {
  if (!isValidUUID(userId)) return []
  const { data, error } = await supabase
    .from('lotto_pool')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }

  return (data || []).map((row: unknown) => ({
    id: (row as Record<string, unknown>).id as number,
    orderId: (row as Record<string, unknown>).order_id as number,
    userId: (row as Record<string, unknown>).user_id as string,
    number: (row as Record<string, unknown>).number as string,
    drawDate: (row as Record<string, unknown>).draw_date as string,
    createdAt: (row as Record<string, unknown>).created_at as string,
  }))
}

export async function fetchTicketsByDrawDate(drawDate: string): Promise<LottoTicket[]> {
  const { data, error } = await supabase
    .from('lotto_pool')
    .select('*')
    .eq('draw_date', drawDate)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets by draw date:', error)
    return []
  }

  return (data || []).map((row: unknown) => ({
    id: (row as Record<string, unknown>).id as number,
    orderId: (row as Record<string, unknown>).order_id as number,
    userId: (row as Record<string, unknown>).user_id as string,
    number: (row as Record<string, unknown>).number as string,
    drawDate: (row as Record<string, unknown>).draw_date as string,
    createdAt: (row as Record<string, unknown>).created_at as string,
  }))
}

// ==================== Results ====================

export async function fetchLottoResults(): Promise<LottoResult[]> {
  try {
    const { data, error } = await supabase
      .from('lotto_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(10)

    if (error) {
      console.warn('Error fetching lotto results:', error)
      return []
    }

    return (data || []).map((row: unknown) => ({
      drawDate: (row as Record<string, unknown>).draw_date as string,
      last2: (row as Record<string, unknown>).last2 as string,
      first3: ((row as Record<string, unknown>).first3 as string[]) || [],
      createdAt: (row as Record<string, unknown>).created_at as string,
    }))
  } catch (e) {
    console.warn('Error fetching lotto results:', e)
    return []
  }
}

export async function fetchLatestResult(): Promise<LottoResult | null> {
  try {
    // 1. Fetch real Thai lottery data
    const res = await fetch('https://lotto.api.rayriffy.com/latest')
    const json = await res.json()
    if (json.status === 'success') {
      const respData = json.response
      const last2 = respData.runningNumbers.find((n: any) => n.id === 'runningNumberBackTwo')?.number[0] || ''
      const first3 = respData.runningNumbers.find((n: any) => n.id === 'runningNumberFrontThree')?.number || []

      return {
        // We use the current date so it renders nicely in standard JS Date
        drawDate: new Date().toISOString(),
        last2,
        first3,
        createdAt: new Date().toISOString(),
      }
    }
  } catch (e) {
    console.warn('Error fetching real lotto results from API:', e)
  }

  // 2. Fallback to Supabase if API fails
  try {
    const { data, error } = await supabase
      .from('lotto_results')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching latest lotto result fallback:', error)
      return null
    }

    if (!data) return null

    return {
      drawDate: (data as Record<string, unknown>).draw_date as string,
      last2: (data as Record<string, unknown>).last2 as string,
      first3: ((data as Record<string, unknown>).first3 as string[]) || [],
      createdAt: (data as Record<string, unknown>).created_at as string,
    }
  } catch (e) {
    console.warn('Error fetching latest lotto result fallback:', e)
    return null
  }
}
// ==================== Ticket Generation ====================

// Generate a random 6-digit lottery number
export function generateLottoNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Calculate how many tickets user gets from an order
export function calculateTicketsFromOrder(_orderAmount: number): number {
  return 1 // Always 1 ticket per order
}

// Generate tickets for an order
export async function generateTicketsForOrder(
  userId: string,
  orderId: number,
  _orderAmount: number
): Promise<LottoTicket[]> {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format (UUID expected)')
  }
  const ticketCount = calculateTicketsFromOrder(_orderAmount)

  if (ticketCount === 0) {
    return []
  }

  const drawDate = getNextDrawDate()
  const tickets: Omit<LottoTicket, 'id' | 'createdAt'>[] = []

  for (let i = 0; i < ticketCount; i++) {
    tickets.push({
      orderId,
      userId,
      number: String(orderId).padStart(6, '0'),
      drawDate,
    })
  }

  // Insert tickets into database
  const { data, error } = await supabase
    .from('lotto_pool')
    .insert(
      tickets.map((t) => ({
        order_id: t.orderId,
        user_id: t.userId,
        number: t.number,
        draw_date: t.drawDate,
      })) as never
    )
    .select()

  if (error) {
    console.error('Error generating tickets:', error)
    throw new Error(`Failed to generate tickets: ${error.message}`)
  }

  return (data || []).map((row: unknown) => ({
    id: (row as Record<string, unknown>).id as number,
    orderId: (row as Record<string, unknown>).order_id as number,
    userId: (row as Record<string, unknown>).user_id as string,
    number: (row as Record<string, unknown>).number as string,
    drawDate: (row as Record<string, unknown>).draw_date as string,
    createdAt: (row as Record<string, unknown>).created_at as string,
  }))
}

// ==================== Utilities ====================

// Get next lottery draw date (1st and 16th of each month)
export function getNextDrawDate(): string {
  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth()
  const year = now.getFullYear()

  let targetDay: number
  let targetMonth = month
  let targetYear = year

  if (day >= 16) {
    // Next draw is 1st of next month
    targetDay = 1
    targetMonth = month + 1
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear = year + 1
    }
  } else {
    // Next draw is 16th of this month
    targetDay = 16
  }

  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`
}

// Check if a ticket is a winner
export function checkTicketWin(ticket: LottoTicket, result: LottoResult): { isWin: boolean; prize: string; amount: number } {
  const last2Match = ticket.number.slice(-2) === result.last2
  const first3Match = result.first3.includes(ticket.number.slice(0, 3))

  if (first3Match && last2Match) {
    return { isWin: true, prize: 'รางวัลที่ 1 + กินฟรี', amount: 10000 }
  }
  if (first3Match) {
    return { isWin: true, prize: 'รางวัลเลขหน้า 3 ตัว', amount: 4000 }
  }
  if (last2Match) {
    return { isWin: true, prize: 'กินข้าวฟรี 1 มื้อ!', amount: 0 }
  }

  return { isWin: false, prize: '', amount: 0 }
}

// Calculate countdown to next draw
export function getCountdownToDraw(): { days: number; hours: number; minutes: number } {
  const now = new Date()
  const drawDate = new Date(getNextDrawDate())
  drawDate.setHours(16, 0, 0, 0) // Draw at 4 PM

  const diff = drawDate.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
}
