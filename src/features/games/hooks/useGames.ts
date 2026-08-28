import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types'
import { isValidUUID } from '@/utils/validation'

const WHEEL_STORAGE_KEY = 'kaprao52_wheel_spins'
const MAX_SPINS_PER_DAY = 3

export function useWheelOfFortune() {
  const { user } = useAuthStore()
  const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS_PER_DAY)
  const [lastWin, setLastWin] = useState<{ code: string; value: number } | null>(null)

  const getStorageKey = useCallback(() => {
    const today = new Date().toDateString()
    const id = user?.id || 'guest_user'
    return `${WHEEL_STORAGE_KEY}_${id}_${today}`
  }, [user?.id])

  useEffect(() => {
    const storageKey = getStorageKey()
    const spinsUsed = parseInt(localStorage.getItem(storageKey) || '0', 10)
    setSpinsLeft(Math.max(0, MAX_SPINS_PER_DAY - spinsUsed))
  }, [getStorageKey])

  const recordSpin = useCallback((code: string, value: number) => {
    const storageKey = getStorageKey()
    const spinsUsed = parseInt(localStorage.getItem(storageKey) || '0', 10)
    
    localStorage.setItem(storageKey, (spinsUsed + 1).toString())
    setSpinsLeft(Math.max(0, MAX_SPINS_PER_DAY - spinsUsed - 1))
    setLastWin({ code, value })
  }, [getStorageKey])

  const canSpin = spinsLeft > 0

  return {
    spinsLeft,
    maxSpins: MAX_SPINS_PER_DAY,
    canSpin,
    lastWin,
    recordSpin,
  }
}

// Quick reorder hook
export function useQuickReorder() {
  const { user } = useAuthStore()

  const { data: recentOrders = [], isLoading } = useQuery({
    queryKey: ['quick-reorder', user?.id],
    queryFn: async () => {
      let orders: Order[] = []

      if (user?.id && isValidUUID(user.id)) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (!error && data) {
          orders = data as unknown as Order[]
        }
      }

      // Also check local storage for recent guest / cached orders
      if (orders.length === 0) {
        try {
          const localKeys = ['kaprao_order_history', 'kaprao52_guest_orders', 'guest_orders', 'kaprao_saved_orders']
          for (const key of localKeys) {
            const saved = localStorage.getItem(key)
            if (saved) {
              const parsed = JSON.parse(saved)
              if (Array.isArray(parsed) && parsed.length > 0) {
                orders = parsed
                break
              }
            }
          }
        } catch {}
      }

      return orders
    },
    staleTime: 30000,
  })

  const getUniqueOrders = useCallback(() => {
    if (!recentOrders || recentOrders.length === 0) return []
    
    const seen = new Set<string>()
    const unique: Order[] = []
    
    for (const order of recentOrders) {
      if (!order.items || order.items.length === 0) continue
      const key = order.items.map(i => i.name).join(',')
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(order)
      }
    }
    
    return unique.slice(0, 4)
  }, [recentOrders])

  return {
    recentOrders: getUniqueOrders(),
    isLoading,
  }
}

export default useWheelOfFortune
