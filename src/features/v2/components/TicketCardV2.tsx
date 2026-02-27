import { motion } from 'framer-motion'
import { Ticket, Sparkles, Gift, Crown } from 'lucide-react'
import type { LottoTicketV2, LottoResultV2 } from '@/types/v2'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatDate'

interface TicketCardV2Props {
  ticket: LottoTicketV2
  result?: LottoResultV2 | null
  onClaim?: (ticketId: number) => void
}

export function TicketCardV2({ ticket, result: _result, onClaim }: TicketCardV2Props) {
  const isPast = new Date(ticket.drawDate) < new Date()

  // Check if winner
  const isWinner = ticket.status === 'won'
  const prize = ticket.prize

  // Number display
  const displayNumber = (num: string) => {
    return num.split('').map((digit, idx) => (
      <motion.div
        key={idx}
        initial={{ rotateY: 0 }}
        animate={isWinner ? { rotateY: [0, 360, 0] } : {}}
        transition={{ duration: 0.6, delay: idx * 0.1 }}
        className={cn(
          "w-8 h-10 rounded-lg flex items-center justify-center font-black text-lg",
          isWinner
            ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg'
            : 'bg-gray-100 text-gray-800'
        )}
      >
        {digit}
      </motion.div>
    ))
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'order_free': return <Gift className="w-3 h-3" />
      case 'points_purchase': return <Ticket className="w-3 h-3" />
      case 'bonus': return <Sparkles className="w-3 h-3" />
      case 'vip_monthly': return <Crown className="w-3 h-3" />
      default: return <Ticket className="w-3 h-3" />
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'order_free': return 'จากออเดอร์'
      case 'points_purchase': return 'ซื้อด้วยพอยต์'
      case 'bonus': return 'โบนัส'
      case 'streak': return 'สตรีค'
      case 'vip_monthly': return 'VIP'
      default: return source
    }
  }

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isWinner && "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20"
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getSourceIcon(ticket.source)}
            <span className="text-xs text-gray-500">
              {getSourceLabel(ticket.source)}
            </span>
          </div>

          {ticket.orderId && (
            <span className="text-xs text-gray-400">
              ออเดอร์ #{ticket.orderId}
            </span>
          )}
        </div>

        {/* Number */}
        <div className="flex items-center gap-1.5 justify-center mb-4">
          {displayNumber(ticket.number)}
        </div>

        {/* Prize Badge (if winner) */}
        {isWinner && prize && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-900 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>ถูกรางวัล!</span>
              </div>
              <p className="text-yellow-900 text-sm mt-0.5">
                กินฟรี 1 มื้อ! 🍛
              </p>

              {!prize.claimed && onClaim && (
                <Button
                  size="sm"
                  className="mt-2 w-full bg-yellow-900 text-yellow-100 hover:bg-yellow-800"
                  onClick={() => onClaim(ticket.id)}
                >
                  กดรับรางวัล
                </Button>
              )}

              {prize.claimed && (
                <p className="text-xs text-yellow-800 mt-1">
                  รับรางวัลแล้ว {formatDate(prize.claimedAt || '')}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            งวด {formatDate(ticket.drawDate)}
          </span>

          {ticket.purchasePrice > 0 && (
            <span className="text-emerald-600 font-medium">
              {ticket.purchasePrice} pts
            </span>
          )}

          {isPast && !isWinner && (
            <span className="text-gray-400">ไม่ถูกรางวัล</span>
          )}
        </div>
      </div>
    </Card>
  )
}
