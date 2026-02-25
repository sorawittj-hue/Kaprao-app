import { motion } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StreakTrackerProps {
  currentStreak: number
  longestStreak: number
  lastOrderDate?: string
}

const DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

export function StreakTracker({ currentStreak, longestStreak }: StreakTrackerProps) {
  // Generate mock activity for the week (in real app, this would come from order history)
  const weekActivity = [true, true, true, false, true, true, false] // Last 7 days

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs opacity-80">สตรีกปัจจุบัน</p>
            <p className="text-2xl font-black">{currentStreak} วัน</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-80">สูงสุด</p>
          <p className="text-lg font-bold">{longestStreak} วัน</p>
        </div>
      </div>

      {/* Week Activity */}
      <div className="bg-white/10 rounded-xl p-3 mb-4">
        <div className="flex justify-between items-center">
          {DAYS.map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <motion.div
                initial={weekActivity[index] ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  weekActivity[index]
                    ? 'bg-white text-orange-500'
                    : 'bg-white/10 text-white/50'
                )}
              >
                {weekActivity[index] ? (
                  <Flame className="w-4 h-4" />
                ) : (
                  day
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation Message */}
      <div className="flex items-center gap-2 text-sm">
        <Trophy className="w-4 h-4 opacity-80" />
        <p className="opacity-90">
          {currentStreak >= 7 
            ? 'สุดยอด! คุณสั่งติดต่อกัน 7 วันแล้ว 🎉'
            : currentStreak >= 3
            ? `สั่งอีก ${7 - currentStreak} วัน รับส่วนลดพิเศษ!`
            : 'สั่งติดต่อกัน 7 วัน รับส่วนลด 50 บาท'}
        </p>
      </div>
    </motion.div>
  )
}
