import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Ticket, Calendar, Trophy, Sparkles, ChevronRight, Lock } from 'lucide-react'
import type { LottoResult } from '@/types'
import { ScratchTicket } from '@/features/lottery/components/ScratchTicket'
import { useAuthStore, useUIStore } from '@/store'
import { hapticLight, hapticHeavy, hapticMedium } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/feedback/EmptyState'
import { trackPageView } from '@/lib/analytics'
import { useUserTickets, useLottoUtils, useLatestResult } from '@/features/lottery/hooks/useLottery'
import { AuthModal } from '@/components/auth/AuthModal'

const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}
const slideUpItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}

export default function LotteryPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const { data: tickets, isLoading: ticketsLoading } = useUserTickets(user?.id)
  const { data: latestResult } = useLatestResult()
  const { getCountdown, checkWin } = useLottoUtils()

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const [activeTab, setActiveTab] = useState<'my' | 'result'>('my')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    trackPageView('/lottery', 'Lottery')
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getCountdown())
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (latestResult && tickets && tickets.length > 0) {
      const winningTickets = tickets.filter(ticket => checkWin(ticket, latestResult).isWin)
      if (winningTickets.length > 0) {
        addToast({ type: 'success', title: 'ยินดีด้วย!', message: `คุณถูกรางวัล ${winningTickets.length} ใบ จากงวดล่าสุด` })
        hapticHeavy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestResult, tickets])

  /* ── Guest View ── */
  if (isGuest || !user) {
    return (
      <div className="min-h-screen safe-area-pt flex flex-col mesh-bg-green relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full animate-glow-pulse"
            style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.20) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />
        </div>

        <Container className="py-4 relative z-10 flex-1 flex flex-col px-5">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.88 }}
            onClick={() => { hapticLight(); navigate(-1) }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center self-start cursor-pointer shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
          </motion.button>

          <div className="flex-1 flex flex-col items-center justify-center -mt-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)' }}
            >
              <Lock className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>เจาะลึกความคุ้ม!</h2>
            <p className="font-medium leading-relaxed text-center px-6 max-w-sm mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
              พื้นที่นี้สงวนไว้ให้เฉพาะสมาชิกเท่านั้น ล็อกอินผ่าน LINE เพื่อลุ้นกินฟรีทุกงวด ยิ่งสั่งมาก ยิ่งมีสิทธิ์มาก!
            </p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticHeavy()
                setIsAuthModalOpen(true)
              }}
              className="h-14 px-8 text-white rounded-[20px] font-black text-sm flex items-center gap-2 cursor-pointer shadow-md"
              style={{
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                boxShadow: '0 8px 24px rgba(34,197,94,0.30)',
              }}
            >
              เข้าสู่ระบบเพื่อดูตั๋วหวย <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </motion.button>
          </div>
        </Container>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    )
  }

  const upcomingTickets = tickets?.filter(t => new Date(t.drawDate) >= new Date()) || []
  const pastTickets = tickets?.filter(t => new Date(t.drawDate) < new Date()) || []

  return (
    <div className="min-h-screen safe-area-pt pb-32 relative overflow-hidden mesh-bg-green" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-12 w-[320px] h-[320px] rounded-full animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)', filter: 'blur(64px)' }}
        />
        <div
          className="absolute bottom-1/3 -left-12 w-[200px] h-[200px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(48px)' }}
        />
      </div>

      <Container className="py-4 relative z-10 max-w-2xl mx-auto space-y-5 px-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between pt-1">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.88 }}
            onClick={() => { hapticLight(); navigate(-1) }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center cursor-pointer shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
          </motion.button>

          <div className="text-center">
            <h1 className="text-[17px] font-black tracking-tight flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Ticket className="w-4.5 h-4.5 text-emerald-600" />
              <span>สลากกะเพรา 52</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600 mt-0.5">
              ลุ้นทุกวันที่ 1 และ 16 ของเดือน
            </p>
          </div>

          <div className="w-11" />
        </div>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-4">

          {/* ── Hero Banner ── */}
          <motion.div variants={slideUpItem}>
            <div
              className="rounded-[28px] overflow-hidden relative shine-sweep"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(22,163,74,0.20)',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(22, 163, 74, 0.1)',
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)' }}
                  >
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="pt-1">
                    <h2 className="text-xl font-black tracking-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      ลุ้นกินฟรีทุกงวด!
                    </h2>
                    <div
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-[10px]"
                      style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.20)' }}
                    >
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                        1 ออเดอร์ = สิทธิ์ลุ้น 1 ใบ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div
                  className="rounded-[20px] p-4"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    หวยจะออกในอีก
                  </p>
                  <div className="flex justify-center gap-3">
                    {[
                      { value: timeLeft.days, label: 'วัน' },
                      { value: timeLeft.hours, label: 'ชม.' },
                      { value: timeLeft.minutes, label: 'นาที' }
                    ].map((time, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                        <motion.div
                          key={time.value}
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="w-full h-[60px] rounded-[14px] flex items-center justify-center"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid rgba(22,163,74,0.20)',
                            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                          }}
                        >
                          <span className="text-3xl font-black text-emerald-600 num-display">
                            {String(time.value).padStart(2, '0')}
                          </span>
                        </motion.div>
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          {time.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Tab Switcher ── */}
          <motion.div variants={slideUpItem}>
            <div
              className="p-1 rounded-[22px] flex relative"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <motion.div
                layoutId="lottery-tab"
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[18px] z-0"
                animate={{ x: activeTab === 'my' ? '0%' : '100%' }}
                style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.18), rgba(16,185,129,0.10))', border: '1px solid rgba(74,222,128,0.25)' }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
              <button
                onClick={() => { hapticMedium(); setActiveTab('my') }}
                className={cn(
                  'flex-1 py-3.5 text-sm font-black relative z-10 transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-[18px]',
                  activeTab === 'my' ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                ตั๋วของฉัน
                {tickets && tickets.length > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-lg text-[10px] font-black"
                    style={{
                      background: activeTab === 'my' ? 'rgba(22,163,74,0.18)' : 'rgba(15,23,42,0.06)',
                      color: activeTab === 'my' ? '#16A34A' : '#64748B',
                    }}
                  >
                    {tickets.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { hapticMedium(); setActiveTab('result') }}
                className={cn(
                  'flex-1 py-3.5 text-sm font-black relative z-10 transition-colors cursor-pointer rounded-[18px]',
                  activeTab === 'result' ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                ผลรางวัล
              </button>
            </div>
          </motion.div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {activeTab === 'my' && (
                <div className="space-y-6">
                  {ticketsLoading ? (
                    <div className="flex justify-center py-20">
                      <div
                        className="w-12 h-12 border-4 rounded-full animate-spin"
                        style={{ borderColor: 'var(--border-soft)', borderTopColor: '#16A34A' }}
                      />
                    </div>
                  ) : tickets && tickets.length > 0 ? (
                    <div className="space-y-6">
                      {upcomingTickets.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-1 mb-4">
                            <span className="status-live-green" />
                            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                              รอลุ้นผล
                            </h3>
                            <span className="badge-green ml-1">{upcomingTickets.length} ใบ</span>
                          </div>
                          <div className="space-y-4">
                            {upcomingTickets.map(ticket => (
                              <TicketCard key={ticket.id} ticket={ticket} latestResult={latestResult} />
                            ))}
                          </div>
                        </div>
                      )}
                      {pastTickets.length > 0 && (
                        <div className="opacity-80">
                          <div className="flex items-center gap-2 px-1 mb-4">
                            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                              ตั๋วเก่า (ตรวจแล้ว) — {pastTickets.length} ใบ
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {pastTickets.map(ticket => (
                              <TicketCard key={ticket.id} ticket={ticket} latestResult={latestResult} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      type="custom"
                      icon={
                        <div
                          className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-6"
                          style={{ background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)' }}
                        >
                          <Ticket className="w-10 h-10 text-emerald-600" />
                        </div>
                      }
                      title="ยังไม่มีตั๋วเลย"
                      description="สั่งอาหาร 1 ออเดอร์วันนี้ รับทันทีตั๋วหวย 1 ใบ ไว้ลุ้นเป็นผู้โชคดีกินฟรีมื้อหน้า!"
                      actionLabel="สั่งเลย!"
                      onAction={() => navigate('/')}
                    />
                  )}
                </div>
              )}

              {activeTab === 'result' && (
                <div>
                  {latestResult ? (
                    <div
                      className="rounded-[28px] overflow-hidden"
                      style={{ background: 'var(--bg-card)', border: '1px solid rgba(22,163,74,0.20)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}
                    >
                      {/* Result header */}
                      <div
                        className="p-6 flex flex-col items-center justify-center text-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(16,185,129,0.04))',
                          borderBottom: '1px solid rgba(22,163,74,0.12)',
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-[18px] flex items-center justify-center mb-3"
                          style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.20)' }}
                        >
                          <Trophy className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-black mb-1.5 tracking-tight" style={{ color: 'var(--text-primary)' }}>ผลรางวัลล่าสุด</h3>
                        <span className="badge-green text-[10px]">
                          งวด {new Date(latestResult.drawDate).toLocaleDateString('th-TH')}
                        </span>
                      </div>

                      <div className="p-6 space-y-5">
                        {/* เลขท้าย 2 ตัว */}
                        <div
                          className="rounded-[22px] p-6 text-center relative overflow-hidden"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}
                        >
                          <span className="badge-green mb-4 inline-block">เลขท้าย 2 ตัว</span>
                          <div className="flex justify-center mt-3">
                            <div
                              className="w-48 h-28 rounded-[22px] flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(16,185,129,0.08))',
                                border: '1px solid rgba(74,222,128,0.30)',
                                boxShadow: '0 0 32px rgba(74,222,128,0.20)',
                              }}
                            >
                              <span className="text-7xl font-black text-gradient-green tracking-tighter num-display glow-green-text">
                                {latestResult.last2}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* เลขหน้า 3 ตัว */}
                        <div className="text-center">
                          <span className="section-label mb-4 block">เลขหน้า 3 ตัว</span>
                          <div className="flex justify-center gap-3 mt-3">
                            {latestResult.first3.map((num, idx) => (
                              <div
                                key={idx}
                                className="w-24 h-[72px] rounded-[18px] flex items-center justify-center bg-white shadow-sm"
                                style={{
                                  border: '1px solid var(--border-soft)',
                                }}
                              >
                                <span className="text-3xl font-black num-display tracking-tighter" style={{ color: 'var(--text-primary)' }}>{num}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      type="custom"
                      icon={
                        <div
                          className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-6"
                          style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.20)' }}
                        >
                          <Trophy className="w-10 h-10 text-green-400" />
                        </div>
                      }
                      title="รอประกาศผล"
                      description="ยังไม่มีผลรางวัลในขณะนี้ ประกาศผลทุกวันที่ 1 และ 16 ของเดือน"
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </motion.div>
      </Container>
    </div>
  )
}

function TicketCard({ ticket, latestResult }: { ticket: { id: number; number: string; drawDate: string; orderId: number }; latestResult: LottoResult | null | undefined }) {
  const isPast = new Date(ticket.drawDate) < new Date()
  let isWinner = false
  let prize = ''

  if (latestResult) {
    const last2Match = ticket.number.slice(-2) === latestResult.last2
    const first3Match = latestResult.first3.includes(ticket.number.slice(0, 3))
    if (first3Match && last2Match) { isWinner = true; prize = 'แจ็คพอต! ถูก 2 ท้าย + 3 หน้า' }
    else if (first3Match) { isWinner = true; prize = 'ถูกเลขหน้า 3 ตัว' }
    else if (last2Match) { isWinner = true; prize = 'กินฟรี 1 มื้อ!' }
  }

  return (
    <div
      className={cn('rounded-[28px] overflow-hidden relative', isWinner && 'ring-2 ring-amber-400/50')}
      style={{
        background: isWinner
          ? 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.06))'
          : 'var(--bg-card)',
        border: isWinner ? '1px solid rgba(251,191,36,0.30)' : '1px solid var(--border-soft)',
        boxShadow: isWinner ? '0 8px 32px rgba(251,191,36,0.20)' : 'var(--shadow-card)',
      }}
    >
      {/* Ticket cutout decorations */}
      <div className="absolute top-1/2 -mt-4 w-5 h-8 rounded-r-2xl -left-1 z-10" style={{ background: 'var(--bg-base)' }} />
      <div className="absolute top-1/2 -mt-4 w-5 h-8 rounded-l-2xl -right-1 z-10" style={{ background: 'var(--bg-base)' }} />

      <div className="p-5">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-5 pb-4"
          style={{ borderBottom: '2px dashed rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[14px] flex items-center justify-center"
              style={isWinner
                ? { background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)' }
                : { background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.20)' }
              }
            >
              <Ticket className="w-5 h-5" style={{ color: isWinner ? '#D97706' : '#16A34A' }} />
            </div>
            <span
              className="text-xs font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              #ORD-{ticket.orderId}
            </span>
          </div>

          {isWinner && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider"
              style={{
                background: 'rgba(251,191,36,0.20)',
                border: '1px solid rgba(251,191,36,0.35)',
                color: '#D97706',
                boxShadow: '0 0 16px rgba(251,191,36,0.25)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              {prize}
            </motion.div>
          )}
        </div>

        {/* Number Display */}
        <div className="flex justify-center my-6">
          {!isPast ? (
            <div className="scale-110">
              <ScratchTicket width={280} height={90} onComplete={() => hapticHeavy()}>
                <div className="flex items-center gap-2.5 w-full h-full justify-center">
                  {ticket.number.split('').map((digit, idx) => (
                    <div
                      key={idx}
                      className="w-11 h-16 rounded-[14px] flex items-center justify-center font-black text-3xl"
                      style={isWinner
                        ? {
                          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(245,158,11,0.45)',
                        }
                        : {
                          background: 'var(--bg-surface)',
                          color: '#16A34A',
                          border: '1px solid rgba(22,163,74,0.20)',
                        }
                      }
                    >
                      {digit}
                    </div>
                  ))}
                </div>
              </ScratchTicket>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {ticket.number.split('').map((digit, idx) => (
                <div
                  key={idx}
                  className="w-14 h-20 rounded-[18px] flex items-center justify-center font-black text-4xl num-display"
                  style={isWinner
                    ? {
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#fff',
                      boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
                      transform: 'scale(1.05)',
                    }
                    : {
                      background: 'var(--bg-surface)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }
                  }
                >
                  {digit}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-micro)' }}>
            Draw {new Date(ticket.drawDate).toLocaleDateString('th-TH')}
          </span>
          {isPast && !isWinner && (
            <span
              className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-micro)', border: '1px solid var(--border-subtle)' }}
            >
              No Win
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
