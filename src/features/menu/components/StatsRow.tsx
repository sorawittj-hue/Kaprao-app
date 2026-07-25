import { motion } from 'framer-motion'
import { ClipboardList, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { fadeInUp } from '@/animations/variants'
import { useCountUp } from '@/hooks/useAdvancedAnimations'

export function StatsRow() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: orders } = useOrders(user?.id)

  const activeOrders = orders?.filter(
    o => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ).length || 0

  const points = user?.points || 0
  const hasActiveOrder = activeOrders > 0
  const countUpRef = useCountUp(points, 2.5)

  return (
    <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">

      {/* Active Orders */}
      <motion.button
        onClick={() => navigate('/orders')}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-[22px] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        style={hasActiveOrder ? {
          background: 'linear-gradient(145deg, #1E40AF 0%, #1E3A8A 60%, #1E3374 100%)',
          boxShadow: '0 10px 30px rgba(30,64,175,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
        } : {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {hasActiveOrder && (
          <>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl opacity-30" style={{ background: '#60A5FA' }} />
            <div className="absolute -left-4 -bottom-6 w-16 h-16 rounded-full blur-xl opacity-20" style={{ background: '#38BDF8' }} />
          </>
        )}

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={hasActiveOrder ? {
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)'
            } : {
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.15)'
            }}
          >
            <ClipboardList className="w-5 h-5" style={{ color: hasActiveOrder ? 'white' : '#60A5FA' }} />
          </div>
          <div>
            <p className="text-[10px] font-bold mb-0.5" style={{ color: hasActiveOrder ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>
              สถานะออเดอร์
            </p>
            <div className="flex items-center gap-1.5">
              {hasActiveOrder && (
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-blue-300"
                />
              )}
              <p className="font-black text-sm" style={{ color: hasActiveOrder ? 'white' : 'var(--text-primary)' }}>
                {hasActiveOrder ? `${activeOrders} กำลังทำ` : 'ไม่มีออเดอร์'}
              </p>
            </div>
          </div>
        </div>
      </motion.button>

      {/* Points */}
      <motion.button
        onClick={() => navigate('/profile')}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-[22px] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        style={points > 0 ? {
          background: 'linear-gradient(145deg, #B45309 0%, #92400E 55%, #78350F 100%)',
          boxShadow: '0 10px 30px rgba(180,83,9,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
        } : {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {points > 0 && (
          <>
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="absolute inset-0 -skew-x-12 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
            />
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl opacity-30" style={{ background: '#FCD34D' }} />
          </>
        )}

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={points > 0 ? {
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)'
            } : {
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.15)'
            }}
          >
            <Star
              className="w-5 h-5"
              style={{
                color: points > 0 ? 'white' : '#FBBF24',
                fill: points > 0 ? 'rgba(255,255,255,0.4)' : 'none'
              }}
            />
          </div>
          <div>
            <p className="text-[10px] font-bold mb-0.5" style={{ color: points > 0 ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>
              พอยต์สะสม
            </p>
            <div className="flex items-center gap-1">
              <span
                ref={countUpRef}
                className="font-black text-sm"
                style={{ color: points > 0 ? 'white' : 'var(--text-primary)' }}
              >
                {points.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold" style={{ color: points > 0 ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>pts</span>
            </div>
          </div>
        </div>
      </motion.button>

    </motion.div>
  )
}
