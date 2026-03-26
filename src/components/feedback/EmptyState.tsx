import { motion } from 'framer-motion'
import { ShoppingBag, ClipboardList, Bell, Search, Inbox, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  type: 'cart' | 'orders' | 'notifications' | 'search' | 'inbox' | 'custom'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const config = {
    cart: {
      icon: <ShoppingBag className="w-20 h-20" />,
      title: 'ตะกร้าว่าง',
      description: 'เริ่มสั่งอาหารอร่อยกันเลย!',
      actionLabel: 'ไปเลือกเมนู',
    },
    orders: {
      icon: <ClipboardList className="w-20 h-20" />,
      title: 'ยังไม่มีออเดอร์',
      description: 'คุณยังไม่ได้สั่งอาหารเลย',
      actionLabel: 'สั่งเลย',
    },
    notifications: {
      icon: <Bell className="w-20 h-20" />,
      title: 'ไม่มีการแจ้งเตือน',
      description: 'คุณจะได้รับการแจ้งเตือนเมื่อมีกิจกรรมใหม่',
      actionLabel: undefined,
    },
    search: {
      icon: <Search className="w-20 h-20" />,
      title: 'ไม่พบผลลัพธ์',
      description: 'ลองค้นหาด้วยคำอื่นดูนะ',
      actionLabel: undefined,
    },
    inbox: {
      icon: <Inbox className="w-20 h-20" />,
      title: 'กล่องข้อความว่าง',
      description: 'ไม่มีข้อความใหม่',
      actionLabel: undefined,
    },
    custom: {
      icon: icon || <Coffee className="w-20 h-20" />,
      title: title || 'ว่างเปล่า',
      description: description || '',
      actionLabel,
    },
  }

  const currentConfig = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}
    >
      {/* Icon with animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-500 mb-6 shadow-inner"
      >
        {currentConfig.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-black text-gray-900 mb-2"
      >
        {currentConfig.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs"
      >
        {currentConfig.description}
      </motion.p>

      {/* Action button */}
      {currentConfig.actionLabel && actionLabel !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onAction}
            className="px-8 py-3 rounded-2xl font-bold text-base"
          >
            {actionLabel || currentConfig.actionLabel}
          </Button>
        </motion.div>
      )}

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"
      />
    </motion.div>
  )
}

// Preset empty states for common use cases
export function CartEmpty({ onShopNow }: { onShopNow?: () => void }) {
  return (
    <EmptyState
      type="cart"
      actionLabel={onShopNow ? undefined : 'ไปเลือกเมนู'}
      onAction={onShopNow}
    />
  )
}

export function OrdersEmpty({ onOrderNow }: { onOrderNow?: () => void }) {
  return (
    <EmptyState
      type="orders"
      actionLabel={onOrderNow ? undefined : 'สั่งเลย'}
      onAction={onOrderNow}
    />
  )
}

export function SearchEmpty() {
  return <EmptyState type="search" />
}

export function NotificationsEmpty() {
  return <EmptyState type="notifications" />
}
