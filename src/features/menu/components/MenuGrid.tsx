import { motion } from 'framer-motion'
import type { MenuItem } from '@/types'
import { MenuItemCard } from './MenuItemCard'
import { staggerContainer, listItem } from '@/animations/variants'
import { EmptyState } from '@/components/feedback/EmptyState'

interface MenuGridProps {
  items: MenuItem[]
}

export function MenuGrid({ items }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        type="search"
        title="ไม่พบเมนู"
        description="ลองเลือกหมวดหมู่อื่นหรือค้นหาด้วยคำใหม่"
      />
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4"
    >
      {items.map((item) => (
        <motion.div key={item.id} variants={listItem}>
          <MenuItemCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
