import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store'

const WHEEL_STORAGE_KEY = 'kaprao52_wheel_spins'
const MAX_SPINS_PER_DAY = 3

export function useWheelOfFortune() {
  const { user } = useAuthStore()
  const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS_PER_DAY)
  const [lastWin, setLastWin] = useState<{ code: string; value: number } | null>(null)

  useEffect(() => {
    if (!user) {
      setSpinsLeft(0)
      return
    }
    const today = new Date().toDateString()
    const storageKey = `${WHEEL_STORAGE_KEY}_${user.id}_${today}`
    const spinsUsed = parseInt(localStorage.getItem(storageKey) || '0')
    setSpinsLeft(Math.max(0, MAX_SPINS_PER_DAY - spinsUsed))
  }, [user])

  const recordSpin = useCallback((code: string, value: number) => {
    if (!user) return
    
    const today = new Date().toDateString()
    const storageKey = `${WHEEL_STORAGE_KEY}_${user.id}_${today}`
    const spinsUsed = parseInt(localStorage.getItem(storageKey) || '0')
    
    localStorage.setItem(storageKey, (spinsUsed + 1).toString())
    setSpinsLeft(Math.max(0, MAX_SPINS_PER_DAY - spinsUsed - 1))
    setLastWin({ code, value })
  }, [user])

  const canSpin = spinsLeft > 0 && !!user

  return {
    spinsLeft,
    maxSpins: MAX_SPINS_PER_DAY,
    canSpin,
    lastWin,
    recordSpin,
  }
}

// Quick reorder hook
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'

export function useQuickReorder() {
  const { user } = useAuthStore()

  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ['quick-reorder', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return (data || []) as unknown as Order[]
    },
    enabled: !!user,
  })

  const getUniqueOrders = useCallback(() => {
    if (!recentOrders) return []
    
    const seen = new Set<string>()
    const unique: Order[] = []
    
    for (const order of recentOrders) {
      const key = order.items.map(i => i.name).join(',')
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(order)
      }
    }
    
    return unique.slice(0, 3)
  }, [recentOrders])

  return {
    recentOrders: getUniqueOrders(),
    isLoading,
  }
}

export default useWheelOfFortune
