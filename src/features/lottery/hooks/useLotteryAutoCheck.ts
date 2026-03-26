import { useEffect, useCallback, useState } from 'react'
import { useAuthStore } from '@/store'
import {
  autoCheckUserTickets,
  scheduleLotteryAutoCheck,
  fetchLotteryResults,
  checkTicket,
  type LotteryResult,
  type WinningTicket,
} from '../api/lotteryAutoCheck'
import { useUIStore } from '@/store'

export function useLotteryAutoCheck() {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheckDate, setLastCheckDate] = useState<string | null>(null)

  const runAutoCheck = useCallback(async () => {
    if (!user?.id || isChecking) return

    setIsChecking(true)
    try {
      const winningTickets = await autoCheckUserTickets(user.id)
      
      if (winningTickets.length > 0) {
        const totalAmount = winningTickets.reduce((sum: number, t: WinningTicket) => sum + t.amount, 0)
        
        addToast({
          type: 'success',
          title: '🎉 ยินดีด้วย! คุณถูกรางวัล',
          message: `คุณถูกรางวัล ${winningTickets.length} ใบ รวม ${totalAmount.toLocaleString()} บาท`,
          duration: 8000,
        })

        // Show celebration confetti
        import('canvas-confetti').then(confetti => {
          confetti.default({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FF6B00', '#22C55E', '#FFD700'],
          })
        })
      }
      
      setLastCheckDate(new Date().toISOString())
    } catch (error) {
      console.error('Lottery auto-check error:', error)
    } finally {
      setIsChecking(false)
    }
  }, [user?.id, isChecking, addToast])

  // Auto-check on mount for logged-in users
  useEffect(() => {
    if (user?.id) {
      console.log('🎰 Setting up lottery auto-check for user:', user.id)
      scheduleLotteryAutoCheck(user.id)
      
      // Also run immediate check on page load
      runAutoCheck()
    }
  }, [user?.id, runAutoCheck])


  return {
    isChecking,
    lastCheckDate,
    runAutoCheck,
  }
}

export function useLotteryResults() {
  const [result, setResult] = useState<LotteryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = useCallback(async (drawDate?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchLotteryResults(drawDate)
      if (data) {
        setResult(data)
      } else {
        setError('ไม่สามารถดึงผลหวยได้')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkMyTicket = useCallback((number: string) => {
    if (!result) return null
    return checkTicket(number, result)
  }, [result])

  return {
    result,
    isLoading,
    error,
    fetchResults,
    checkMyTicket,
  }
}

export function useWinningTickets() {
  const [winningTickets, setWinningTickets] = useState<WinningTicket[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const checkWinningTickets = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const tickets = await autoCheckUserTickets(userId)
      setWinningTickets(tickets)
    } catch (error) {
      console.error('Error checking winning tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    winningTickets,
    isLoading,
    checkWinningTickets,
  }
}
