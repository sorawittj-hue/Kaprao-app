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
      className={cn('relative flex flex-col items-center justify-center py-16 px-4 text-center overflow-hidden', className)}
    >
      {/* Ambient decorative orbs */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-brand-200/30 via-orange-100/20 to-transparent blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-12 right-12 w-32 h-32 rounded-full bg-amber-200/20 blur-2xl pointer-events-none" aria-hidden="true" />

      {/* Floating particles around the icon */}
      <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none" aria-hidden="true">
        <div className="relative w-32 h-32">
          {[
            { left: '-15%', top: '10%', size: 'w-2 h-2', color: 'bg-brand-400/40', delay: 0 },
            { left: '105%', top: '20%', size: 'w-1.5 h-1.5', color: 'bg-amber-400/50', delay: 0.6 },
            { left: '-5%', top: '85%', size: 'w-1 h-1', color: 'bg-orange-400/40', delay: 1.2 },
            { left: '95%', top: '90%', size: 'w-2 h-2', color: 'bg-brand-300/40', delay: 0.3 },
            { left: '50%', top: '-15%', size: 'w-1.5 h-1.5', color: 'bg-yellow-400/50', delay: 0.9 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className={cn('absolute rounded-full', p.size, p.color)}
              style={{ left: p.left, top: p.top }}
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      {/* Icon with breathing animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 mb-6"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-[28px] bg-gradient-to-br from-brand-100 via-orange-50 to-amber-50 flex items-center justify-center text-brand-500 shadow-[0_20px_50px_-12px_rgba(255,107,0,0.25)] border border-white"
        >
          {currentConfig.icon}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-2xl font-black text-gray-900 mb-2 tracking-tight"
      >
        {currentConfig.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-gray-500 text-sm leading-relaxed mb-6 max-w-xs"
      >
        {currentConfig.description}
      </motion.p>

      {/* Action button */}
      {onAction && (actionLabel || currentConfig.actionLabel) && (
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
  return <EmptyState type="cart" onAction={onShopNow} />
}

export function OrdersEmpty({ onOrderNow }: { onOrderNow?: () => void }) {
  return <EmptyState type="orders" onAction={onOrderNow} />
}

export function SearchEmpty() {
  return <EmptyState type="search" />
}

export function NotificationsEmpty() {
  return <EmptyState type="notifications" />
}
