import { useEffect, useState } from 'react'
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
  Bell,
  Volume2,
  Smartphone,
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { logout, loginWithLine } from '@/lib/auth'
import { useUserPoints, usePointsCalculator } from '@/features/points/hooks/usePoints'
import { StreakTracker } from '@/features/points/components/StreakTracker'
import { getUserGamification, UserGamificationState } from '@/features/gamification/GamificationEngine'
import { staggerContainer, fadeInUp } from '@/animations/variants'
import { trackPageView } from '@/lib/analytics'

const tierConfig = {
  MEMBER: { gradient: 'linear-gradient(135deg, #CD7F32, #E8A96A)', icon: '🥉', glow: 'rgba(205, 127, 50, 0.4)', label: 'สมาชิก' },
  SILVER: { gradient: 'linear-gradient(135deg, #62748E, #9DB2CC)', icon: '🥈', glow: 'rgba(98, 116, 142, 0.4)', label: 'Silver' },
  GOLD: { gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B)', icon: '👑', glow: 'rgba(245, 158, 11, 0.5)', label: 'Gold' },
  VIP: { gradient: 'linear-gradient(135deg, #6C63FF, #A78BFA, #6C63FF)', icon: '💎', glow: 'rgba(108, 99, 255, 0.5)', label: 'VIP' },
}

type MenuItemConfig = {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick: () => void
  iconBg: string
  iconColor: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isGuest, isLoading: authLoading } = useAuthStore()
  const { addToast } = useUIStore()

  const [activeModal, setActiveModal] = useState<'points' | 'rewards' | 'settings' | 'help' | null>(null)

  // Only fetch points for real logged-in users (not guest, not anonymous)
  const isRealUser = !!user?.id && !!user?.lineUserId
  const { data: serverPoints, isLoading: pointsLoading } = useUserPoints(isRealUser ? user!.id : undefined)
  const { getTier, getNextTier, tiers } = usePointsCalculator()

  useEffect(() => {
    trackPageView('/profile', 'Profile')
  }, [])

  const [gameState, setGameState] = useState<UserGamificationState | null>(null)

  useEffect(() => {
    if (user?.id) {
      const engine = getUserGamification(user.id)
      setGameState(engine.getState())

      const handleLevelUp = () => setGameState(engine.getState())
      const handleXpGained = () => setGameState(engine.getState())
      const handleAchievement = () => setGameState(engine.getState())

      engine.on('levelUp', handleLevelUp)
      engine.on('xpGained', handleXpGained)
      engine.on('achievementUnlocked', handleAchievement)

      return () => {
        engine.off('levelUp', handleLevelUp)
        engine.off('xpGained', handleXpGained)
        engine.off('achievementUnlocked', handleAchievement)
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (serverPoints !== undefined && user && serverPoints !== user.points) {
      useAuthStore.getState().updatePoints(serverPoints)
    }
  }, [serverPoints, user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    addToast({ type: 'info', title: 'ออกจากระบบแล้ว 👋' })
  }

  const handleLineLogin = async () => {
    try {
      await loginWithLine()
    } catch {
      addToast({ type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง' })
    }
  }

  const isLoading = authLoading || (isRealUser && pointsLoading)
  const userPoints = serverPoints ?? user?.points ?? 0
  const userTier = getTier(userPoints)
  const nextTier = getNextTier(userPoints)
  const tierInfo = tiers[userTier]
  const tier = tierConfig[userTier as keyof typeof tierConfig] ?? tierConfig.MEMBER
  const progressPct = nextTier
    ? Math.min(100, (userPoints / (userPoints + nextTier.pointsNeeded)) * 100)
    : 100

  const menuItems: MenuItemConfig[] = [
    {
      icon: Clock,
      label: 'ประวัติการสั่งซื้อ',
      onClick: () => navigate('/orders'),
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
    },
    {
      icon: Ticket,
      label: 'ตั๋วหวยของฉัน',
      onClick: () => navigate('/lottery'),
      iconBg: '#F5F3FF',
      iconColor: '#8B5CF6',
    },
    {
      icon: Star,
      label: 'ระดับสมาชิกของคุณ',
      sublabel: `สถานะ: ${tierInfo?.name || 'MEMBER'}`,
      onClick: () => setActiveModal('points'),
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
    },
    {
      icon: Gift,
      label: 'แลกของรางวัล',
      sublabel: 'สิทธิพิเศษตามพอยต์ที่มี',
      onClick: () => setActiveModal('rewards'),
      iconBg: '#F0FDF4',
      iconColor: '#22C55E',
    },
  ]

  const settingsItems: MenuItemConfig[] = [
    {
      icon: Settings,
      label: 'ตั้งค่าแอปพลิเคชัน',
      onClick: () => setActiveModal('settings'),
      iconBg: '#F9FAFB',
      iconColor: '#4B5563',
    },
    {
      icon: HelpCircle,
      label: 'ศูนย์ช่วยเหลือ & ติดต่อเรา',
      onClick: () => setActiveModal('help'),
      iconBg: '#F9FAFB',
      iconColor: '#4B5563',
    },
    {
      icon: Shield,
      label: 'แอดมิน',
      sublabel: 'จัดการร้านค้า',
      onClick: () => navigate('/admin'),
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
    },
  ]

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FAFAF9' }}>
      <Container className="py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-black text-gray-800">โปรไฟล์</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: '#FF6B00', borderTopColor: 'transparent' }}
            />
            <p className="text-sm text-gray-400 font-medium">กำลังโหลด...</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* ── Membership OR Guest Card ── */}
            <motion.div variants={fadeInUp}>
              {isGuest || !user ? (
                /* Guest Card */
                <div
                  className="rounded-[1.5rem] overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, #E2E8F0, #F8FAFC)',
                    boxShadow: '0 16px 40px -8px rgba(148, 163, 184, 0.4)',
                  }}
                >
                  <div className="relative p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
                        👤
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-800 leading-tight">โปรไฟล์ผู้เยี่ยมชม</h2>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-1 bg-white/60">
                          <span className="text-sm">⭐</span>
                          <span className="text-xs font-black text-slate-700">รอการสะสมแต้ม</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Member Card */
                <div
                  className="rounded-[1.5rem] overflow-hidden relative"
                  style={{
                    background: tier.gradient,
                    boxShadow: `0 16px 40px -8px ${tier.glow}`,
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 4s ease infinite',
                  }}
                >
                  {/* Decorative circles */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute -right-12 -top-12 w-44 h-44 rounded-full opacity-10"
                    style={{ border: '2px solid white' }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="absolute -left-8 -bottom-16 w-36 h-36 rounded-full opacity-10"
                    style={{ border: '2px solid white' }}
                  />
                  <div
                    className="absolute top-0 right-0 w-2/3 h-full opacity-10"
                    style={{ background: 'radial-gradient(ellipse at top right, white, transparent)' }}
                  />

                  {/* Card content */}
                  <div className="relative p-5">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30"
                          style={{ background: 'rgba(255,255,255,0.15)' }}
                        >
                          {user?.pictureUrl ? (
                            <img
                              src={user.pictureUrl}
                              alt={user.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              👤
                            </div>
                          )}
                        </div>
                        {/* Name + tier */}
                        <div>
                          <h2 className="text-lg font-black text-white leading-tight">{user?.displayName}</h2>
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-1"
                            style={{ background: 'rgba(255,255,255,0.2)' }}
                          >
                            <span className="text-sm">{tier.icon}</span>
                            <span className="text-xs font-black text-white">{tier.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-3xl opacity-80">{tier.icon}</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div
                        className="rounded-2xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                      >
                        <p className="text-2xl font-black text-white">{userPoints.toLocaleString()}</p>
                        <p className="text-xs text-white/65 font-semibold mt-0.5">⭐ พอยต์</p>
                      </div>
                      <div
                        className="rounded-2xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                      >
                        <p className="text-2xl font-black text-white">{user?.totalOrders || 0}</p>
                        <p className="text-xs text-white/65 font-semibold mt-0.5">🍽️ ออเดอร์</p>
                      </div>
                      <div
                        className="rounded-2xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                      >
                        <p className="text-2xl font-black text-white">{gameState?.level || 1}</p>
                        <p className="text-xs text-white/65 font-semibold mt-0.5">🎮 เลเวล</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {nextTier && (
                      <div
                        className="rounded-2xl p-3"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                      >
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-white/70 font-medium">อีก {nextTier.pointsNeeded} pts สู่</span>
                          <span className="font-black text-white">{nextTier.name} {tierConfig[nextTier.name.toUpperCase() as keyof typeof tierConfig]?.icon ?? '🏅'}</span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.2)' }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: 'white' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* ── Streak Tracker ── */}
            {!isGuest && user?.displayName !== 'Guest' && (
              <motion.div variants={fadeInUp}>
                <StreakTracker
                  currentStreak={gameState?.currentStreak || 0}
                  longestStreak={gameState?.longestStreak || 0}
                  lastOrderDate={new Date().toISOString()}
                />
              </motion.div>
            )}

            {/* ── Achievements & Badges ── */}
            {!isGuest && user?.displayName !== 'Guest' && gameState?.achievements && (
              <motion.div variants={fadeInUp}>
                <div
                  className="rounded-[1.5rem] overflow-hidden"
                  style={{
                    background: 'white',
                    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-500" />
                      ความพยายาม & ป้ายรางวัล
                    </h3>
                    <div className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-bold">
                      {gameState.achievements.filter(a => a.progress >= a.maxProgress).length} / {gameState.achievements.length} ปลดล็อค
                    </div>
                  </div>
                  <div className="p-4 grid gap-3">
                    {gameState.achievements.map((acc, idx) => {
                      const isUnlocked = acc.progress >= acc.maxProgress
                      const progressPct = Math.min(100, (acc.progress / acc.maxProgress) * 100)
                      return (
                        <div key={idx} className={`p-3 rounded-2xl border-2 transition-all ${isUnlocked ? 'border-purple-100 bg-purple-50/50' : 'border-gray-50 bg-gray-50/50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-white ${isUnlocked ? 'bg-white' : 'bg-gray-100 grayscale opacity-50'}`}>
                              {acc.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-bold text-sm ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>{acc.name}</h4>
                              <p className="text-xs text-gray-400 mt-0.5">{acc.description}</p>
                              {!isUnlocked && (
                                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${progressPct}%` }} />
                                </div>
                              )}
                              {isUnlocked && (
                                <div className="mt-1 text-[10px] text-purple-600 font-bold bg-white px-2 py-0.5 rounded inline-block shadow-sm">
                                  +{acc.reward.points} pts
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Guest Upgrade Card ── */}
            {(isGuest || !user) && (
              <motion.div variants={fadeInUp}>
                <div
                  className="rounded-2xl p-5 overflow-hidden relative shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                  }}
                >
                  <div className="relative z-10">
                    <h3 className="font-black text-white text-lg mb-2 flex items-center gap-2">
                      <span className="text-2xl">🎁</span> รับสิทธิพิเศษเต็มรูปแบบ
                    </h3>
                    <p className="text-green-50 text-sm mb-4 leading-relaxed">
                      เพียงเข้าสู่ระบบ คุณจะได้รับพอยต์ แลกของรางวัล และใช้ตั๋วหวยได้อย่างไร้ขีดจำกัด!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLineLogin}
                      className="w-full py-3.5 rounded-xl font-black text-[#00B900] text-sm flex items-center justify-center gap-2 bg-white"
                      style={{ boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)' }}
                    >
                      <span className="text-lg">L</span>
                      เชื่อมต่อกับ LINE ทันที
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Main Menu ── */}
            <motion.div variants={fadeInUp}>
              <MenuSection items={menuItems} />
            </motion.div>

            {/* ── Settings ── */}
            <motion.div variants={fadeInUp}>
              <MenuSection items={settingsItems} />
            </motion.div>

            {/* ── Logout ── */}
            <motion.div variants={fadeInUp}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full py-3.5 rounded-2xl font-bold text-red-500 border-2 border-red-100 bg-white hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </Container>


      {/* ── Modals ── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 sticky top-0">
                <h3 className="text-xl font-black text-gray-800">
                  {activeModal === 'points' && 'ระดับสมาชิก'}
                  {activeModal === 'rewards' && 'แลกของรางวัล'}
                  {activeModal === 'settings' && 'การตั้งค่า'}
                  {activeModal === 'help' && 'ต้องการความช่วยเหลือ?'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-5 custom-scroll pb-10 sm:pb-5">
                {activeModal === 'points' && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">สะสมพอยต์จากการสั่งอาหารเพื่อเลื่อนระดับและรับสิทธิพิเศษมากมาย ยิ่งระดับสูง ยิ่งได้สิทธิพิเศษเยอะ!</p>

                    {Object.entries(tierConfig).map(([key, config]) => {
                      const isCurrent = userTier === key
                      return (
                        <div key={key} className={`p-4 rounded-2xl border-2 transition-all ${isCurrent ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100">{config.icon}</div>
                            <div>
                              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                {config.label}
                                {isCurrent && <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">ปัจจุบัน</span>}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium">
                                {key === 'MEMBER' && 'เริ่มต้น (0 pts)'}
                                {key === 'SILVER' && '500+ pts'}
                                {key === 'GOLD' && '2,000+ pts'}
                                {key === 'VIP' && '5,000+ pts'}
                              </p>
                            </div>
                          </div>
                          <ul className="text-xs text-gray-600 space-y-1 mt-3 pl-3 border-l-2 border-brand-100">
                            {key === 'MEMBER' && <li>• รับ 1 พอยต์ ทุกออเดอร์ 10 บาท<br />• แลกของรางวัลมาตรฐาน</li>}
                            {key === 'SILVER' && <li>• รับพอยต์ไวขึ้น 1.2 เท่า<br />• โค้ดส่งฟรี 1 ครั้ง/เดือน</li>}
                            {key === 'GOLD' && <li>• เพิ่มโอกาสตั๋วทอง 1.5 เท่า<br />• ของแถมพิเศษเมื่อสั่งเกิน 300.-</li>}
                            {key === 'VIP' && <li>• ส่งฟรีทุกออเดอร์ (ในระยะ)<br />• เมนูลับพิเศษเดือนเกิด</li>}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeModal === 'rewards' && (
                  <div className="space-y-4">
                    <div className="bg-brand-50 p-4 rounded-2xl flex items-center justify-between mb-4 border border-brand-100">
                      <div>
                        <p className="text-xs font-bold text-brand-600 tracking-wider">🌟 พอยต์ทั้งหมด</p>
                        <p className="text-3xl font-black text-brand-700 mt-1">{userPoints.toLocaleString()} <span className="text-sm">pts</span></p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <Gift className="w-6 h-6 text-brand-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: 'ส่วนลด 50 บาท', desc: 'ใช้เมื่อสั่งขั้นต่ำ ฿250', pts: 500, icon: '🎟️', color: 'bg-orange-50' },
                        { title: 'กะเพรา 1 จาน', desc: 'ฟรีเมนูสุดฮิต', pts: 800, icon: '🍛', color: 'bg-red-50' },
                        { title: 'ชาเย็น', desc: 'อร่อยชื่นใจ 1 แก้ว', pts: 300, icon: '🥤', color: 'bg-orange-50' },
                        { title: 'ส่งฟรีเดลิเวอรี่', desc: 'ระยะไม่เกิน 5km', pts: 200, icon: '🛵', color: 'bg-blue-50' },
                      ].map((r, i) => (
                        <div key={i} className={`p-4 rounded-2xl border border-gray-100 ${r.color} flex flex-col items-center text-center relative overflow-hidden`}>
                          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/40 rounded-full blur-xl"></div>
                          <span className="text-4xl mb-2 drop-shadow-sm">{r.icon}</span>
                          <h4 className="font-bold text-gray-800 text-sm">{r.title}</h4>
                          <p className="text-[10px] text-gray-500 mb-2">{r.desc}</p>
                          <div className="mt-auto w-full">
                            <p className="text-xs text-brand-600 font-black mb-2">{r.pts} pts</p>
                            <button
                              onClick={() => {
                                if (userPoints < r.pts) {
                                  addToast({ type: 'error', title: 'พอยต์ไม่พอคะ', message: `ขาดอีกแค่ ${r.pts - userPoints} pts ก็แลกได้แล้วค่ะ!` })
                                } else {
                                  addToast({ type: 'success', title: 'แลกสำเร็จ!', message: 'ตั๋วรางวัลจะไปอยู่ในระบบของร้าน' })
                                  setActiveModal(null)
                                }
                              }}
                              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${userPoints >= r.pts ? 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95 shadow-sm' : 'bg-white border text-gray-400'}`}
                            >
                              {userPoints >= r.pts ? 'กดยืนยันแลก' : 'พอยต์ไม่พอ'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-gray-500" /> การแจ้งเตือน</h4>
                      <div className="space-y-4 bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">สถานะออเดอร์</p>
                            <p className="text-xs text-gray-500 mt-0.5">แจ้งเตือนเมื่อกำลังเตรียม</p>
                          </div>
                          <div className="w-12 h-7 bg-brand-500 rounded-full flex items-center px-1 cursor-pointer transition-colors"><div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm" /></div>
                        </div>
                        <div className="w-full h-px bg-gray-200" />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">ส่วนลดพิเศษ</p>
                            <p className="text-xs text-gray-500 mt-0.5">รับข้อเสนอและโปรลับ</p>
                          </div>
                          <div className="w-12 h-7 bg-gray-300 rounded-full flex items-center px-1 cursor-pointer transition-colors"><div className="w-5 h-5 bg-white rounded-full shadow-sm" /></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><Volume2 className="w-4 h-4 text-gray-500" /> ตั้งค่าแอป</h4>
                      <div className="space-y-4 bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Effect การกดสั่น (Haptics)</p>
                            <p className="text-xs text-gray-500 mt-0.5">เพิ่มประสบการณ์กดปุ่มมันส์ๆ</p>
                          </div>
                          <div className="w-12 h-7 bg-brand-500 rounded-full flex items-center px-1 cursor-pointer transition-colors"><div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'help' && (
                  <div className="space-y-4 text-center py-6">
                    <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                      <HelpCircle className="w-12 h-12" />
                    </div>
                    <h3 className="font-black text-gray-800 text-xl">พบปัญหาการสั่ง?</h3>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-[240px] mx-auto">
                      ไม่ว่าจะเป็นการยกเลิก หรือเรื่องเมนู ติดต่อเราโดยตรงได้เลย แอดมิน กะเพรา 52 รอช่วยอยู่!
                    </p>

                    <button
                      onClick={() => {
                        window.open('https://line.me/R/ti/p/@kaprao52', '_blank')
                        setActiveModal(null)
                      }}
                      className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 hover:-translate-y-1 transition-transform active:translate-y-0"
                      style={{ background: '#00B900', boxShadow: '0 8px 24px -6px rgba(0, 185, 0, 0.4)' }}
                    >
                      <span className="text-2xl pt-1">L</span> แชทกับเราผ่าน LINE
                    </button>

                    <div className="pt-2">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-3">หรือโทรสายด่วน</p>
                      <button
                        onClick={() => {
                          window.location.href = 'tel:0812345678'
                          setActiveModal(null)
                        }}
                        className="w-full py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        <Smartphone className="w-5 h-5" /> โทร 081-234-5678
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

// ─── Menu Section ──────────────────────────────────────────────────────────────
function MenuSection({ items }: { items: MenuItemConfig[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.07)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      {items.map((item, index) => (
        <div key={index}>
          {index > 0 && <div className="mx-4" style={{ height: 1, background: '#F3F4F6' }} />}
          <motion.button
            whileHover={{ backgroundColor: '#FAFAF9' }}
            whileTap={{ scale: 0.99 }}
            onClick={item.onClick}
            className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.iconBg }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.iconColor }} />
              </div>
              <div className="text-left">
                <span className="font-bold text-gray-800 text-sm block">{item.label}</span>
                {item.sublabel && (
                  <span className="text-xs text-gray-400">{item.sublabel}</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </motion.button>
        </div>
      ))}
    </div>
  )
}
