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
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden rounded-2xl p-4 text-left"
        style={{
          background: hasActiveOrder
            ? 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)'
            : 'white',
          boxShadow: hasActiveOrder
            ? '0 8px 25px -5px rgba(59, 130, 246, 0.45)'
            : '0 4px 20px -4px rgba(0,0,0,0.08)',
          border: hasActiveOrder ? 'none' : '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {/* Background decoration */}
        {hasActiveOrder && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-6 -top-6 w-20 h-20 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-2 -bottom-8 w-16 h-16 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />
          </>
        )}

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: hasActiveOrder ? 'rgba(255,255,255,0.2)' : '#EFF6FF',
            }}
          >
            <ClipboardList
              className="w-5 h-5"
              style={{ color: hasActiveOrder ? 'white' : '#3B82F6' }}
            />
          </div>
          <div>
            <p
              className="text-[11px] font-semibold mb-0.5"
              style={{ color: hasActiveOrder ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}
            >
              สถานะออเดอร์
            </p>
            <div className="flex items-center gap-1.5">
              {hasActiveOrder && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
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
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="relative overflow-hidden rounded-2xl p-4 text-left"
        style={{
          background: points > 0
            ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
            : 'white',
          boxShadow: points > 0
            ? '0 8px 25px -5px rgba(245, 158, 11, 0.45)'
            : '0 4px 20px -4px rgba(0,0,0,0.08)',
          border: points > 0 ? 'none' : '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {/* Shine effect for points > 0 */}
        {points > 0 && (
          <motion.div
            animate={{ x: ['−100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            className="absolute inset-0 -skew-x-12 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
          />
        )}

        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: points > 0 ? 'rgba(255,255,255,0.2)' : '#FFFBEB',
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
              className="text-[11px] font-semibold mb-0.5"
              style={{ color: points > 0 ? 'rgba(255,255,255,0.75)' : '#9CA3AF' }}
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
                style={{ color: points > 0 ? 'rgba(255,255,255,0.8)' : '#9CA3AF' }}
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
