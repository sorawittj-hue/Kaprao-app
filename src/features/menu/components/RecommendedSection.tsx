import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { useMenuItems } from '../hooks/useMenu'
import { useMenuStore } from '@/store'
import { MenuItemCard } from './MenuItemCard'
import { staggerContainer, fadeInUp } from '@/animations/variants'

export function RecommendedSection() {
  const { data: menuItems } = useMenuItems()
  const { favorites } = useMenuStore()

  const recommendedItems = menuItems
    ?.filter((item) => item.isRecommended && !favorites.includes(item.id))
    .slice(0, 6) || []

  if (recommendedItems.length === 0) return null

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C42)', boxShadow: '0 4px 12px -2px rgba(255, 107, 0, 0.4)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-black text-gray-800">แนะนำสำหรับคุณ</h3>
        </div>
        <button className="flex items-center gap-0.5 text-xs font-bold text-brand-500 hover:text-brand-600 transition-colors">
          ดูทั้งหมด
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal scroll */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4"
      >
        {recommendedItems.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeInUp}
            className="flex-shrink-0"
            style={{ width: 155 }}
          >
            <MenuItemCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
