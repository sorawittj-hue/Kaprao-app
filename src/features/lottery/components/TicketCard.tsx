import { motion } from 'framer-motion'
import type { LottoTicket } from '@/types'
import { cn } from '@/utils/cn'

interface TicketCardProps {
  ticket: LottoTicket
  isWinner?: boolean
}

export function TicketCard({ ticket, isWinner }: TicketCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400',
        'text-white shadow-lg'
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">ตั๋วหวย #{ticket.id}</p>
            <p className="text-white/60 text-xs">
              จากออเดอร์ #{ticket.orderId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">งวดวันที่</p>
            <p className="font-bold">
              {new Date(ticket.drawDate).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Number */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm mb-2">เลขท้าย 2 ตัว</p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={cn(
              'inline-flex items-center justify-center',
              'bg-white text-orange-500',
              'px-8 py-3 rounded-2xl'
            )}
          >
            <span className="text-4xl font-black tracking-wider">
              {ticket.number}
            </span>
          </motion.div>
        </div>

        {/* Status */}
        {isWinner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-bold">
              🎉 ถูกรางวัล!
            </span>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full" />
      <div className="absolute bottom-4 right-4 w-3 h-3 bg-white/20 rounded-full" />
    </motion.div>
  )
}
