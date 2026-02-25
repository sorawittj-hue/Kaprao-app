import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Sparkles, Trophy, TrendingUp } from 'lucide-react'

import { cn } from '@/utils/cn'
import confetti from 'canvas-confetti'

interface PointsCelebrationProps {
  pointsEarned: number
  totalPoints: number
  tier: 'MEMBER' | 'SILVER' | 'GOLD' | 'VIP'
  show: boolean
  onClose: () => void
}

const tierConfig = {
  MEMBER: { color: 'bg-gray-500', label: 'สมาชิก', next: 'SILVER', required: 0 },
  SILVER: { color: 'bg-gray-400', label: 'เงิน', next: 'GOLD', required: 500 },
  GOLD: { color: 'bg-amber-400', label: 'ทอง', next: 'VIP', required: 1500 },
  VIP: { color: 'bg-purple-500', label: 'VIP', next: null, required: 3000 },
}

export function PointsCelebration({ 
  pointsEarned, 
  totalPoints, 
  tier, 
  show, 
  onClose 
}: PointsCelebrationProps) {
  const [, setShowAnimation] = useState(false)
  const config = tierConfig[tier]
  const nextTier = config.next ? tierConfig[config.next as keyof typeof tierConfig] : null
  const progress = nextTier ? Math.min(100, (totalPoints / nextTier.required) * 100) : 100

  useEffect(() => {
    if (show) {
      setShowAnimation(true)
      // Trigger confetti
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B00', '#FFD700', '#C0C0C0', '#8B5CF6']
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF6B00', '#FFD700', '#C0C0C0', '#8B5CF6']
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      
      setTimeout(frame, 300)

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Star className="w-10 h-10 text-white fill-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-gray-800"
              >
                ยินดีด้วย!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 mt-1"
              >
                คุณได้รับแต้มจากการสั่งซื้อ
              </motion.p>
            </div>

            {/* Points Earned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-5 text-center border border-amber-200"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-amber-700 font-bold">ได้รับแต้ม</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500"
              >
                +{pointsEarned}
              </motion.p>
              <p className="text-sm text-amber-600 mt-1">พอยต์</p>
            </motion.div>

            {/* Total Points & Tier */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className={cn('w-4 h-4', config.color.replace('bg-', 'text-'))} />
                  <span className="text-sm font-bold text-gray-700">ระดับ {config.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{totalPoints.toLocaleString()} พอยต์</span>
              </div>

              {/* Progress Bar */}
              {nextTier && (
                <>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={cn('h-full rounded-full', config.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>อีก {nextTier.required - totalPoints} พอยต์ จะขึ้น {nextTier.label}</span>
                  </div>
                </>
              )}
            </div>

            {/* Rewards Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gray-50 rounded-xl p-4 mb-5"
            >
              <p className="text-xs text-gray-500 text-center">
                สะสมแต้มเพื่อแลกรับส่วนลดและของรางวัลพิเศษ!
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={onClose}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-colors active:scale-95"
            >
              เยี่ยมเลย!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
