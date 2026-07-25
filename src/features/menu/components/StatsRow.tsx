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
    (o) => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ).length || 0

  const points = user?.points || 0
  const hasActiveOrder = activeOrders > 0
  const countUpRef = useCountUp(points, 2.5)

  return (
    <motion.div
      variants={fadeInUp}
      className="grid grid-cols-2 gap-3"
    >
      {/* Active Orders Card */}
      <motion.button
        onClick={() => navigate('/orders')}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-[22px] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        style={{
          background: hasActiveOrder
            ? 'linear-gradient(145deg, #2563EB 0%, #0284C7 60%, #0891B2 100%)'
            : 'white',
          boxShadow: hasActiveOrder
            ? '0 10px 28px -6px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '0 4px 20px -6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        {hasActiveOrder && (
          <>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-xl"
              style={{ background: '#60A5FA' }} />
            <div className="absolute -left-4 -bottom-6 w-18 h-18 rounded-full opacity-15 blur-xl"
              style={{ background: '#0EA5E9' }} />
          </>
        )}

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{
              background: hasActiveOrder ? 'rgba(255,255,255,0.18)' : 'rgba(37,99,235,0.08)',
              border: hasActiveOrder ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(37,99,235,0.12)'
            }}
          >
            <ClipboardList
              className="w-5 h-5"
              style={{ color: hasActiveOrder ? 'white' : '#3B82F6' }}
            />
          </div>
          <div>
            <p
              className="text-[10px] font-bold mb-0.5"
              style={{ color: hasActiveOrder ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}
            >
              สถานะออเดอร์
            </p>
            <div className="flex items-center gap-1.5">
              {hasActiveOrder && (
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              )}
              <p
                className="font-black text-sm"
                style={{ color: hasActiveOrder ? 'white' : '#111827' }}
              >
                {hasActiveOrder ? `${activeOrders} กำลังทำ` : 'ไม่มีออเดอร์'}
              </p>
            </div>
          </div>
        </div>
      </motion.button>

      {/* Points Card */}
      <motion.button
        onClick={() => navigate('/profile')}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="relative overflow-hidden rounded-[22px] p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        style={{
          background: points > 0
            ? 'linear-gradient(145deg, #FF8C00 0%, #FF5E00 55%, #DC2626 100%)'
            : 'white',
          boxShadow: points > 0
            ? '0 10px 28px -6px rgba(255, 94, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '0 4px 20px -6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        {points > 0 && (
          <>
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
              className="absolute inset-0 -skew-x-12 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
            />
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-xl"
              style={{ background: '#FCD34D' }} />
          </>
        )}

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{
              background: points > 0 ? 'rgba(255,255,255,0.18)' : 'rgba(245,158,11,0.08)',
              border: points > 0 ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(245,158,11,0.15)'
            }}
          >
            <Star
              className="w-5 h-5"
              style={{
                color: points > 0 ? 'white' : '#F59E0B',
                fill: points > 0 ? 'rgba(255,255,255,0.5)' : 'none'
              }}
            />
          </div>
          <div>
            <p
              className="text-[10px] font-bold mb-0.5"
              style={{ color: points > 0 ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}
            >
              พอยต์สะสม
            </p>
            <div className="flex items-center gap-1">
              <span
                ref={countUpRef}
                className="font-black text-sm"
                style={{ color: points > 0 ? 'white' : '#111827' }}
              >
                {points.toLocaleString()}
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: points > 0 ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}
              >
                pts
              </span>
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}
