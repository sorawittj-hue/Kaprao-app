import { motion } from 'framer-motion'
import { Gift, Shuffle, Mic, RotateCcw, Calendar, Award } from 'lucide-react'
import { hapticMedium } from '@/utils/haptics'

interface BentoGridShowcaseProps {
  spinsLeft: number
  checkedToday?: boolean
  onOpenWheel: () => void
  onOpenRandomizer: () => void
  onOpenVoice: () => void
  onOpenQuickOrder: () => void
  onOpenCheckIn?: () => void
  onOpenRewards?: () => void
}

export function BentoGridShowcase({
  spinsLeft,
  checkedToday,
  onOpenWheel,
  onOpenRandomizer,
  onOpenVoice,
  onOpenQuickOrder,
  onOpenCheckIn,
  onOpenRewards,
}: BentoGridShowcaseProps) {
  const actions = [
    {
      id: 'wheel',
      title: 'หมุนวงล้อ',
      badge: spinsLeft > 0 ? `${spinsLeft}` : undefined,
      icon: Gift,
      color: '#EA580C',
      bgColor: '#FFF7ED',
      onClick: onOpenWheel,
    },
    {
      id: 'checkin',
      title: 'เช็คอิน',
      badge: !checkedToday ? 'แต้มฟรี' : undefined,
      icon: Calendar,
      color: '#D97706',
      bgColor: '#FEF3C7',
      onClick: onOpenCheckIn,
    },
    {
      id: 'random',
      title: 'สุ่มเมนู',
      icon: Shuffle,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      onClick: onOpenRandomizer,
    },
    {
      id: 'voice',
      title: 'สั่งด้วยเสียง',
      icon: Mic,
      color: '#0284C7',
      bgColor: '#F0F9FF',
      onClick: onOpenVoice,
    },
    {
      id: 'rewards',
      title: 'แลกพอยต์',
      icon: Award,
      color: '#DB2777',
      bgColor: '#FDF2F8',
      onClick: onOpenRewards,
    },
    {
      id: 'reorder',
      title: 'สั่งซ้ำด่วน',
      icon: RotateCcw,
      color: '#059669',
      bgColor: '#ECFDF5',
      onClick: onOpenQuickOrder,
    },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
      {actions.map((action) => {
        if (!action.onClick) return null
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              hapticMedium()
              action.onClick?.()
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border bg-white shadow-xs hover:border-slate-300 transition-all flex-shrink-0 cursor-pointer relative"
            style={{
              borderColor: 'rgba(226, 232, 240, 0.8)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: action.bgColor, color: action.color }}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            <span className="font-bold text-xs text-slate-800 whitespace-nowrap">
              {action.title}
            </span>

            {action.badge && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-500 text-white leading-none">
                {action.badge}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
