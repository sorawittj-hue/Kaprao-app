import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
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
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[12px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
              boxShadow: '0 4px 14px rgba(255,58,0,0.45)'
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="section-label leading-none mb-0.5">Chef's Pick</p>
            <h3 className="font-black text-[15px] leading-none" style={{ color: 'var(--text-primary)' }}>
              แนะนำสำหรับคุณ
            </h3>
          </div>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{
            background: 'var(--brand-bg)',
            color: 'var(--brand)',
            border: '1px solid var(--brand-border)'
          }}
        >
          {recommendedItems.length} เมนู
        </span>
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
            style={{ width: 158 }}
          >
            <MenuItemCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
