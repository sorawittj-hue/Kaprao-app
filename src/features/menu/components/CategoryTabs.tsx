import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMenuStore } from '@/store'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { categories } from '../api/menuApi'
import { cn } from '@/utils/cn'
import { hapticLight } from '@/utils/haptics'

// Emoji icons mapped to Lucide/icon names
const iconMap: Record<string, string> = {
  heart: '❤️', 'pepper-hot': '🌶️', utensils: '🍽️', 'bread-slice': '🧄',
  'bowl-food': '🥘', bacon: '🍜', 'mug-hot': '🍲', 'utensil-spoon': '🥄',
  'ice-cream': '🍨', tags: '🏷️', egg: '🍳', shrimp: '🦐', rice: '🍚', bamboo: '🎋',
}

const catGradients: Record<string, string> = {
  red:     'linear-gradient(135deg, #EF4444, #B91C1C)',
  orange:  'linear-gradient(135deg, #FF5E00, #FF3A00)',
  yellow:  'linear-gradient(135deg, #F59E0B, #D97706)',
  amber:   'linear-gradient(135deg, #D97706, #92400E)',
  emerald: 'linear-gradient(135deg, #10B981, #065F46)',
  pink:    'linear-gradient(135deg, #EC4899, #9D174D)',
  purple:  'linear-gradient(135deg, #8B5CF6, #5B21B6)',
  blue:    'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  teal:    'linear-gradient(135deg, #14B8A6, #0F766E)',
  gray:    'linear-gradient(135deg, #6B7280, #374151)',
}

export function CategoryTabs() {
  const { activeCategory, setActiveCategory, favorites } = useMenuStore()
  const { data: menuItems } = useMenuItems()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Count items per category
  const countByCategory = (catId: string): number => {
    if (!menuItems) return 0
    if (catId === 'favorites') return favorites.length
    return menuItems.filter(item => item.category === catId && item.isAvailable).length
  }

  return (
    <div className="relative">
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg-base), transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg-base), transparent)' }}
      />

      <div
        ref={scrollRef}
        role="tablist"
        aria-label="หมวดหมู่เมนู"
        className="flex gap-2 overflow-x-auto hide-scrollbar py-1.5 px-2 scroll-smooth"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          const grad = catGradients[category.color] || catGradients.orange
          const count = countByCategory(category.id)

          return (
            <motion.button
              key={category.id}
              type="button"
              role="tab"
              id={`cat-${category.id}`}
              aria-selected={isActive}
              onClick={() => {
                setActiveCategory(category.id)
                hapticLight()
                document.getElementById(`cat-${category.id}`)?.scrollIntoView({
                  behavior: 'smooth', block: 'nearest', inline: 'center'
                })
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={!isActive ? { y: -2 } : undefined}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2.5 rounded-[16px] whitespace-nowrap flex-shrink-0',
                'transition-all duration-200 text-[13px] min-h-[44px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                isActive ? 'font-black text-white' : 'font-bold'
              )}
              style={isActive ? {
                background: grad,
                boxShadow: '0 4px 14px rgba(255,85,0,0.35)',
              } : {
                background: '#FFFFFF',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-soft)',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              }}
            >
              <motion.span
                animate={isActive ? { rotate: [0, -12, 12, 0], scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.35 }}
                className="text-[15px] leading-none"
              >
                {iconMap[category.icon]}
              </motion.span>
              <span>{category.name}</span>

              {/* Item count badge */}
              {count > 0 && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={isActive ? {
                    background: 'rgba(255,255,255,0.25)',
                    color: '#FFFFFF',
                  } : {
                    background: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
