import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin, Star, ChevronRight, ChefHat, PackageCheck, CheckCircle2, XCircle, AlarmClock, Bell, Package } from 'lucide-react'
import type { Order } from '@/types'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

type StatusEntry = {
  label: string
  badgeBg: string
  badgeText: string
  dotBg: string
  border: string
  glow: string
  icon: React.ReactNode
  isLive?: boolean
}

const statusConfig: Record<string, StatusEntry> = {
  pending: {
    label: 'รอดำเนินการ',
    badgeBg: 'rgba(217,119,6,0.08)',
    badgeText: '#D97706',
    dotBg: '#D97706',
    border: 'rgba(217,119,6,0.25)',
    glow: 'rgba(217,119,6,0.10)',
    icon: <AlarmClock className="w-3.5 h-3.5" />,
    isLive: true,
  },
  placed: {
    label: 'รับออเดอร์แล้ว',
    badgeBg: 'rgba(2,132,199,0.08)',
    badgeText: '#0284C7',
    dotBg: '#0284C7',
    border: 'rgba(2,132,199,0.25)',
    glow: 'rgba(2,132,199,0.10)',
    icon: <Package className="w-3.5 h-3.5" />,
    isLive: true,
  },
  confirmed: {
    label: 'ยืนยันออเดอร์',
    badgeBg: 'rgba(147,51,234,0.08)',
    badgeText: '#9333EA',
    dotBg: '#9333EA',
    border: 'rgba(147,51,234,0.25)',
    glow: 'rgba(147,51,234,0.10)',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    isLive: true,
  },
  preparing: {
    label: 'กำลังปรุงอาหาร',
    badgeBg: 'rgba(255,85,0,0.08)',
    badgeText: '#FF5500',
    dotBg: '#FF5500',
    border: 'rgba(255,85,0,0.25)',
    glow: 'rgba(255,85,0,0.12)',
    icon: <ChefHat className="w-3.5 h-3.5" />,
    isLive: true,
  },
  ready: {
    label: 'พร้อมรับ / ส่ง!',
    badgeBg: 'rgba(22,163,74,0.08)',
    badgeText: '#16A34A',
    dotBg: '#16A34A',
    border: 'rgba(22,163,74,0.25)',
    glow: 'rgba(22,163,74,0.10)',
    icon: <Bell className="w-3.5 h-3.5" />,
    isLive: true,
  },
  delivered: {
    label: 'จัดส่งสำเร็จ',
    badgeBg: 'rgba(15,23,42,0.05)',
    badgeText: '#64748B',
    dotBg: '#64748B',
    border: 'rgba(15,23,42,0.10)',
    glow: 'transparent',
    icon: <PackageCheck className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: 'ยกเลิกแล้ว',
    badgeBg: 'rgba(220,38,38,0.08)',
    badgeText: '#DC2626',
    dotBg: '#DC2626',
    border: 'rgba(220,38,38,0.25)',
    glow: 'rgba(220,38,38,0.10)',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const navigate = useNavigate()
  const handleClick = onClick || (() => navigate(`/orders/${order.id}`))
  const status = statusConfig[order.status] || statusConfig.pending
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const firstItem = order.items[0]?.name || 'เมนูอาหาร'
  const otherItemsCount = itemCount - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="relative rounded-[22px] p-5 cursor-pointer overflow-hidden group select-none touch-manipulation border transition-all"
      style={{
        background: '#FFFFFF',
        borderColor: status.border,
        boxShadow: '0 2px 14px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Ambient soft glow orb */}
      <div
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full blur-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-300"
        style={{ background: status.glow }}
      />

      {/* Status badge + Order ID row */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px]"
          style={{
            background: status.badgeBg,
            border: `1px solid ${status.border}`,
            color: status.badgeText,
          }}
        >
          {status.isLive ? (
            <span className="relative flex w-2 h-2 flex-shrink-0" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-current opacity-50 animate-ping" />
              <span
                className="relative inline-flex w-2 h-2 rounded-full"
                style={{ background: status.dotBg }}
              />
            </span>
          ) : (
            <span style={{ color: status.badgeText }}>{status.icon}</span>
          )}
          <span className="font-black text-[11px] tracking-tight">{status.label}</span>
        </div>

        <div className="text-right flex flex-col items-end gap-0.5">
          <span className="font-mono text-[11px] font-black" style={{ color: 'var(--text-muted)' }}>
            #{order.id.toString().slice(-6).toUpperCase()}
          </span>
          <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: 'var(--text-micro)' }}>
            <Clock className="w-2.5 h-2.5" />
            {formatOrderDate(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Food info */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-black text-[15px] line-clamp-1 flex-1" style={{ color: 'var(--text-primary)' }}>
            {firstItem}
            {otherItemsCount > 0 && (
              <span className="text-xs font-bold ml-1.5" style={{ color: 'var(--text-muted)' }}>
                +{otherItemsCount} รายการ
              </span>
            )}
          </h3>
          <span className="font-black text-[15px] text-gradient-fire flex-shrink-0 num-display">
            {formatPrice(order.totalPrice)}
          </span>
        </div>

        {order.deliveryMethod && (
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
            <span className="line-clamp-1">
              {order.deliveryMethod === 'workplace'
                ? `รับที่ทำงาน${order.address ? `: ${order.address}` : ''}`
                : `ส่งหมู่บ้าน${order.address ? `: ${order.address}` : ''}`
              }
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="mt-4 pt-3 flex items-center justify-between text-xs font-bold relative z-10"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {order.pointsEarned ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            +{order.pointsEarned} พอยต์
          </span>
        ) : <div />}

        <div
          className="flex items-center gap-1 text-xs font-black text-gradient-fire group-hover:translate-x-0.5 transition-transform"
        >
          <span>ดูรายละเอียด</span>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--brand)' }} />
        </div>
      </div>
    </motion.div>
  )
}
