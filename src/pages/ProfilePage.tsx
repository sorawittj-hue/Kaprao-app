import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Ticket,
  Clock,
  LogOut,
  ChevronRight,
  Gift,
  Settings,
  HelpCircle,
  Shield,
  X,
  Smartphone,
  RefreshCw,
  ShieldAlert,
  Crown,
  Medal,
  Award,
  CircleDashed,
  Target
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { logout, loginWithLine } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useUserPoints, usePointsCalculator, useRedeemPoints } from '@/features/points/hooks/usePoints'
import { StreakTracker } from '@/features/points/components/StreakTracker'
import { getUserGamification, UserGamificationState } from '@/features/gamification/GamificationEngine'
import { trackPageView } from '@/lib/analytics'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { useSEO } from '@/hooks/useSEO'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/utils/cn'

const tierConfig = {
  MEMBER: { bgTop: '#A8A29E', bgBottom: '#78716C', icon: <CircleDashed className="w-8 h-8"/>, glow: 'rgba(120, 113, 108, 0.4)', label: 'สมาชิกเริ่มต้น' },
  SILVER: { bgTop: '#94A3B8', bgBottom: '#475569', icon: <Medal className="w-8 h-8"/>, glow: 'rgba(71, 85, 105, 0.4)', label: 'ระดับเงิน' },
  GOLD: { bgTop: '#FBBF24', bgBottom: '#D97706', icon: <Award className="w-8 h-8"/>, glow: 'rgba(217, 119, 6, 0.5)', label: 'ระดับทอง' },
  VIP: { bgTop: '#10B981', bgBottom: '#047857', icon: <Crown className="w-8 h-8"/>, glow: 'rgba(4, 120, 87, 0.5)', label: 'ลูกค้าระดับ VIP' },
}

type MenuItemConfig = {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick: () => void
  iconBg: string
  iconColor: string
}

const slideUpItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isGuest, isLoading: authLoading } = useAuthStore()
  const { addToast } = useUIStore()

  const [activeModal, setActiveModal] = useState<'points' | 'rewards' | 'settings' | 'help' | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const { mutateAsync: redeemPoints } = useRedeemPoints()

  const [notifOrders, setNotifOrders] = useLocalStorage('kaprao_settings_notif_orders', true)
  const [notifPromos, setNotifPromos] = useLocalStorage('kaprao_settings_notif_promos', false)
  const [haptics, setHaptics] = useLocalStorage('kaprao_settings_haptics', true)

  const isRealUser = !!user?.id && !!user?.lineUserId
  const { data: serverPoints, isLoading: pointsLoading } = useUserPoints(isRealUser ? user!.id : undefined)
  const { getTier, getNextTier, tiers } = usePointsCalculator()
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false)

  const isAdmin = useMemo(() => {
    if (user?.isAdmin) return true
    if (!user?.lineUserId) return false
    const allowedIds = (import.meta.env.VITE_ADMIN_LINE_IDS || '').split(',').filter(Boolean)
    return allowedIds.includes(user.lineUserId)
  }, [user?.isAdmin, user?.lineUserId])

  useEffect(() => {
    trackPageView('/profile', 'Profile')
    window.scrollTo(0, 0)
  }, [])

  useSEO({ title: 'ข้อมูลส่วนตัว', description: 'จัดการข้อมูลส่วนตัว พอยต์ และรางวัลของคุณที่ กะเพรา 52' })

  const [gameState, setGameState] = useState<UserGamificationState | null>(null)

  useEffect(() => {
    if (user?.id) {
      const engine = getUserGamification(user.id)
      setGameState(engine.getState())
      const handler = () => setGameState(engine.getState())
      engine.on('levelUp', handler)
      engine.on('xpGained', handler)
      engine.on('achievementUnlocked', handler)
      return () => {
        engine.off('levelUp', handler)
        engine.off('xpGained', handler)
        engine.off('achievementUnlocked', handler)
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (serverPoints !== undefined && user && serverPoints !== user.points) {
      useAuthStore.getState().updatePoints(serverPoints)
    }
  }, [serverPoints, user])

  const handleLogout = async () => {
    hapticMedium()
    await logout()
    navigate('/')
    addToast({ type: 'info', title: 'ออกจากระบบแล้ว 👋' })
  }

  const handleLineLogin = async () => {
    hapticHeavy()
    try { await loginWithLine() }
    catch { addToast({ type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง' }) }
  }

  const handleMakeMeAdmin = async () => {
    hapticHeavy()
    if (!isRealUser || !user?.id) return
    setIsUpdatingAdmin(true)
    try {
      const { error } = await supabase.from('profiles').update({ is_admin: true } as any).eq('id', user.id)
      if (error) throw error
      addToast({ type: 'success', title: 'อัปเกรดเรียบร้อย! 🎉', message: 'คุณได้รับสิทธิ์ Admin แล้ว' })
      useAuthStore.getState().setUser({ ...user, isAdmin: true })
    } catch (err) {
      addToast({ type: 'error', title: 'ไม่สามารถอัปเกรดได้' })
    } finally {
      setIsUpdatingAdmin(false)
    }
  }

  const isLoading = authLoading || (isRealUser && pointsLoading)
  const userPoints = serverPoints ?? user?.points ?? 0
  const userTier = getTier(userPoints)
  const nextTier = getNextTier(userPoints)
  const tierInfo = tiers[userTier]
  const tier = tierConfig[userTier as keyof typeof tierConfig] ?? tierConfig.MEMBER
  const progressPct = nextTier ? Math.min(100, (userPoints / (userPoints + nextTier.pointsNeeded)) * 100) : 100

  const menuItems: MenuItemConfig[] = [
    { icon: Clock, label: 'ประวัติการสั่งซื้อ', onClick: () => { hapticLight(); navigate('/orders') }, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { icon: Ticket, label: 'ตั๋วหวยของฉัน', onClick: () => { hapticLight(); navigate('/lottery') }, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { icon: Star, label: 'ระดับสมาชิกของคุณ', sublabel: `สถานะ: ${tierInfo?.name || 'MEMBER'}`, onClick: () => { hapticLight(); setActiveModal('points') }, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { icon: Gift, label: 'แลกของรางวัล', sublabel: 'สิทธิพิเศษตามพอยต์ที่มี', onClick: () => { hapticLight(); setActiveModal('rewards') }, iconBg: 'bg-rose-500/10', iconColor: 'text-rose-500' },
  ]

  const settingsItems: MenuItemConfig[] = [
    { icon: Settings, label: 'การตั้งค่าระบบ', onClick: () => { hapticLight(); setActiveModal('settings') }, iconBg: 'bg-gray-500/10', iconColor: 'text-gray-600' },
    { icon: HelpCircle, label: 'ต้องการความช่วยเหลือ', onClick: () => { hapticLight(); setActiveModal('help') }, iconBg: 'bg-gray-500/10', iconColor: 'text-gray-600' },
    ...(isAdmin ? [{ icon: Shield, label: 'จัดการหลังบ้าน (Admin)', sublabel: 'ตั้งค่าร้านค้า เมนู ออเดอร์', onClick: () => { hapticLight(); navigate('/admin') }, iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-32">
      {/* Clean Header Aesthetic */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-gray-100 to-[#F4F4F5] pointer-events-none z-0 rounded-b-[48px]" />

      <Container className="py-4 relative z-10 px-5 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight drop-shadow-sm sticky top-4 mb-2">My Profile</h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
             <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          </div>
        ) : (
          <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6">
            
            {/* Membership Card (Holographic Design) */}
            <motion.div variants={slideUpItem} className="relative z-10" style={{ perspective: 1000 }}>
              {isGuest || !user ? (
                <div className="rounded-[32px] overflow-hidden p-6 bg-white shadow-xl shadow-black/5 border border-white">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl shadow-inner border border-gray-200">
                      👤
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-800 leading-tight">โปรไฟล์ผู้เยี่ยมชม</h2>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mt-2 bg-gray-50 border border-gray-100">
                        <Star className="w-3 h-3 text-gray-400" />
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Guest Account</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  className="rounded-[32px] overflow-hidden p-6 relative border border-gray-100 bg-white"
                  style={{
                    boxShadow: `0 20px 40px -15px ${tier.glow}`,
                  }}
                  whileHover={{ rotateX: 2, rotateY: 2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-gray-50 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                         {user.pictureUrl ? <img src={user.pictureUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>}
                       </div>
                       <div>
                         <h2 className="text-xl font-black text-gray-900 tracking-tight">{user.displayName}</h2>
                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-1.5 bg-gray-50 border border-gray-100 text-gray-700">
                            {tier.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{tier.label}</span>
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                     <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-gray-900">
                        <span className="text-xl font-black">{userPoints}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Points</span>
                     </div>
                     <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-gray-900">
                        <span className="text-xl font-black">{user.totalOrders || 0}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Orders</span>
                     </div>
                     <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center justify-center text-gray-900">
                        <span className="text-xl font-black">Lvl{gameState?.level || 1}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rank</span>
                     </div>
                  </div>

                  {nextTier && (
                    <div className="bg-gray-50 rounded-[20px] p-4 border border-gray-100 relative z-10">
                       <div className="flex justify-between items-end mb-2 text-gray-800">
                         <span className="text-[10px] font-bold uppercase tracking-wider">Progress to {nextTier.name}</span>
                         <span className="text-[10px] font-black">{nextTier.pointsNeeded} pts left</span>
                       </div>
                       <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} className="h-full bg-gray-800 rounded-full" />
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Streak & Achievements */}
            {!isGuest && user?.displayName !== 'Guest' && (
               <motion.div variants={slideUpItem} className="space-y-4">
                  <StreakTracker currentStreak={gameState?.currentStreak || 0} longestStreak={gameState?.longestStreak || 0} lastOrderDate={new Date().toISOString()} />
                  
                  {gameState?.achievements && gameState.achievements.length > 0 && (
                     <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm">
                             <Target className="w-5 h-5 text-[#FF6B00]" /> ภารกิจ & ความสำเร็จ
                           </h3>
                           <span className="text-[10px] font-black text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded-full">{gameState.achievements.filter(a => a.progress >= a.maxProgress).length} Unlocked</span>
                        </div>
                        <div className="space-y-3">
                           {gameState.achievements.map((acc, i) => {
                             const isUnlocked = acc.progress >= acc.maxProgress;
                             const pct = Math.min(100, (acc.progress/acc.maxProgress)*100);
                             return (
                               <div key={i} className={cn("p-4 rounded-2xl flex gap-4 transition-all border", isUnlocked ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50 border-gray-100")}>
                                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white flex-shrink-0", isUnlocked ? "bg-white" : "bg-gray-200 grayscale opacity-40")}>
                                     {acc.icon}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className={cn("font-black text-sm", isUnlocked ? "text-gray-800" : "text-gray-500")}>{acc.name}</h4>
                                    <p className="text-[11px] text-gray-400 mt-1 mb-2 leading-snug">{acc.description}</p>
                                    {!isUnlocked ? (
                                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                         <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-black text-emerald-600 bg-white shadow-sm border border-emerald-50 px-2 py-0.5 rounded-md inline-block">+{acc.reward.points} Pts</span>
                                    )}
                                  </div>
                               </div>
                             )
                           })}
                        </div>
                     </div>
                  )}
               </motion.div>
            )}

            {/* Guest Promo */}
             {(isGuest || !user) && (
               <motion.div variants={slideUpItem}>
                  <div className="bg-white rounded-[32px] p-6 text-gray-900 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#00B900]/10 text-[#00B900] rounded-full flex items-center justify-center mb-4">
                       <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-xl mb-2 text-gray-900">อัปเกรดบัญชีฟรี! 🎉</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6">เชื่อมต่อกับ LINE วันนี้ รับพอยต์ทันที ลุ้นหวยกินฟรี และแลกของรางวัลได้ไม่อั้น!</p>
                    <button onClick={handleLineLogin} className="w-full bg-[#00B900] text-white font-black text-sm py-4 rounded-[24px] shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
                       เข้าสู่ระบบผ่าน LINE อย่างรวดเร็ว
                    </button>
                  </div>
               </motion.div>
             )}

            <motion.div variants={slideUpItem}>
               <MenuSection title="เมนูหลัก" items={menuItems} />
            </motion.div>

            <motion.div variants={slideUpItem}>
               <MenuSection title="ระบบและการตั้งค่า" items={settingsItems} />
            </motion.div>

            {isRealUser && !isAdmin && (
              <motion.div variants={slideUpItem}>
                 <button disabled={isUpdatingAdmin} onClick={handleMakeMeAdmin} className="w-full py-4 text-xs font-black text-orange-600 bg-orange-50 rounded-[24px] border border-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    {isUpdatingAdmin ? <RefreshCw className="w-4 h-4 animate-spin"/> : <ShieldAlert className="w-4 h-4"/>}
                    {isUpdatingAdmin ? 'Processing...' : 'เรียกใช้สิทธิ์ Admin'}
                 </button>
              </motion.div>
            )}

            <motion.div variants={slideUpItem}>
               <button onClick={handleLogout} className="w-full py-4 text-sm font-black text-red-500 bg-white rounded-[24px] border border-gray-100 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
               </button>
            </motion.div>
          </motion.div>
        )}
      </Container>


      {/* Modals Deep UX Design */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end p-2 sm:p-6 pb-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 100 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white rounded-[40px] w-full max-w-lg mx-auto relative z-10 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
               <div className="p-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                  <h3 className="font-black text-gray-900 text-xl tracking-tight">
                    {activeModal === 'points' && 'ระดับสมาชิก'}
                    {activeModal === 'rewards' && 'แลกของรางวัล'}
                    {activeModal === 'settings' && 'ตั้งค่าระบบ'}
                    {activeModal === 'help' && 'ช่วยเหลือ'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                     <X className="w-5 h-5"/>
                  </button>
               </div>
               
               <div className="overflow-y-auto p-6 flex-1 bg-[#FAFAF9] hide-scrollbar">
                  {/* Content for Points Modal */}
                  {activeModal === 'points' && (
                     <div className="space-y-4">
                        <p className="text-gray-500 text-sm font-medium mb-6">สะสมพอยต์เพื่อเลื่อนระดับ และเข้าถึงสิทธิพิเศษระดับโลก</p>
                        {Object.entries(tierConfig).map(([key, config]) => {
                          const isCurrent = userTier === key
                          return (
                            <div key={key} className={cn("p-5 rounded-[28px] border-2 flex items-start gap-4 transition-all", isCurrent ? "bg-white border-[#FF6B00] shadow-lg shadow-[#FF6B00]/10" : "bg-white border-transparent shadow-sm")}>
                               <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[20px] flex items-center justify-center shadow-inner border border-gray-200">{config.icon}</div>
                               <div className="flex-1">
                                  <h4 className="font-black text-gray-900 flex items-center gap-2 mb-1">
                                    {config.label}
                                    {isCurrent && <span className="text-[9px] font-black uppercase text-white bg-[#FF6B00] px-2 py-0.5 rounded-md">Current</span>}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                                     {key === 'MEMBER' && '0 pts'}
                                     {key === 'SILVER' && '500+ pts'}
                                     {key === 'GOLD' && '2000+ pts'}
                                     {key === 'VIP' && '5000+ pts'}
                                  </p>
                                  <ul className="text-xs text-gray-600 font-medium space-y-1.5 list-disc list-inside">
                                    {key === 'MEMBER' && <li>ทุก 10 บาท รับ 1 พอยต์</li>}
                                    {key === 'SILVER' && <><li>รับพอยต์ X 1.2</li><li>แถมตั๋วหวยพิเศษ 1 ใบ/เดือน</li></>}
                                    {key === 'GOLD' && <><li>รับพอยต์ X 1.5</li><li>โค้ดส่งฟรี 2 ครั้ง/เดือน</li></>}
                                    {key === 'VIP' && <><li>ส่งฟรีทุกออเดอร์ (ในระยะ)</li><li>เมนูลับทานฟรีวันเกิด</li></>}
                                  </ul>
                               </div>
                            </div>
                          )
                        })}
                     </div>
                  )}

                  {/* Content for Rewards Modal */}
                  {activeModal === 'rewards' && (
                     <div className="space-y-6">
                        <div className="bg-[#1C1917] text-white rounded-[32px] p-6 flex justify-between items-center shadow-xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/20 rounded-full blur-2xl"/>
                           <div className="relative z-10">
                              <p className="text-[11px] font-black uppercase tracking-widest text-[#FF6B00] mb-1">My Balance</p>
                              <p className="text-4xl font-black">{userPoints} <span className="text-sm text-gray-400">pts</span></p>
                           </div>
                           <Gift className="w-12 h-12 text-[#FF6B00] opacity-80 relative z-10" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           {[
                              { label: 'ส่วนลด ฿50', desc: 'ขั้นต่ำ ฿200', pts: 500, emoji: '🎫' },
                              { label: 'ข้ามหมูสับ', desc: 'อร่อยฟรีๆ', pts: 800, emoji: '🍛' },
                              { label: 'โกโก้เย็น', desc: '1 แก้ว', pts: 300, emoji: '🥤' },
                              { label: 'ส่งฟรี', desc: 'ระยะทาง 5km', pts: 200, emoji: '🛵' },
                           ].map((item, idx) => (
                             <div key={idx} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <span className="text-4xl mb-3 drop-shadow-md">{item.emoji}</span>
                                <h4 className="font-black text-gray-900 text-sm mb-1">{item.label}</h4>
                                <p className="text-[10px] font-medium text-gray-400 mb-4">{item.desc}</p>
                                
                                <button
                                   disabled={userPoints < item.pts || isRedeeming}
                                   onClick={async () => {
                                      hapticHeavy()
                                      if (!user?.id) { addToast({type: 'error', title: 'Login Required'}); return }
                                      setIsRedeeming(true)
                                      try {
                                        await redeemPoints({ userId: user.id, amount: item.pts })
                                        useAuthStore.getState().updatePoints(userPoints - item.pts)
                                        addToast({ type: 'success', title: 'สำเร็จ', message: `แลก ${item.label} แล้ว` })
                                        setActiveModal(null)
                                      } catch (err) { addToast({ type:'error', title: 'แลกไม่สำเร็จ' })}
                                      finally { setIsRedeeming(false) }
                                   }}
                                   className={cn("w-full py-3 rounded-[16px] text-xs font-black transition-all", userPoints >= item.pts ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 active:scale-95" : "bg-gray-100 text-gray-400")}
                                >
                                   {isRedeeming ? '...' : `${item.pts} pts`}
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Settings Modal */}
                  {activeModal === 'settings' && (
                     <div className="space-y-6">
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
                           <div className="flex items-center justify-between">
                              <div>
                                <p className="font-black text-gray-900 text-sm">การสั่นตอบสนอง (Haptics)</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">สั่นเมื่อกดปุ่มต่างๆ เพื่อประสบการณ์ที่ดี</p>
                              </div>
                              <button onClick={() => { hapticLight(); setHaptics(!haptics) }} className={cn("w-14 h-8 rounded-full flex items-center px-1 transition-colors border", haptics ? "bg-[#00C300] border-transparent" : "bg-gray-100 border-gray-200")}>
                                <div className={cn("w-6 h-6 bg-white rounded-full shadow-md transition-transform", haptics ? "translate-x-6" : "translate-x-0")} />
                              </button>
                           </div>
                           <div className="h-px w-full bg-gray-100" />
                           <div className="flex items-center justify-between">
                              <div>
                                <p className="font-black text-gray-900 text-sm">แจ้งเตือนออเดอร์</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">เมื่อสถานะอาหารเปลี่ยน</p>
                              </div>
                              <button onClick={() => { hapticLight(); setNotifOrders(!notifOrders) }} className={cn("w-14 h-8 rounded-full flex items-center px-1 transition-colors border", notifOrders ? "bg-[#FF6B00] border-transparent" : "bg-gray-100 border-gray-200")}>
                                <div className={cn("w-6 h-6 bg-white rounded-full shadow-md transition-transform", notifOrders ? "translate-x-6" : "translate-x-0")} />
                              </button>
                           </div>
                           <div className="h-px w-full bg-gray-100" />
                           <div className="flex items-center justify-between">
                              <div>
                                <p className="font-black text-gray-900 text-sm">โปรโมชัน</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">รับโค้ดลับก่อนใคร</p>
                              </div>
                              <button onClick={() => { hapticLight(); setNotifPromos(!notifPromos) }} className={cn("w-14 h-8 rounded-full flex items-center px-1 transition-colors border", notifPromos ? "bg-[#FF6B00] border-transparent" : "bg-gray-100 border-gray-200")}>
                                <div className={cn("w-6 h-6 bg-white rounded-full shadow-md transition-transform", notifPromos ? "translate-x-6" : "translate-x-0")} />
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Help Modal */}
                  {activeModal === 'help' && (
                     <div className="text-center py-4">
                        <div className="w-24 h-24 bg-[#00C300]/10 text-[#00C300] rounded-full flex items-center justify-center mx-auto mb-6 relative">
                           <div className="absolute inset-0 bg-[#00C300] rounded-full animate-ping opacity-20" />
                           <HelpCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">แอดมินใจดี พร้อมตอบ!</h3>
                        <p className="text-sm font-medium text-gray-500 mb-8 max-w-[260px] mx-auto">สอบถามเมนู ยกเลิกออเดอร์ หรือเรื่องอื่นๆ ทักมาได้เลยครับ เราเปิดตลอด 24ชม.</p>
                        
                        <div className="space-y-3">
                           <button onClick={() => { hapticHeavy(); window.open('https://line.me/R/ti/p/@kaprao52', '_blank') }} className="w-full h-16 bg-[#00C300] text-white rounded-[24px] shadow-xl shadow-[#00C300]/30 font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
                              แชทผ่าน LINE
                           </button>
                           <button onClick={() => { hapticLight(); window.location.href='tel:0812345678' }} className="w-full h-14 bg-white text-gray-700 border border-gray-200 rounded-[20px] font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-50">
                              <Smartphone className="w-5 h-5"/> โทร 081-234-5678
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuSection({ title, items }: { title: string, items: MenuItemConfig[] }) {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-50/50 bg-gray-50/30">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</h3>
      </div>
      <div className="divide-y divide-gray-50 px-2 py-2">
         {items.map((item, idx) => (
           <button key={idx} onClick={item.onClick} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 rounded-2xl transition-colors active:scale-95 group">
             <div className={cn("w-12 h-12 rounded-[16px] flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform", item.iconBg, item.iconColor)}>
               <item.icon className="w-6 h-6" />
             </div>
             <div className="flex-1 text-left">
               <h4 className="font-black text-gray-900 border-none text-[15px]">{item.label}</h4>
               {item.sublabel && <p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.sublabel}</p>}
             </div>
             <ChevronRight className="w-5 h-5 text-gray-300" />
           </button>
         ))}
      </div>
    </div>
  )
}
