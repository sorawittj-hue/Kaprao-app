import { motion } from 'framer-motion'
import { Package, Search, ShoppingBag, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  type?: 'cart' | 'orders' | 'search' | 'generic'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const icons = {
  cart: ShoppingBag,
  orders: ClipboardList,
  search: Search,
  generic: Package,
}

const defaults: Record<string, { title: string; description: string; actionLabel?: string }> = {
  cart: {
    title: 'ตะกร้าว่างเปล่า',
    description: 'ยังไม่มีรายการอาหารในตะกร้า',
    actionLabel: 'เลือกเมนูอาหาร',
  },
  orders: {
    title: 'ไม่มีรายการสั่งซื้อ',
    description: 'คุณยังไม่เคยสั่งอาหาร',
    actionLabel: 'สั่งอาหารเลย',
  },
  search: {
    title: 'ไม่พบผลลัพธ์',
    description: 'ลองค้นหาด้วยคำอื่น',
    actionLabel: 'ล้างการค้นหา',
  },
  generic: {
    title: 'ไม่มีข้อมูล',
    description: 'ยังไม่มีข้อมูลในขณะนี้',
  },
}

export function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = icons[type]
  const defaultContent = defaults[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-1">
        {title || defaultContent.title}
      </h3>

      <p className="text-sm text-gray-500 mb-6">
        {description || defaultContent.description}
      </p>

      {(actionLabel || defaultContent.actionLabel) && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel || defaultContent.actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
