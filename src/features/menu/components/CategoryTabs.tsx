import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMenuStore } from '@/store'
import { categories } from '../api/menuApi'
import { cn } from '@/utils/cn'
import { hapticLight } from '@/utils/haptics'

const iconMap: Record<string, string> = {
  heart: '❤️',
  'pepper-hot': '🌶️',
  utensils: '🍽️',
  'bread-slice': '🧄',
  'bowl-food': '🥘',
  bacon: '🍜',
  'mug-hot': '🍲',
  'utensil-spoon': '🥄',
  'ice-cream': '🍨',
  tags: '🏷️',
  egg: '🍳',
  shrimp: '🦐',
  rice: '🍚',
  bamboo: '🎋',
}

const categoryGradientMap: Record<string, [string, string]> = {
  red: ['#EF4444', '#F87171'],
  orange: ['#FF5E00', '#FF8C42'],
  yellow: ['#F59E0B', '#FBBF24'],
  amber: ['#D97706', '#F59E0B'],
  emerald: ['#059669', '#34D399'],
  pink: ['#EC4899', '#F472B6'],
  purple: ['#7C3AED', '#C084FC'],
  blue: ['#2563EB', '#60A5FA'],
  teal: ['#0D9488', '#5EEAD4'],
  gray: ['#374151', '#6B7280'],
}

export function CategoryTabs() {
  const { activeCategory, setActiveCategory } = useMenuStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--page-bg, #fdf6f2), transparent)' }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--page-bg, #fdf6f2), transparent)' }}
      />

      {/* Tabs */}
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="หมวดหมู่เมนู"
        className="flex gap-2 overflow-x-auto hide-scrollbar py-1.5 px-2 scroll-smooth"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          const [colorStart, colorEnd] = categoryGradientMap[category.color] || ['#FF5E00', '#FF8C42']

          return (
            <motion.button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveCategory(category.id)
                hapticLight()
                const btn = document.getElementById(`cat-${category.id}`)
                btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
              }}
              id={`cat-${category.id}`}
              whileTap={{ scale: 0.92 }}
              whileHover={!isActive ? { y: -2, scale: 1.02 } : undefined}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-[16px] whitespace-nowrap flex-shrink-0',
                'transition-all duration-250 font-bold text-[13px]',
                'min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E00] focus-visible:ring-offset-1',
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              style={
                isActive
                  ? {
                    background: `linear-gradient(135deg, ${colorStart}, ${colorEnd})`,
                    boxShadow: `0 6px 20px -5px ${colorStart}70, 0 0 0 1px ${colorStart}20`,
                  }
                  : {
                    background: 'rgba(255,255,255,0.85)',
                    boxShadow: '0 2px 8px -3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(8px)'
                  }
              }
            >
              <motion.span
                animate={isActive ? { rotate: [0, -12, 12, 0], scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="text-[15px] leading-none"
              >
                {iconMap[category.icon]}
              </motion.span>

              <span className={isActive ? 'font-black' : 'font-semibold'}>
                {category.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
