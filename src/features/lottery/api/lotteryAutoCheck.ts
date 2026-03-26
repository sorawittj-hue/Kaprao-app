// ============================================
// Lottery Auto-Check API
// ============================================

import { supabase } from '@/lib/supabase'

export interface LotteryResult {
  drawDate: string
  last2Digits: string
  last3Digits: string[]
  first3Digits: string[]
  firstPrize: string
}

export interface WinningTicket {
  ticketId: number
  number: string
  prize: string
  amount: number
  claimed: boolean
}

/**
 * Fetch lottery results from external API
 * Using a free Thai lottery API
 */
export async function fetchLotteryResults(drawDate?: string): Promise<LotteryResult | null> {
  try {
    // Use Thai government lottery API
    const date = drawDate || getLatestDrawDate()
    const response = await fetch(`https://lottery.kapook.com/api/getLotteryResults?date=${date}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch lottery results')
    }

    const data = await response.json()
    
    return {
      drawDate: data.date,
      last2Digits: data.last_two_digits,
      last3Digits: data.last_three_digits || [],
      first3Digits: data.first_three_digits || [],
      firstPrize: data.first_prize,
    }
  } catch (error) {
    console.error('Error fetching lottery results:', error)
    return null
  }
}

/**
 * Check if a ticket is a winner
 */
export function checkTicket(number: string, result: LotteryResult): { isWinner: boolean; prize: string; amount: number } | null {
  const paddedNumber = number.padStart(6, '0')
  const last2 = paddedNumber.slice(-2)
  const last3 = paddedNumber.slice(-3)
  const first3 = paddedNumber.slice(0, 3)

  // Check first prize (6 digits match)
  if (paddedNumber === result.firstPrize) {
    return { isWinner: true, prize: 'รางวัลที่ 1', amount: 100000 }
  }

  // Check last 2 digits
  if (last2 === result.last2Digits) {
    return { isWinner: true, prize: 'รางวัลเลขท้าย 2 ตัว', amount: 2000 }
  }

  // Check last 3 digits
  if (result.last3Digits.includes(last3)) {
    return { isWinner: true, prize: 'รางวัลเลขท้าย 3 ตัว', amount: 4000 }
  }

  // Check first 3 digits
  if (result.first3Digits.includes(first3)) {
    return { isWinner: true, prize: 'รางวัลเลขหน้า 3 ตัว', amount: 4000 }
  }

  return null
}

/**
 * Auto-check all active tickets for a user
 */
export async function autoCheckUserTickets(userId: string): Promise<WinningTicket[]> {
  try {
    // Get all active tickets
    const { data: tickets, error } = await supabase
      .from('lotto_tickets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error || !tickets) {
      console.error('Error fetching tickets:', error)
      return []
    }

    const winningTickets: WinningTicket[] = []

    // Get latest lottery result
    const result = await fetchLotteryResults()
    if (!result) {
      console.warn('No lottery results available')
      return []
    }

    // Check each ticket
    for (const ticket of tickets) {
      const checkResult = checkTicket(ticket.number, result)
      
      if (checkResult?.isWinner) {
        // Update ticket status
        await supabase
          .from('lotto_tickets')
          .update({
            status: 'won',
            prize_type: checkResult.prize,
            prize_amount: checkResult.amount,
          })
          .eq('id', ticket.id)

        winningTickets.push({
          ticketId: ticket.id,
          number: ticket.number,
          prize: checkResult.prize,
          amount: checkResult.amount,
          claimed: false,
        })
      }
    }

    return winningTickets
  } catch (error) {
    console.error('Error auto-checking tickets:', error)
    return []
  }
}

/**
 * Get the latest draw date (1st or 16th of current month)
 */
export function getLatestDrawDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  // If today is before 1st, use previous month's 16th
  if (now.getDate() < 1) {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}-16`
  }
  
  // If today is before 16th, use this month's 1st
  if (now.getDate() < 16) {
    return `${year}-${String(month).padStart(2, '0')}-01`
  }
  
  // Otherwise, use this month's 16th
  return `${year}-${String(month).padStart(2, '0')}-16`
}

/**
 * Get next draw date
 */
export function getNextDrawDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  // If today is before 1st, next draw is this month's 1st
  if (now.getDate() < 1) {
    return `${year}-${String(month).padStart(2, '0')}-01`
  }
  
  // If today is before 16th, next draw is this month's 16th
  if (now.getDate() < 16) {
    return `${year}-${String(month).padStart(2, '0')}-16`
  }
  
  // Otherwise, next draw is next month's 1st
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
}

/**
 * Save lottery results to database
 */
export async function saveLotteryResults(result: LotteryResult): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('lotto_results')
      .upsert({
        draw_date: result.drawDate,
        last2: result.last2Digits,
        first3: result.first3Digits,
        last3: result.last3Digits,
        first_prize: result.firstPrize,
      })

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error saving lottery results:', error)
    return false
  }
}

/**
 * Schedule auto-check for lottery results
 * Should be called on page load for logged-in users
 */
export async function scheduleLotteryAutoCheck(userId: string): Promise<void> {
  try {
    const nextDrawDate = getNextDrawDate()
    const now = new Date()
    const drawDate = new Date(nextDrawDate)
    
    // Calculate time until next draw (at 12:00 PM)
    drawDate.setHours(12, 0, 0, 0)
    const timeUntilDraw = drawDate.getTime() - now.getTime()
    
    // If it's after the draw date, check immediately
    if (timeUntilDraw < 0) {
      console.log('🎰 Running immediate lottery check...')
      await autoCheckUserTickets(userId)
    } else {
      // Schedule check for after the draw
      console.log('🎰 Scheduled lottery check for:', drawDate)
      setTimeout(async () => {
        await autoCheckUserTickets(userId)
      }, timeUntilDraw)
    }
  } catch (error) {
    console.error('Error scheduling lottery check:', error)
  }
}
