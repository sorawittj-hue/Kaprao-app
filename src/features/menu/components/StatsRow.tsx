import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Star, Clock, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { fadeInUp } from '@/animations/variants'
import { useCountUp } from '@/hooks/useAdvancedAnimations'

// Simulated live delivery time (20-35 min range)
function useDeliveryTime() {
  const [minutes, setMinutes] = useState(() => Math.floor(Math.random() * 15) + 20)
  useEffect(() => {
    const id = setInterval(() => {
      setMinutes(Math.floor(Math.random() * 15) + 20)
    }, 45000)
    return () => clearInterval(id)
  }, [])
  return minutes
}

export function StatsRow() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: orders } = useOrders(user?.id)
  const deliveryTime = useDeliveryTime()

  const activeOrders = orders?.filter(
    o => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ).length || 0

  const points = user?.points || 0
  const hasActiveOrder = activeOrders > 0
  const countUpRef = useCountUp(points, 2.5)

  return (
    <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-2.5">

      {/* === Active Orders === */}
      <motion.button
        onClick={() => navigate('/orders')}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-[20px] p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 col-span-1 cursor-pointer transition-all"
        style={hasActiveOrder ? {
          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
          boxShadow: '0 6px 20px rgba(2,132,199,0.30)',
          border: '1px solid rgba(2,132,199,0.4)',
        } : {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="relative">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-2"
            style={hasActiveOrder ? {
              background: 'rgba(255,255,255,0.20)',
            } : {
              background: 'rgba(2,132,199,0.08)',
              border: '1px solid rgba(2,132,199,0.15)'
            }}
          >
            <ClipboardList className="w-4.5 h-4.5" style={{ color: hasActiveOrder ? '#fff' : '#0284C7' }} />
          </div>

          <p className="text-[9px] font-bold mb-0.5" style={{ color: hasActiveOrder ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>
            ออเดอร์
          </p>
          <div className="flex items-center gap-1">
            {hasActiveOrder && (
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white"
              />
            )}
            <p className="font-black text-[14px] num-display" style={{ color: hasActiveOrder ? '#fff' : 'var(--text-primary)' }}>
              {hasActiveOrder ? `${activeOrders}` : '—'}
            </p>
          </div>
          {hasActiveOrder && (
            <p className="text-[9px] font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>กำลังทำ</p>
          )}
        </div>
      </motion.button>

      {/* === Delivery Time === */}
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        className="relative overflow-hidden rounded-[20px] p-3.5 col-span-1"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="relative">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-2"
            style={{
              background: 'rgba(22,163,74,0.08)',
              border: '1px solid rgba(22,163,74,0.15)',
            }}
          >
            <Clock className="w-4.5 h-4.5 text-emerald-600" />
          </div>

          <p className="text-[9px] font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>รอรับ</p>
          <div className="flex items-end gap-0.5">
            <motion.span
              key={deliveryTime}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-black text-[15px] num-display"
              style={{ color: 'var(--text-primary)' }}
            >
              {deliveryTime}
            </motion.span>
            <span className="text-[9px] font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>นาที</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[8px] font-bold text-emerald-600">อยู่ในเขตส่ง</p>
          </div>
        </div>
      </motion.div>

      {/* === Points === */}
      <motion.button
        onClick={() => navigate('/profile')}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-[20px] p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 col-span-1 cursor-pointer transition-all"
        style={points > 0 ? {
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          boxShadow: '0 6px 20px rgba(217,119,6,0.30)',
          border: '1px solid rgba(217,119,6,0.4)',
        } : {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="relative">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-2"
            style={points > 0 ? {
              background: 'rgba(255,255,255,0.25)',
            } : {
              background: 'rgba(217,119,6,0.08)',
              border: '1px solid rgba(217,119,6,0.15)'
            }}
          >
            <Star
              className="w-4.5 h-4.5"
              style={{
                color: points > 0 ? '#fff' : '#D97706',
                fill: points > 0 ? '#fff' : 'none'
              }}
            />
          </div>

          <p className="text-[9px] font-bold mb-0.5" style={{ color: points > 0 ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>
            พอยต์
          </p>
          <div className="flex items-baseline gap-0.5">
            <span
              ref={countUpRef}
              className="font-black text-[15px] num-display"
              style={{ color: points > 0 ? '#fff' : 'var(--text-primary)' }}
            >
              {points.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold" style={{ color: points > 0 ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>pts</span>
          </div>
          {points > 0 && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <ChevronRight className="w-2.5 h-2.5 text-white/80" />
              <p className="text-[8px] font-bold text-white/90">แลกส่วนลด</p>
            </div>
          )}
        </div>
      </motion.button>

    </motion.div>
  )
}
