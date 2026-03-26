import { motion } from 'framer-motion'
import { Calendar, Flame, Gift } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Day {
  date: string
  hasOrder: boolean
  isToday: boolean
  isFuture: boolean
}

interface StreakCalendarProps {
  currentStreak: number
  longestStreak: number
  orders: { date: string }[]
  showFullMonth?: boolean
}

export function StreakCalendar({
  currentStreak,
  longestStreak,
  orders,
  showFullMonth = false,
}: StreakCalendarProps) {
  // Generate calendar days
  const generateCalendarDays = (): Day[] => {
    const today = new Date()
    const days: Day[] = []
    
    // Get first day of current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    // Add padding days for previous month
    const startDay = firstDay.getDay()
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(firstDay)
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split('T')[0],
        hasOrder: orders.some(o => o.date === date.toISOString().split('T')[0]),
        isToday: false,
        isFuture: false,
      })
    }
    
    // Add current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        hasOrder: orders.some(o => o.date === dateStr),
        isToday: day === today.getDate(),
        isFuture: day > today.getDate(),
      })
    }
    
    return days
  }

  const days = generateCalendarDays()
  const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
  const today = new Date()

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">Streak ของคุณ</h3>
            <p className="text-sm text-gray-500">สั่งติดต่อกันรับโบนัสพอยต์!</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-brand-500">{currentStreak}</p>
          <p className="text-xs text-gray-500 font-bold">วันติดต่อกัน</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 p-4">
          <p className="text-2xl font-black text-brand-600">{currentStreak}</p>
          <p className="text-xs text-brand-700 font-bold">Streak ปัจจุบัน</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4">
          <p className="text-2xl font-black text-purple-600">{longestStreak}</p>
          <p className="text-xs text-purple-700 font-bold">Streak สูงสุด</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-700">
              {monthNames[today.getMonth()]} {today.getFullYear() + 543}
            </span>
          </div>
          {showFullMonth && (
            <span className="text-xs text-gray-400">แสดงทั้งเดือน</span>
          )}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center text-sm font-bold relative',
                day.isToday && 'ring-2 ring-brand-500 ring-offset-2',
                day.hasOrder && !day.isFuture
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md'
                  : day.isFuture
                    ? 'bg-gray-100 text-gray-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              )}
            >
              {day.hasOrder && !day.isFuture && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.02 + 0.2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                />
              )}
              {day.isToday && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl bg-brand-500/10"
                />
              )}
              <span>{day.date.split('-')[2]}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          <span>สั่งอาหาร</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full ring-2 ring-brand-500 ring-offset-2" />
          <span>วันนี้</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-100" />
          <span>ยังไม่สั่ง</span>
        </div>
      </div>

      {/* Streak Rewards */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-brand-500" />
          รางวัล Streak
        </h4>
        <div className="space-y-2">
          <StreakReward days={3} reward="+10 พอยต์, +1 ตั๋วหวย" achieved={currentStreak >= 3} />
          <StreakReward days={7} reward="+50 พอยต์, +2 ตั๋วหวย" achieved={currentStreak >= 7} />
          <StreakReward days={14} reward="+100 พอยต์, +3 ตั๋วหวย" achieved={currentStreak >= 14} />
          <StreakReward days={30} reward="+300 พอยต์, VIP 1 เดือน" achieved={currentStreak >= 30} />
        </div>
      </div>
    </div>
  )
}

function StreakReward({ days, reward, achieved }: { days: number; reward: string; achieved: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        achieved ? 'bg-green-50' : 'bg-gray-50'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center font-black text-sm',
        achieved ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
      )}>
        {days}
      </div>
      <div className="flex-1">
        <p className={cn(
          'text-sm font-bold',
          achieved ? 'text-green-700' : 'text-gray-500'
        )}>
          {reward}
        </p>
      </div>
      {achieved && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}

export default StreakCalendar
