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
        className="relative overflow-hidden rounded-[24px] p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(238,242,255,0.9) 0%, rgba(250,245,255,0.9) 50%, rgba(253,242,248,0.9) 100%)',
          border: '1px solid rgba(192,132,252,0.3)',
          boxShadow: '0 4px 20px rgba(168,85,247,0.08)',
        }}
      >
        {/* Glow */}
        <div
          className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(168,85,247,0.15)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-[10px] flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>AI แนะนำสำหรับคุณ</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
              aria-label="ปิดคำแนะนำ AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {recommendations.map((rec) => (
              <div
                key={rec.menuItem.id}
                className="rounded-[16px] p-2.5 text-center flex flex-col items-center justify-between bg-white shadow-sm"
                style={{
                  border: '1px solid rgba(192,132,252,0.2)',
                }}
              >
                <img
                  src={getValidImageUrl(rec.menuItem.imageUrl)}
                  alt={rec.menuItem.name}
                  className="w-12 h-12 rounded-[12px] object-cover mb-1.5 border border-slate-100"
                />
                <p className="font-black text-[11px] line-clamp-1 w-full" style={{ color: 'var(--text-primary)' }}>{rec.menuItem.name}</p>
                <p className="text-[9px] text-purple-700 font-medium line-clamp-1 mt-0.5">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
