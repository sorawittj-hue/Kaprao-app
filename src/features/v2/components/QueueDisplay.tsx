import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import type { QueueInfo, QueueStatus } from '@/types/v2'
import { cn } from '@/utils/cn'

interface QueueDisplayProps {
  queue?: QueueInfo
  status?: QueueStatus
  compact?: boolean
}

export function QueueDisplay({ queue, status, compact = false }: QueueDisplayProps) {
  if (!queue && !status) return null

  const display = queue?.display || status?.queueDisplay
  const type = queue?.type || status?.queueType
  const estimatedMinutes = queue?.estimatedMinutes || status?.estimatedMinutes || 15
  const ordersAhead = status?.ordersAhead ?? 0

  const getTypeColor = (t?: string) => {
    switch (t) {
      case 'A': return 'from-blue-500 to-blue-600'
      case 'B': return 'from-green-500 to-green-600'
      case 'C': return 'from-purple-500 to-purple-600'
      case 'D': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTypeLabel = (t?: string) => {
    switch (t) {
      case 'A': return 'ส่งที่ทำงาน'
      case 'B': return 'ส่งในหมู่บ้าน'
      case 'C': return 'รับที่ร้าน'
      case 'D': return 'จองล่วงหน้า'
      default: return 'คิว'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "px-2 py-0.5 rounded text-xs font-bold text-white bg-gradient-to-r",
          getTypeColor(type)
        )}>
          {display}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~{estimatedMinutes} นาที
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      <div className={cn(
        "rounded-2xl p-6 text-white bg-gradient-to-br overflow-hidden",
        getTypeColor(type)
      )}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <p className="text-white/80 text-sm mb-1">{getTypeLabel(type)}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-5xl font-black tracking-wider">{display}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <Clock className="w-4 h-4" />
                <span>~{estimatedMinutes} นาที</span>
              </div>
              {ordersAhead > 0 && (
                <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                  <Users className="w-3 h-3" />
                  <span>อีก {ordersAhead} คิว</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
