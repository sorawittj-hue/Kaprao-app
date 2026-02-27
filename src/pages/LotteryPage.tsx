import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Ticket, Gift, Calendar, Trophy, Sparkles, Loader2 } from 'lucide-react'
import type { LottoResult } from '@/types'
import { useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { staggerContainer, fadeInUp } from '@/animations/variants'
import { trackPageView } from '@/lib/analytics'
import { useUserTickets, useLottoUtils, useLatestResult } from '@/features/lottery/hooks/useLottery'
import { cn } from '@/utils/cn'

export default function LotteryPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const { data: tickets, isLoading: ticketsLoading } = useUserTickets(user?.id)
  const { data: latestResult } = useLatestResult()
  const { getCountdown, checkWin } = useLottoUtils()

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [activeTab, setActiveTab] = useState<'my' | 'result'>('my')

  useEffect(() => {
    trackPageView('/lottery', 'Lottery')
  }, [])

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(getCountdown())
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check for winning tickets when results are available
  useEffect(() => {
    if (latestResult && tickets && tickets.length > 0) {
      const winningTickets = tickets.filter(ticket => checkWin(ticket, latestResult).isWin)

      if (winningTickets.length > 0) {
        addToast({
          type: 'success',
          title: '🎉 ถูกรางวัล!',
          message: `คุณถูกรางวัล ${winningTickets.length} ใบ`,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestResult, tickets])

  if (isGuest || !user) {
    return (
      <div className="min-h-screen bg-surface safe-area-pt pb-24">
        <Container className="py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-gray-800">ตั๋วหวย</h1>
          </div>

          <EmptyState
            type="generic"
            title="เข้าสู่ระบบก่อน"
            description="กรุณาเข้าสู่ระบบเพื่อดูตั๋วหวยของคุณ"
            actionLabel="เข้าสู่ระบบ"
            onAction={() => navigate('/profile')}
          />
        </Container>
      </div>
    )
  }

  const upcomingTickets = tickets?.filter(t => new Date(t.drawDate) >= new Date()) || []
  const pastTickets = tickets?.filter(t => new Date(t.drawDate) < new Date()) || []

  return (
    <div className="min-h-screen bg-surface safe-area-pt pb-24">
      <Container className="py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-gray-800">ตั๋วหวย</h1>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Hero Banner */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-emerald-600 to-indigo-600 text-white border-none overflow-hidden">
              <div className="p-6 relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg drop-shadow-sm">ลุ้นกินข้าวฟรี! 🤤</h2>
                      <p className="text-sm text-white/90">1 ออเดอร์ = 1 ตั๋ว เลขออเดอร์พารวยถูกหวยเพียบ</p>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm text-white/80 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      ประกาศผลอีก
                    </p>
                    <div className="flex gap-3">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
                          {String(timeLeft.days).padStart(2, '0')}
                        </div>
                        <p className="text-xs mt-1 text-white/70">วัน</p>
                      </div>
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <p className="text-xs mt-1 text-white/70">ชม.</p>
                      </div>
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <p className="text-xs mt-1 text-white/70">นาที</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={fadeInUp}>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('my')}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                  activeTab === 'my'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                ตั๋วของฉัน
                {tickets && tickets.length > 0 && (
                  <span className="ml-1.5 bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full text-xs">
                    {tickets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                  activeTab === 'result'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                ผลรางวัล
              </button>
            </div>
          </motion.div>

          {/* My Tickets */}
          {activeTab === 'my' && (
            <motion.div variants={fadeInUp}>
              {ticketsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {/* Upcoming Tickets */}
                  {upcomingTickets.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-emerald-500" />
                        ตั๋วที่รอลุ้น ({upcomingTickets.length})
                      </h3>
                      <div className="grid gap-3">
                        {upcomingTickets.map((ticket) => (
                          <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            latestResult={latestResult}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Tickets */}
                  {pastTickets.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        ตั๋วเก่า ({pastTickets.length})
                      </h3>
                      <div className="grid gap-3">
                        {pastTickets.map((ticket) => (
                          <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            latestResult={latestResult}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  type="generic"
                  title="ยังไม่มีตั๋ว"
                  description="สั่งอาหารวันนี้ 1 ออเดอร์ รับตั๋วหวยเลขประจำออเดอร์ 1 ใบ ไว้ลุ้นกินฟรี!"
                  actionLabel="สั่งอาหารเลย"
                  onAction={() => navigate('/')}
                />
              )}
            </motion.div>
          )}

          {/* Results */}
          {activeTab === 'result' && (
            <motion.div variants={fadeInUp}>
              {latestResult ? (
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white">
                    <h3 className="font-bold flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      ผลรางวัลล่าสุด
                    </h3>
                    <p className="text-sm text-white/80 mt-1">
                      งวดวันที่ {new Date(latestResult.drawDate).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">เลขท้าย 2 ตัว</p>
                      <div className="inline-flex items-center justify-center w-24 h-16 bg-emerald-100 rounded-xl">
                        <span className="text-3xl font-black text-emerald-600">
                          {latestResult.last2}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">เลขหน้า 3 ตัว</p>
                      <div className="flex justify-center gap-2">
                        {latestResult.first3.map((num, idx) => (
                          <div
                            key={idx}
                            className="w-20 h-14 bg-indigo-100 rounded-xl flex items-center justify-center"
                          >
                            <span className="text-2xl font-black text-indigo-600">
                              {num}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <EmptyState
                  type="generic"
                  title="ยังไม่มีผลรางวัล"
                  description="ผลรางวัลจะประกาศทุกวันที่ 1 และ 16"
                />
              )}
            </motion.div>
          )}

          {/* How to Get Tickets */}
          <motion.div variants={fadeInUp}>
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-brand-500" />
                  กติกาเลขท้ายพารวย กินฟรีอร่อยคุ้ม!
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { step: 1, text: 'สั่งอาหาร 1 ออเดอร์ รับเลยตั๋ว 1 ใบ', icon: '🛒' },
                  { step: 2, text: 'ออเดอร์เลขอะไร ได้เลขตั๋วตามเลขนั้น', icon: '🎫' },
                  { step: 3, text: 'ถูก 2 ตัวท้าย หุ้นหรือรัฐบาล ฯ รับเลย กินฟรี 1 มื้อ!', icon: '🤤' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">ขั้นตอนที่ {item.step}</p>
                      <p className="text-gray-700 font-medium">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  )
}

// Ticket Card Component
function TicketCard({
  ticket,
  latestResult
}: {
  ticket: { id: number; number: string; drawDate: string; orderId: number }
  latestResult: LottoResult | null | undefined
}) {
  const isPast = new Date(ticket.drawDate) < new Date()

  // Check if won unconditionally using latestResult for testability
  let isWinner = false
  let prize = ''
  if (latestResult) {
    const last2Match = ticket.number.slice(-2) === latestResult.last2
    const first3Match = latestResult.first3.includes(ticket.number.slice(0, 3))

    if (first3Match && last2Match) {
      isWinner = true
      prize = 'ทายถูกเลขท้าย 2 ตัว และ 3 ตัวหน้า! 🎉'
    } else if (first3Match) {
      isWinner = true
      prize = 'ทายถูกเลขหน้า 3 ตัว'
    } else if (last2Match) {
      isWinner = true
      prize = 'กินข้าวฟรี 1 มื้อ! 🤤'
    }
  }

  return (
    <Card className={cn(
      'overflow-hidden',
      isWinner && 'ring-2 ring-yellow-400'
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket className={cn(
              'w-5 h-5',
              isWinner ? 'text-yellow-500' : 'text-emerald-500'
            )} />
            <span className="text-xs text-gray-500">
              ออเดอร์ #{ticket.orderId}
            </span>
          </div>
          {isWinner && (
            <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {prize}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {ticket.number.split('').map((digit, idx) => (
            <div
              key={idx}
              className={cn(
                'w-10 h-12 rounded-lg flex items-center justify-center font-black text-xl',
                isWinner
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {digit}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            งวด {new Date(ticket.drawDate).toLocaleDateString('th-TH')}
          </span>
          {isPast && !isWinner && (
            <span className="text-xs text-gray-400">ไม่ถูกรางวัล</span>
          )}
        </div>
      </div>
    </Card>
  )
}
