import { motion } from 'framer-motion'
import { Clock, MapPin, Star, ExternalLink } from 'lucide-react'
import type { Order } from '@/types'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

const statusConfig: Record<string, { label: string, badgeBg: string, badgeText: string, dotBg: string, icon: string, border: string }> = {
  pending:   { label: 'รอดำเนินการ', badgeBg: 'rgba(234,179,8,0.12)', badgeText: '#FACC15', dotBg: '#FACC15', icon: '⏳', border: 'rgba(234,179,8,0.25)' },
  placed:    { label: 'สั่งอาหารแล้ว', badgeBg: 'rgba(59,130,246,0.12)', badgeText: '#60A5FA', dotBg: '#60A5FA', icon: '📝', border: 'rgba(59,130,246,0.25)' },
  confirmed: { label: 'ยืนยันออเดอร์', badgeBg: 'rgba(99,102,241,0.12)', badgeText: '#818CF8', dotBg: '#818CF8', icon: '✅', border: 'rgba(99,102,241,0.25)' },
  preparing: { label: 'กำลังทำอาหาร', badgeBg: 'rgba(255,94,0,0.15)', badgeText: '#FF8C42', dotBg: '#FF5E00', icon: '👨‍🍳', border: 'rgba(255,94,0,0.3)' },
  ready:     { label: 'พร้อมรับ', badgeBg: 'rgba(34,197,94,0.12)', badgeText: '#4ADE80', dotBg: '#4ADE80', icon: '🛎️', border: 'rgba(34,197,94,0.25)' },
  delivered: { label: 'เสร็จสิ้น', badgeBg: 'rgba(255,255,255,0.06)', badgeText: '#A3A3A8', dotBg: '#A3A3A8', icon: '✨', border: 'rgba(255,255,255,0.08)' },
  cancelled: { label: 'ยกเลิก', badgeBg: 'rgba(239,68,68,0.12)', badgeText: '#F87171', dotBg: '#F87171', icon: '❌', border: 'rgba(239,68,68,0.25)' },
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const firstItem = order.items[0]?.name || 'เมนูอาหาร'
  const otherItemsCount = itemCount - 1
  const isLive = ['placed', 'confirmed', 'preparing', 'ready'].includes(order.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.015, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative rounded-[22px] p-5 cursor-pointer overflow-hidden group transition-all duration-300 select-none"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${status.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none group-hover:opacity-60 transition-opacity"
        style={{ background: status.badgeText }}
      />

      {/* Header: Status and ID */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px]"
          style={{
            background: status.badgeBg,
            border: `1px solid ${status.border}`,
            color: status.badgeText
          }}
        >
          {isLive ? (
            <span className="relative flex w-2 h-2" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-current opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: status.dotBg }} />
            </span>
          ) : (
            <span className="text-sm drop-shadow-sm">{status.icon}</span>
          )}
          <span className="font-black text-xs tracking-tight">{status.label}</span>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="font-mono text-xs font-black" style={{ color: 'var(--text-muted)' }}>
            #{order.id.toString().slice(-6)}
          </span>
          <span className="text-[10px] font-bold flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3 h-3" />
            {formatOrderDate(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-baseline justify-between">
          <h3 className="font-black text-base line-clamp-1" style={{ color: 'var(--text-primary)' }}>
            {firstItem}
            {otherItemsCount > 0 && (
              <span className="text-xs font-medium ml-1.5" style={{ color: 'var(--text-muted)' }}>
                +{otherItemsCount} รายการ
              </span>
            )}
          </h3>
          <span className="font-black text-base text-gradient-fire flex-shrink-0 ml-2">
            {formatPrice(order.totalPrice)}
          </span>
        </div>

        {order.deliveryMethod && (
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
            <span className="line-clamp-1">
              {order.deliveryMethod === 'workplace' ? `จัดส่งที่ทำงาน: ${order.address || ''}` : `จัดส่งที่บ้าน: ${order.address || ''}`}
            </span>
          </div>
        )}
      </div>

      {/* Footer / Tracking CTA */}
      <div
        className="mt-4 pt-3 flex items-center justify-between text-xs font-bold relative z-10"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {order.pointsEarned ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            +{order.pointsEarned} พอยต์
          </span>
        ) : <div />}

        <div className="flex items-center gap-1 text-xs font-black text-gradient-fire group-hover:translate-x-1 transition-transform">
          <span>ดูรายละเอียด</span>
          <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
        </div>
      </div>
    </motion.div>
  )
}
