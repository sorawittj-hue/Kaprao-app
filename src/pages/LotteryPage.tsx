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

// Premium Animation Variants
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

  useEffect(() => {
    trackPageView('/lottery', 'Lottery')
    window.scrollTo(0, 0)
  }, [])

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => setTimeLeft(getCountdown())
    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check for winning tickets
  useEffect(() => {
    if (latestResult && tickets && tickets.length > 0) {
      const winningTickets = tickets.filter(ticket => checkWin(ticket, latestResult).isWin)
      if (winningTickets.length > 0) {
        addToast({ type: 'success', title: '🎉 ยินดีด้วย!', message: `คุณถูกรางวัล ${winningTickets.length} ใบ จากงวดล่าสุด` })
        hapticHeavy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestResult, tickets])

  if (isGuest || !user) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] safe-area-pt flex flex-col items-center">
        <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-emerald-50 to-transparent pointer-events-none z-0" />
        <Container className="py-4 relative z-10 flex-1 flex flex-col px-6">
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticLight(); navigate(-1); }} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 self-start">
             <ArrowLeft className="w-5 h-5" />
           </motion.button>
             
           <div className="flex-1 flex flex-col items-center justify-center -mt-20">
             <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
                <Lock className="w-10 h-10 text-emerald-500" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">เจาะลึกความคุ้ม!</h2>
             <p className="text-gray-500 text-sm font-medium leading-relaxed text-center px-6 max-w-sm mb-8">
               พื้นที่นี้สงวนไว้ให้เฉพาะสมาชิกเท่านั้น ล็อกอินผ่าน LINE เพื่อลุ้นกินฟรีทุกงวด ยิ่งสั่งมาก ยิ่งมีสิทธิ์มาก!
             </p>
             <button onClick={() => { hapticHeavy(); navigate('/profile'); }} className="h-14 px-8 bg-gray-900 text-white rounded-[20px] shadow-md font-black text-sm active:scale-95 transition-transform flex items-center gap-2">
                เข้าสู่ระบบผ่าน LINE <ChevronRight className="w-4 h-4" />
             </button>
           </div>
        </Container>
      </div>
    )
  }

  const upcomingTickets = tickets?.filter(t => new Date(t.drawDate) >= new Date()) || []
  const pastTickets = tickets?.filter(t => new Date(t.drawDate) < new Date()) || []

  return (
    <div className="min-h-screen bg-[#F4F4F5] safe-area-pt pb-32 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none z-0" />

      <Container className="py-4 relative z-10 max-w-2xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between sticky top-4 z-50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticLight(); navigate(-1); }} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none drop-shadow-sm">สลากกะเพรา 52</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              ลุ้นทุกวันที่ 1 และ 16 ของเดือน
            </p>
          </div>

          <div className="w-12" /> {/* Spacer */}
        </div>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6">
          
          {/* Hero Banner Clean */}
          <motion.div variants={slideUpItem} className="relative group">
            <div className="bg-white rounded-[32px] p-1 border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="p-6 relative z-10">
                <div className="flex items-start gap-4 mb-6">
                   <div className="w-14 h-14 rounded-[20px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                      <Trophy className="w-6 h-6" />
                   </div>
                   <div className="pt-1">
                      <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 line-clamp-2">
                        ลุ้นกินฟรีทุกงวด! <span className="animate-bounce inline-block" style={{ animationDuration: '3s' }}>🤤</span>
                      </h2>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg w-fit">1 ออเดอร์ = สิทธิ์ลุ้น 1 ใบ</p>
                   </div>
                </div>

                {/* Countdown Timer */}
                <div className="bg-gray-50 rounded-[24px] p-5 border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" /> หวยจะออกในอีก
                  </p>
                  <div className="flex justify-center gap-3">
                    {[
                       { value: timeLeft.days, label: 'วัน' },
                       { value: timeLeft.hours, label: 'ชม.' },
                       { value: timeLeft.minutes, label: 'นาที' }
                    ].map((time, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="w-full h-16 bg-white rounded-[16px] shadow-sm border border-gray-100 flex items-center justify-center mb-2">
                           <span className="text-3xl font-black text-gray-800">{String(time.value).padStart(2, '0')}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{time.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Premium iOS-style Concept Tabs */}
          <motion.div variants={slideUpItem} className="bg-black/5 backdrop-blur-sm p-1.5 rounded-[28px] flex relative border border-white/10 shadow-inner overflow-hidden max-w-sm mx-auto">
             <motion.div 
               layoutId="active-tab"
               className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[22px] shadow-lg border border-black/5"
               animate={{ x: activeTab === 'my' ? '0%' : '100%' }}
               transition={{ type: "spring", stiffness: 450, damping: 30 }}
             />
             <button
               onClick={() => { hapticMedium(); setActiveTab('my'); }}
               className={cn("flex-1 py-4 text-sm font-black relative z-10 transition-colors duration-300 flex items-center justify-center gap-2", activeTab === 'my' ? "text-emerald-900" : "text-gray-400 hover:text-white")}
             >
                ตั๋วของฉัน
                {tickets && tickets.length > 0 && <span className={cn("px-2 py-0.5 rounded-lg text-[10px] shadow-sm", activeTab === 'my' ? "bg-emerald-100 text-emerald-700" : "bg-black/20 text-white")}>{tickets.length}</span>}
             </button>
             <button
               onClick={() => { hapticMedium(); setActiveTab('result'); }}
               className={cn("flex-1 py-4 text-sm font-black relative z-10 transition-colors duration-300", activeTab === 'result' ? "text-emerald-900" : "text-gray-400 hover:text-white")}
             >
                ผลรางวัล
             </button>
          </motion.div>

          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, scale: 0.98, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.98, y: -20 }}
               transition={{ type: "spring", stiffness: 400, damping: 30 }}
             >
                {activeTab === 'my' && (
                  <div className="space-y-8">
                     {ticketsLoading ? (
                       <div className="flex justify-center py-20">
                          <div className="w-12 h-12 border-4 rounded-full border-emerald-500 border-t-transparent animate-spin" />
                       </div>
                     ) : tickets && tickets.length > 0 ? (
                       <div className="space-y-8">
                          {upcomingTickets.length > 0 && (
                            <div>
                               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                                 ✨ รอลุ้นผล <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px]">{upcomingTickets.length}</span>
                               </h3>
                               <div className="space-y-4">
                                  {upcomingTickets.map(ticket => (
                                     <TicketCard key={ticket.id} ticket={ticket} latestResult={latestResult} />
                                  ))}
                               </div>
                            </div>
                          )}

                          {pastTickets.length > 0 && (
                            <div className="opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500">
                               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2 pt-4 border-t border-gray-200/50">
                                 📅 ตั๋วเก่า (ตรวจแล้ว)
                               </h3>
                               <div className="space-y-4">
                                  {pastTickets.map(ticket => (
                                     <TicketCard key={ticket.id} ticket={ticket} latestResult={latestResult} />
                                  ))}
                               </div>
                            </div>
                          )}
                       </div>
                     ) : (
                       <EmptyState type="custom" icon={<div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl mb-6"><Ticket className="w-10 h-10 text-emerald-500" /></div>} title="ยังไม่มีตั๋วเลย" description="สั่งอาหาร 1 ออเดอร์วันนี้ รับทันทีตั๋วหวย 1 ใบ ไว้ลุ้นเป็นผู้โชคดีกินฟรีมื้อหน้า!" actionLabel="สั่งเลย!" onAction={() => navigate('/')} />
                     )}
                  </div>
                )}

                {activeTab === 'result' && (
                  <div>
                    {latestResult ? (
                      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white">
                         <div className="bg-emerald-50 border border-emerald-100 p-8 relative flex flex-col items-center justify-center text-center">
                            <Trophy className="w-10 h-10 text-emerald-500 mb-3 relative z-10" />
                            <h3 className="text-lg font-black text-gray-900 mb-1 relative z-10 tracking-tight">ผลรางวัลล่าสุด</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-gray-100 relative z-10">
                              งวด {new Date(latestResult.drawDate).toLocaleDateString('th-TH')}
                            </p>
                         </div>
                         
                         <div className="p-8 space-y-8 bg-[#FAFAF9]">
                            {/* เลขท้าย 2 ตัว */}
                            <div className="bg-white rounded-[32px] p-8 text-center shadow-lg shadow-black/5 border border-indigo-50 relative overflow-hidden group">
                               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100 opacity-0 transition-opacity" />
                               <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-xl uppercase tracking-widest mb-6 inline-block shadow-sm">
                                  เลขท้าย 2 ตัว
                               </span>
                               <div className="flex justify-center">
                                  <div className="w-48 h-32 bg-gradient-to-b from-white to-gray-50 rounded-[28px] shadow-inner border border-gray-100 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                                     <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-emerald-400 tracking-tighter">
                                        {latestResult.last2}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            
                            {/* เลขหน้า 3 ตัว */}
                            <div className="text-center pt-2">
                               <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 inline-block">เลขหน้า 3 ตัว</span>
                               <div className="flex justify-center gap-4">
                                 {latestResult.first3.map((num, idx) => (
                                    <div key={idx} className="w-28 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 transform hover:scale-105 transition-transform">
                                       <span className="text-3xl font-black text-indigo-800 tracking-tighter">{num}</span>
                                    </div>
                                 ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    ) : (
                      <EmptyState type="custom" icon={<div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl mb-6"><Trophy className="w-10 h-10 text-emerald-500" /></div>} title="รอประกาศผล" description="ยังไม่มีผลรางวัลในขณะนี้ ประกาศผลทุกวันที่ 1 และ 16 ของเดือน" />
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
    if (first3Match && last2Match) { isWinner = true; prize = 'แจ็คพอต: ถูก 2 ท้าย และ 3 หน้า! 🎉' }
    else if (first3Match) { isWinner = true; prize = 'ถูกเลขหน้า 3 ตัว' }
    else if (last2Match) { isWinner = true; prize = 'กินฟรี 1 มื้อ! 🤤' }
  }

  return (
    <div className={cn(
       "bg-white rounded-[32px] shadow-sm overflow-hidden relative border",
       isWinner ? "border-yellow-200 ring-4 ring-yellow-400/20" : "border-gray-100"
    )}>
       {isWinner && <div className="absolute inset-0 bg-yellow-50/50 pointer-events-none" />}
       
       {/* Cutouts */}
       <div className="absolute top-1/2 -mt-4 w-6 h-8 bg-[#F4F4F5] rounded-r-2xl -left-1 border-r border-y border-black/5 shadow-inner z-10" />
       <div className="absolute top-1/2 -mt-4 w-6 h-8 bg-[#F4F4F5] rounded-l-2xl -right-1 border-l border-y border-black/5 shadow-inner z-10" />

       <div className="p-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-dashed border-gray-100">
             <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isWinner ? "bg-yellow-100 text-yellow-600" : "bg-emerald-50 text-emerald-500")}>
                   <Ticket className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase text-gray-500 tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  #ORD-{ticket.orderId}
                </span>
             </div>
             {isWinner && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[11px] font-black text-yellow-800 bg-yellow-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm uppercase tracking-wider relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
                   <Sparkles className="w-3.5 h-3.5" />
                   {prize}
                </motion.div>
             )}
          </div>

          <div className="flex justify-center my-8">
             {!isPast ? (
                <div className="scale-110">
                   <ScratchTicket width={280} height={90} onComplete={() => hapticHeavy()}>
                     <div className="flex items-center gap-3 w-full h-full justify-center">
                        {ticket.number.split('').map((digit, idx) => (
                          <div key={idx} className={cn("w-12 h-16 rounded-[16px] flex items-center justify-center font-black text-3xl shadow-sm border border-black/5", isWinner ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-500/40" : "bg-white text-emerald-800")}>
                             {digit}
                          </div>
                        ))}
                     </div>
                   </ScratchTicket>
                </div>
             ) : (
                <div className="flex items-center gap-3">
                   {ticket.number.split('').map((digit, idx) => (
                     <div key={idx} className={cn("w-14 h-20 rounded-[20px] flex items-center justify-center font-black text-4xl shadow-sm border border-black/5", isWinner ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-500/40 transform scale-105" : "bg-gray-50 text-gray-400")}>
                        {digit}
                     </div>
                   ))}
                </div>
             )}
          </div>

          <div className="mt-4 flex items-center justify-between">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
               Draw {new Date(ticket.drawDate).toLocaleDateString('th-TH')}
             </span>
             {isPast && !isWinner && (
               <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-md uppercase tracking-wider">No Win</span>
             )}
          </div>
       </div>
    </div>
  )
}
