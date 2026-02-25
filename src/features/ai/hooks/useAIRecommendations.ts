import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@/utils/logger'
import type { MenuItem, Order, User } from '@/types'

// ============================================
// AI Model Types
// ============================================
export interface RecommendationScore {
  item: MenuItem
  score: number
  reasons: string[]
  confidence: number
}

// ============================================
// Recommendation Engine (Mock)
// ============================================
class RecommendationEngine {
  async initialize(): Promise<void> {
    // No initialization needed
  }

  // Get recommendations (Mock)
  async getRecommendations(
    _user: User,
    _orders: Order[],
    menuItems: MenuItem[],
    topK: number = 3
  ): Promise<RecommendationScore[]> {
    return this.getFallbackRecommendations(menuItems, topK)
  }

  private getFallbackRecommendations(menuItems: MenuItem[], topK: number): RecommendationScore[] {
    const recommended = menuItems.filter(m => m.isRecommended)
    const pool = recommended.length >= topK ? recommended : menuItems
    const shuffled = pool.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, topK).map(item => ({
      item,
      score: 0.8,
      reasons: ['เมนูแนะนำขายดีประจำร้าน'],
      confidence: 0.8
    }))
  }
}

export const recommendationEngine = new RecommendationEngine()

export function useAIRecommendations(
  user: User | null,
  orders: Order[],
  menuItems: MenuItem[]
) {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const engineRef = useRef(recommendationEngine)

  useEffect(() => {
    if (!user || menuItems.length === 0) return

    const fetchRecommendations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        await engineRef.current.initialize()
        const results = await engineRef.current.getRecommendations(
          user,
          orders,
          menuItems
        )
        setRecommendations(results)
      } catch (err) {
        setError('Failed to get recommendations')
        logger.error('Recommendation error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [user, orders, menuItems])

  const refresh = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const results = await engineRef.current.getRecommendations(
        user,
        orders,
        menuItems
      )
      setRecommendations(results)
    } finally {
      setIsLoading(false)
    }
  }, [user, orders, menuItems])

  return {
    recommendations,
    isLoading,
    error,
    refresh,
  }
}
