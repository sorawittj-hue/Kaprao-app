import { motion } from 'framer-motion'
import { Clock, MapPin, Receipt, Star, ExternalLink } from 'lucide-react'
import type { Order } from '@/types'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

const statusConfig: Record<string, { label: string, badgeBg: string, badgeText: string, icon: string, border: string }> = {
  pending: { label: 'รอดำเนินการ', badgeBg: 'bg-yellow-500/10', badgeText: 'text-yellow-600', icon: '⏳', border: 'border-yellow-200' },
  placed: { label: 'สั่งอาหารแล้ว', badgeBg: 'bg-blue-500/10', badgeText: 'text-blue-600', icon: '📝', border: 'border-blue-200' },
  confirmed: { label: 'ยืนยันออเดอร์', badgeBg: 'bg-indigo-500/10', badgeText: 'text-indigo-600', icon: '✅', border: 'border-indigo-200' },
  preparing: { label: 'กำลังทำอาหาร', badgeBg: 'bg-orange-500/10', badgeText: 'text-orange-600', icon: '👨‍🍳', border: 'border-orange-200' },
  ready: { label: 'พร้อมรับ', badgeBg: 'bg-green-500/10', badgeText: 'text-green-600', icon: '🛎️', border: 'border-green-200' },
  delivered: { label: 'เสร็จสิ้น', badgeBg: 'bg-gray-500/10', badgeText: 'text-gray-600', icon: '✨', border: 'border-gray-200' },
  cancelled: { label: 'ยกเลิก', badgeBg: 'bg-red-500/10', badgeText: 'text-red-600', icon: '❌', border: 'border-red-200' },
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.pending
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const firstItem = order.items[0]?.name || 'เมนูอาหาร'
  const otherItemsCount = itemCount - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.015, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative bg-white rounded-3xl p-5 cursor-pointer overflow-hidden group transition-all duration-300",
        "border-2",
        status.border,
        "hover:shadow-xl hover:shadow-black/5"
      )}
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-3xl opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />

      {/* Header: Status and ID */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white shadow-sm",
          status.badgeBg
        )}>
          <span className="text-sm drop-shadow-sm">{status.icon}</span>
          <span className={cn("text-xs font-bold tracking-wide", status.badgeText)}>
            {status.label}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Order ID</p>
          <p className="font-black text-gray-800 text-sm">#{order.id}</p>
        </div>
      </div>

      {/* Main Content: Items & Meta */}
      <div className="relative z-10 mb-5">
        <h3 className="font-black text-gray-800 text-lg leading-tight mb-2 pr-4">
          <span className="text-xl mr-2">🍛</span>
          {firstItem}
          {otherItemsCount > 0 && (
            <span className="text-gray-400 text-sm ml-2 font-bold">
              และอีก {otherItemsCount} เมนู
            </span>
          )}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mt-3">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {formatOrderDate(order.createdAt)}
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
            <Receipt className="w-3.5 h-3.5 text-gray-400" />
            {itemCount} รายการ
          </div>
          {order.deliveryMethod && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {order.deliveryMethod === 'village' ? 'ส่งในหมู่บ้าน' : 'ส่งที่ทำงาน'}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price and Action */}
      <div className="flex items-end justify-between pt-4 border-t border-gray-100 relative z-10">
        <div>
          <p className="text-[10px] font-black tracking-wider text-gray-400 uppercase mb-0.5">ยอดสุทธิ</p>
          <p className="font-black text-2xl" style={{ color: '#FF6B00' }}>
            {formatPrice(order.totalPrice)}
          </p>
        </div>

        {order.pointsEarned > 0 && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-bold">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            +{order.pointsEarned} pts
          </div>
        )}

        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-brand-50 flex items-center justify-center transition-colors">
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
        </div>
      </div>
    </motion.div>
  )
}
