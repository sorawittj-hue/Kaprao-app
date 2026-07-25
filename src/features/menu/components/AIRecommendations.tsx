import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useMenuStore, useAuthStore } from '@/store'
import { recommendationEngine } from '@/features/ai/hooks/useAIRecommendations'
import { useMenuItems } from '../hooks/useMenu'
import type { AIRecommendation } from '@/types'
import { getValidImageUrl } from '@/utils/getImageUrl'

export function AIRecommendations() {
  const { user } = useAuthStore()
  const { viewedItemIds } = useMenuStore()
  const { data: menuItems } = useMenuItems()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!user || !menuItems) return

    const loadRecommendations = async () => {
      try {
        await recommendationEngine.initialize()
        const AI_recs = await recommendationEngine.getRecommendations(user, [], menuItems, 3)
        const mappedRecs = AI_recs.map(r => ({
          menuItem: r.item,
          reason: r.reasons[0] || 'เมนูแนะนำสำหรับคุณ',
          confidence: r.confidence,
          basedOn: []
        }))
        setRecommendations(mappedRecs)
      } catch (e) {
        console.error(e)
      }
    }

    const timer = setTimeout(loadRecommendations, 1500)
    return () => clearTimeout(timer)
  }, [user, menuItems, viewedItemIds])

  if (!isVisible || recommendations.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="relative overflow-hidden rounded-[24px] p-4 text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 50%, rgba(236,72,153,0.18) 100%)',
          border: '1px solid rgba(168,85,247,0.25)',
          boxShadow: '0 8px 32px rgba(168,85,247,0.15)',
        }}
      >
        {/* Glow */}
        <div
          className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(168,85,247,0.25)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-black text-sm text-white">AI แนะนำสำหรับคุณ</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white p-1"
              aria-label="ปิดคำแนะนำ AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {recommendations.map((rec) => (
              <div
                key={rec.menuItem.id}
                className="rounded-[16px] p-2.5 text-center flex flex-col items-center justify-between"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <img
                  src={getValidImageUrl(rec.menuItem.imageUrl)}
                  alt={rec.menuItem.name}
                  className="w-12 h-12 rounded-[12px] object-cover mb-1.5 border border-white/10"
                />
                <p className="font-black text-[11px] text-white line-clamp-1 w-full">{rec.menuItem.name}</p>
                <p className="text-[9px] text-purple-300 font-medium line-clamp-1 mt-0.5">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
