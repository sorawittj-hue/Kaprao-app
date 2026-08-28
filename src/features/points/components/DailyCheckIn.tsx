import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Sparkles, Check, X, Flame } from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useAddPoints } from '../hooks/usePoints'
import { hapticHeavy, hapticLight } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import confetti from 'canvas-confetti'

interface CheckInState {
  lastDate: string
  streak: number
  totalClaimed: number
}

const STORAGE_KEY = 'kaprao_daily_checkin_state'

const DAILY_REWARDS = [
  { day: 1, points: 5, label: '+5 pts' },
  { day: 2, points: 5, label: '+5 pts' },
  { day: 3, points: 10, label: '+10 pts' },
  { day: 4, points: 10, label: '+10 pts' },
  { day: 5, points: 15, label: '+15 pts' },
  { day: 6, points: 15, label: '+15 pts' },
  { day: 7, points: 25, label: '+25 pts 🎁', isGrand: true },
]

export function getCheckInState(): CheckInState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { lastDate: '', streak: 0, totalClaimed: 0 }
  } catch {
    return { lastDate: '', streak: 0, totalClaimed: 0 }
  }
}

export function isCheckedInToday(): boolean {
  const state = getCheckInState()
  const today = new Date().toISOString().slice(0, 10)
  return state.lastDate === today
}

export function DailyCheckInModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const addPointsMutation = useAddPoints()

  const [state, setState] = useState<CheckInState>(getCheckInState())
  const [claimedToday, setClaimedToday] = useState(isCheckedInToday())

  useEffect(() => {
    setState(getCheckInState())
    setClaimedToday(isCheckedInToday())
  }, [isOpen])

  if (!isOpen) return null

  const today = new Date().toISOString().slice(0, 10)

  const handleClaim = async () => {
    if (claimedToday) return

    hapticHeavy()

    // Determine new streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let newStreak = 1
    if (state.lastDate === yesterday) {
      newStreak = state.streak + 1
    }

    const dayIndex = (newStreak - 1) % 7
    const reward = DAILY_REWARDS[dayIndex]

    try {
      if (user?.id) {
        await addPointsMutation.mutateAsync({
          userId: user.id,
          amount: reward.points,
          action: 'EARN',
          note: `เช็คอินวันที่ ${reward.day}`,
        })
      }

      useAuthStore.getState().addPoints(reward.points)

      const newState: CheckInState = {
        lastDate: today,
        streak: newStreak,
        totalClaimed: state.totalClaimed + reward.points,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      setState(newState)
      setClaimedToday(true)

      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#FF5500', '#FBBF24', '#10B981'],
      })

      addToast({
        type: 'success',
        title: 'เช็คอินสำเร็จ!',
        message: `ได้รับ +${reward.points} พอยต์ (Streak ${newStreak} วัน)`,
      })
    } catch {
      addToast({ type: 'error', title: 'เกิดข้อผิดพลาดในการเช็คอิน' })
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60"
          style={{ backdropFilter: 'blur(16px)' }}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="w-full max-w-sm bg-white rounded-[32px] p-6 relative z-10 shadow-2xl space-y-5 text-center"
          style={{ background: 'var(--bg-base)' }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              hapticLight()
              onClose()
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Celebration Header */}
          <div>
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/25 text-white">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="font-black text-xl text-slate-900">เช็คอินรับแต้มฟรี</h3>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span className="text-xs font-black">
                สะสมต่อเนื่อง {state.streak} วัน
              </span>
            </div>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-4 gap-2">
            {DAILY_REWARDS.map((item, idx) => {
              const isPast = (state.streak % 7) > idx || (state.streak % 7 === 0 && state.streak > 0 && claimedToday)
              const isToday = (state.streak % 7) === idx && !claimedToday

              return (
                <div
                  key={item.day}
                  className={cn(
                    'p-2.5 rounded-[18px] border flex flex-col items-center justify-center relative transition-all',
                    item.isGrand ? 'col-span-2' : 'col-span-1',
                    isPast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : isToday
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-md ring-2 ring-amber-400/50 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400'
                  )}
                >
                  <span className="text-[10px] font-black uppercase mb-1">
                    วันที่ {item.day}
                  </span>

                  {isPast ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center my-0.5">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                  ) : item.isGrand ? (
                    <span className="text-xl my-0.5">🎁</span>
                  ) : (
                    <Sparkles className={cn('w-5 h-5 my-0.5', isToday ? 'text-amber-500' : 'text-slate-300')} />
                  )}

                  <span className="text-[10px] font-black mt-0.5">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Claim CTA Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            disabled={claimedToday}
            onClick={handleClaim}
            className={cn(
              'w-full py-4 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md',
              claimedToday
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-500/30 hover:shadow-lg'
            )}
          >
            {claimedToday ? (
              <>
                <Check className="w-4 h-4" />
                <span>เช็คอินวันนี้แล้ว</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>กดรับแต้มวันนี้!</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
