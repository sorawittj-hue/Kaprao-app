import { motion } from 'framer-motion'
import { ShoppingBag, ClipboardList, Bell, Search, Inbox, Coffee } from 'lucide-react'
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
      icon: <ShoppingBag className="w-14 h-14 text-orange-400" />,
      title: 'ตะกร้าของคุณยังว่างอยู่',
      description: 'ลองเลือกเมนูกะเพรารสเด็ดเผ็ดร้อนเติมลงในตะกร้าดูสิ!',
      actionLabel: 'ไปเลือกเมนูความอร่อย',
    },
    orders: {
      icon: <ClipboardList className="w-14 h-14 text-orange-400" />,
      title: 'ยังไม่มีประวัติการสั่งซื้อ',
      description: 'คุณยังไม่ได้ทำการสั่งซื้อรายการอาหารใดๆ ในขณะนี้',
      actionLabel: 'เริ่มสั่งอาหารเลย',
    },
    notifications: {
      icon: <Bell className="w-14 h-14 text-orange-400" />,
      title: 'ไม่มีการแจ้งเตือนใหม่',
      description: 'คุณจะได้รับการแจ้งเตือนเกี่ยวกับสถานะออเดอร์ที่นี่',
      actionLabel: undefined,
    },
    search: {
      icon: <Search className="w-14 h-14 text-orange-400" />,
      title: 'ไม่พบเมนูที่คุณค้นหา',
      description: 'ลองค้นหาด้วยคำอื่น เช่น กะเพราหมูกรอบ, ไข่ข้น',
      actionLabel: undefined,
    },
    inbox: {
      icon: <Inbox className="w-14 h-14 text-orange-400" />,
      title: 'กล่องข้อความว่างเปล่า',
      description: 'ยังไม่มีข้อความใหม่ในระบบ',
      actionLabel: undefined,
    },
    custom: {
      icon: icon || <Coffee className="w-14 h-14 text-orange-400" />,
      title: title || 'ยังไม่มีข้อมูล',
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
      className={cn('relative flex flex-col items-center justify-center py-12 px-6 text-center w-full max-w-sm mx-auto', className)}
    >
      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 mb-6"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl transform scale-150" />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-28 rounded-[28px] flex items-center justify-center shadow-md"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }}
        >
          {currentConfig.icon}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-xl font-black mb-2 tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {currentConfig.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-xs font-medium leading-relaxed mb-6 max-w-xs"
        style={{ color: 'var(--text-secondary)' }}
      >
        {currentConfig.description}
      </motion.p>

      {/* Action Button */}
      {onAction && (actionLabel || currentConfig.actionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <button
            type="button"
            onClick={onAction}
            className="w-full py-3.5 px-6 rounded-full font-black text-sm text-white btn-brand shadow-lg shadow-orange-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {actionLabel || currentConfig.actionLabel}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

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
