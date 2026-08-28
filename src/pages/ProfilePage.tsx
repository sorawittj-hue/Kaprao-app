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
  Target,
  User,
  Calendar
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { logout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useUserPoints, usePointsCalculator, useRedeemPoints } from '@/features/points/hooks/usePoints'
import { StreakTracker } from '@/features/points/components/StreakTracker'
import { DailyCheckInModal } from '@/features/points/components/DailyCheckIn'
import { RewardsMarketplace } from '@/features/points/components/RewardsMarketplace'
import { AuthModal } from '@/components/auth/AuthModal'
import { getUserGamification, UserGamificationState } from '@/features/gamification/GamificationEngine'
import { trackPageView } from '@/lib/analytics'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { useSEO } from '@/hooks/useSEO'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { cn } from '@/utils/cn'

const tierConfig = {
  MEMBER: {
    bgGradient: 'linear-gradient(135deg, #44403C 0%, #292524 100%)',
    borderColor: 'rgba(120,113,108,0.3)',
    glowColor: 'rgba(120,113,108,0.25)',
    accentColor: '#A8A29E',
    icon: <CircleDashed className="w-5 h-5" />,
    label: 'สมาชิกเริ่มต้น',
    badgeBg: 'rgba(168,162,158,0.15)',
    badgeText: '#A8A29E',
  },
  SILVER: {
    bgGradient: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
    borderColor: 'rgba(148,163,184,0.3)',
    glowColor: 'rgba(148,163,184,0.25)',
    accentColor: '#94A3B8',
    icon: <Medal className="w-5 h-5" />,
    label: 'ระดับเงิน',
    badgeBg: 'rgba(148,163,184,0.15)',
    badgeText: '#94A3B8',
  },
  GOLD: {
    bgGradient: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)',
    borderColor: 'rgba(251,191,36,0.30)',
    glowColor: 'rgba(251,191,36,0.30)',
    accentColor: '#FBBF24',
    icon: <Award className="w-5 h-5" />,
    label: 'ระดับทอง',
    badgeBg: 'rgba(251,191,36,0.15)',
    badgeText: '#FBBF24',
  },
  VIP: {
    bgGradient: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
    borderColor: 'rgba(16,185,129,0.30)',
    glowColor: 'rgba(16,185,129,0.30)',
    accentColor: '#10B981',
    icon: <Crown className="w-5 h-5" />,
    label: 'ลูกค้า VIP',
    badgeBg: 'rgba(16,185,129,0.15)',
    badgeText: '#10B981',
  },
}

type MenuItemConfig = {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick: () => void
  iconBg: string
  iconColor: string
  glowColor?: string
}

const slideUpItem = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isGuest, isLoading: authLoading } = useAuthStore()
  const { addToast } = useUIStore()

  const [activeModal, setActiveModal] = useState<'points' | 'rewards' | 'settings' | 'help' | 'checkin' | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
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
    addToast({ type: 'info', title: 'ออกจากระบบแล้ว' })
  }

  const handleLineLogin = () => {
    hapticHeavy()
    setIsAuthModalOpen(true)
  }

  const handleMakeMeAdmin = async () => {
    hapticHeavy()
    if (!isRealUser || !user?.id) return
    setIsUpdatingAdmin(true)
    try {
      const { error } = await supabase.from('profiles').update({ is_admin: true } as any).eq('id', user.id)
      if (error) throw error
      addToast({ type: 'success', title: 'อัปเกรดเรียบร้อย!', message: 'คุณได้รับสิทธิ์ Admin แล้ว' })
      useAuthStore.getState().setUser({ ...user, isAdmin: true })
    } catch {
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
    {
      icon: Calendar,
      label: 'เช็คอินสะสมแต้มรายวัน',
      sublabel: 'รับฟรี 5-25 pts ทุกวัน',
      onClick: () => { hapticLight(); setActiveModal('checkin') },
      iconBg: 'rgba(245,158,11,0.10)',
      iconColor: '#F59E0B',
      glowColor: 'rgba(245,158,11,0.20)',
    },
    {
      icon: Gift,
      label: 'ร้านค้าแลกพอยต์ (E-Voucher)',
      sublabel: 'แลกคูปองส่วนลด & เมนูฟรี',
      onClick: () => { hapticLight(); setActiveModal('rewards') },
      iconBg: 'rgba(219,39,119,0.10)',
      iconColor: '#DB2777',
      glowColor: 'rgba(219,39,119,0.20)',
    },
    {
      icon: Clock,
      label: 'ประวัติการสั่งซื้อ',
      onClick: () => { hapticLight(); navigate('/orders') },
      iconBg: 'rgba(2,132,199,0.10)',
      iconColor: '#0284C7',
      glowColor: 'rgba(2,132,199,0.20)',
    },
    {
      icon: Ticket,
      label: 'ตั๋วหวยของฉัน',
      onClick: () => { hapticLight(); navigate('/lottery') },
      iconBg: 'rgba(22,163,74,0.10)',
      iconColor: '#16A34A',
      glowColor: 'rgba(22,163,74,0.20)',
    },
    {
      icon: Star,
      label: 'ระดับสมาชิกของคุณ',
      sublabel: `สถานะ: ${tierInfo?.name || 'MEMBER'}`,
      onClick: () => { hapticLight(); setActiveModal('points') },
      iconBg: 'rgba(217,119,6,0.10)',
      iconColor: '#D97706',
      glowColor: 'rgba(217,119,6,0.20)',
    },
  ]

  const settingsItems: MenuItemConfig[] = [
    {
      icon: Settings,
      label: 'การตั้งค่าระบบ',
      onClick: () => { hapticLight(); setActiveModal('settings') },
      iconBg: 'rgba(71,85,105,0.10)',
      iconColor: '#475569',
    },
    {
      icon: HelpCircle,
      label: 'ต้องการความช่วยเหลือ',
      onClick: () => { hapticLight(); setActiveModal('help') },
      iconBg: 'rgba(71,85,105,0.10)',
      iconColor: '#475569',
    },
    ...(isAdmin ? [{
      icon: Shield,
      label: 'จัดการหลังบ้าน (Admin)',
      sublabel: 'ตั้งค่าร้านค้า เมนู ออเดอร์',
      onClick: () => { hapticLight(); navigate('/admin') },
      iconBg: 'rgba(79,70,229,0.10)',
      iconColor: '#4F46E5',
      glowColor: 'rgba(79,70,229,0.20)',
    }] : []),
  ]

  return (
    <div className="min-h-screen pb-32 relative" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-12 w-[340px] h-[340px] rounded-full animate-glow-pulse"
          style={{
            background: `radial-gradient(circle, ${tier.glowColor} 0%, transparent 70%)`,
            filter: 'blur(64px)',
          }}
        />
        <div
          className="absolute bottom-1/3 -left-16 w-[220px] h-[220px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
      </div>

      <Container className="py-4 relative z-10 px-4 space-y-5 max-w-2xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[14px] flex items-center justify-center"
              style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.20)' }}
            >
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>โปรไฟล์</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-purple-600">My Profile</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-12 h-12 rounded-full border-4 border-t-purple-400 animate-spin"
              style={{ borderColor: 'var(--border-soft)', borderTopColor: '#C084FC' }}
            />
          </div>
        ) : (
          <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-4">

            {/* ── Membership Hero Card ── */}
            <motion.div variants={slideUpItem}>
              {isGuest || !user ? (
                /* Guest Card */
                <div
                  className="rounded-[28px] p-5 shine-sweep"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-soft)',
                    boxShadow: '0 2px 14px rgba(15,23,42,0.04)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}
                    >
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black leading-tight" style={{ color: 'var(--text-primary)' }}>โปรไฟล์ผู้เยี่ยมชม</h2>
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-1.5"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-soft)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Star className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Guest Account</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Logged In — Tier Card */
                <motion.div
                  className="rounded-[28px] overflow-hidden relative"
                  style={{
                    background: tier.bgGradient,
                    border: `1px solid ${tier.borderColor}`,
                    boxShadow: `0 16px 48px ${tier.glowColor}, 0 0 0 1px rgba(255,255,255,0.04)`,
                  }}
                  whileHover={{ scale: 1.008 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  {/* Shine sweep */}
                  <div className="absolute inset-0 shine-sweep pointer-events-none" />

                  <div className="relative z-10 p-5">
                    {/* Top row: Avatar + tier badge */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-[64px] h-[64px] rounded-[20px] overflow-hidden flex-shrink-0"
                          style={{ border: `2px solid ${tier.borderColor}` }}
                        >
                          {user.pictureUrl
                            ? <img src={user.pictureUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-black/20"><User className="w-6 h-6 text-white/50" /></div>
                          }
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-white tracking-tight leading-tight">{user.displayName}</h2>
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-1"
                            style={{ background: tier.badgeBg, color: tier.accentColor }}
                          >
                            {tier.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{tier.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      {[
                        { value: userPoints, label: 'Points', color: tier.accentColor },
                        { value: user.totalOrders || 0, label: 'Orders', color: '#F5F5F5' },
                        { value: `Lv.${gameState?.level || 1}`, label: 'Rank', color: '#F5F5F5' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 300 }}
                          className="flex flex-col items-center py-3 rounded-[16px]"
                          style={{ background: 'rgba(0,0,0,0.25)' }}
                        >
                          <span
                            className="text-xl font-black num-display"
                            style={{ color: stat.color }}
                          >
                            {stat.value}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/50 mt-0.5">
                            {stat.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress to next tier */}
                    {nextTier && (
                      <div className="rounded-[16px] p-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
                            Progress to {nextTier.name}
                          </span>
                          <span className="text-[10px] font-black" style={{ color: tier.accentColor }}>
                            {nextTier.pointsNeeded} pts ถึงจะขึ้นระดับ
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${tier.accentColor}88, ${tier.accentColor})` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* ── Streak & Achievements ── */}
            {!isGuest && user?.displayName !== 'Guest' && (
              <motion.div variants={slideUpItem} className="space-y-4">
                <StreakTracker
                  currentStreak={gameState?.currentStreak || 0}
                  longestStreak={gameState?.longestStreak || 0}
                  lastOrderDate={new Date().toISOString()}
                />

                {gameState?.achievements && gameState.achievements.length > 0 && (
                  <div
                    className="rounded-[28px] overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
                  >
                    <div
                      className="flex items-center justify-between px-5 py-4"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                        <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>ภารกิจ & ความสำเร็จ</h3>
                      </div>
                      <span className="badge-brand">
                        {gameState.achievements.filter(a => a.progress >= a.maxProgress).length} Unlocked
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {gameState.achievements.map((acc, i) => {
                        const isUnlocked = acc.progress >= acc.maxProgress
                        const pct = Math.min(100, (acc.progress / acc.maxProgress) * 100)
                        return (
                          <div
                            key={i}
                            className={cn(
                              'p-4 rounded-[18px] flex gap-3.5',
                              isUnlocked
                                ? 'border border-emerald-500/20 bg-emerald-50/50'
                                : 'border border-slate-200/80 bg-slate-50'
                            )}
                          >
                            <div
                              className={cn(
                                'w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl flex-shrink-0 bg-white border border-slate-100 shadow-sm',
                                !isUnlocked && 'grayscale opacity-40'
                              )}
                            >
                              {acc.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={cn('font-black text-sm', isUnlocked ? 'text-slate-900' : 'text-slate-500')}>
                                {acc.name}
                              </h4>
                              <p className="text-[10px] font-medium mt-0.5 mb-2 leading-snug text-slate-500">{acc.description}</p>
                              {!isUnlocked ? (
                                <div className="h-1 w-full rounded-full overflow-hidden bg-slate-200">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #818CF8, #C084FC)' }}
                                  />
                                </div>
                              ) : (
                                <span className="badge-green text-[9px]">+{acc.reward.points} pts earned</span>
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

            {/* ── Guest Promo ── */}
            {(isGuest || !user) && (
              <motion.div variants={slideUpItem}>
                <div
                  className="rounded-[28px] p-6 text-center shine-sweep overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.04))',
                    border: '1px solid rgba(34,197,94,0.20)',
                    boxShadow: '0 2px 14px rgba(15,23,42,0.04)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
                  >
                    <Gift className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-black text-xl mb-2" style={{ color: 'var(--text-primary)' }}>อัปเกรดบัญชีฟรี!</h3>
                  <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-secondary)' }}>
                    เชื่อมต่อกับ LINE วันนี้ รับพอยต์ทันที ลุ้นหวยกินฟรี และแลกของรางวัลได้ไม่อั้น!
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLineLogin}
                    className="w-full text-white font-black text-sm py-4 rounded-[20px] flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #00C300, #00A000)',
                      boxShadow: '0 8px 24px rgba(0,185,0,0.35)',
                    }}
                  >
                    เข้าสู่ระบบผ่าน LINE
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Main Menu ── */}
            <motion.div variants={slideUpItem}>
              <MenuSection title="เมนูหลัก" items={menuItems} />
            </motion.div>

            {/* ── Settings Menu ── */}
            <motion.div variants={slideUpItem}>
              <MenuSection title="ระบบและการตั้งค่า" items={settingsItems} />
            </motion.div>

            {/* ── Admin Upgrade ── */}
            {isRealUser && !isAdmin && (
              <motion.div variants={slideUpItem}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={isUpdatingAdmin}
                  onClick={handleMakeMeAdmin}
                  className="w-full py-4 text-xs font-black rounded-[22px] flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: 'rgba(255,94,0,0.08)',
                    border: '1px solid rgba(255,94,0,0.18)',
                    color: 'var(--brand)',
                  }}
                >
                  {isUpdatingAdmin
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <ShieldAlert className="w-4 h-4" />
                  }
                  {isUpdatingAdmin ? 'กำลังประมวลผล...' : 'เรียกใช้สิทธิ์ Admin'}
                </motion.button>
              </motion.div>
            )}

            {/* ── Logout ── */}
            <motion.div variants={slideUpItem}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full py-4 text-sm font-black rounded-[22px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: '#EF4444',
                }}
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
          <div className="fixed inset-0 z-[100] flex flex-col justify-end p-3 pb-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
              onClick={() => setActiveModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-lg mx-auto relative z-10 flex flex-col max-h-[88vh] rounded-[32px] overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: '0 -8px 60px rgba(0,0,0,0.8)',
              }}
            >
              {/* Modal Header */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <h3 className="font-black text-white text-lg tracking-tight">
                  {activeModal === 'points' && 'ระดับสมาชิก'}
                  {activeModal === 'rewards' && 'แลกของรางวัล'}
                  {activeModal === 'settings' && 'ตั้งค่าระบบ'}
                  {activeModal === 'help' && 'ช่วยเหลือ'}
                </h3>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setActiveModal(null)}
                  aria-label="ปิด"
                  className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                >
                  <X className="w-4.5 h-4.5" aria-hidden="true" />
                </motion.button>
              </div>

              <div className="overflow-y-auto p-6 flex-1 hide-scrollbar space-y-4">

                {/* Points / Tier Modal */}
                {activeModal === 'points' && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                      สะสมพอยต์เพื่อเลื่อนระดับ และเข้าถึงสิทธิพิเศษระดับโลก
                    </p>
                    {Object.entries(tierConfig).map(([key, config]) => {
                      const isCurrent = userTier === key
                      return (
                        <div
                          key={key}
                          className="p-4 rounded-[22px] flex items-start gap-3.5 transition-all"
                          style={{
                            background: isCurrent ? config.bgGradient : 'var(--bg-surface)',
                            border: `1px solid ${isCurrent ? config.borderColor : 'var(--border-subtle)'}`,
                            boxShadow: isCurrent ? `0 8px 24px ${config.glowColor}` : 'none',
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(0,0,0,0.3)', color: config.accentColor }}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-black text-white text-sm">{config.label}</h4>
                              {isCurrent && (
                                <span
                                  className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full"
                                  style={{ background: config.accentColor, color: '#000' }}
                                >
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: config.accentColor }}>
                              {key === 'MEMBER' && '0 pts'}
                              {key === 'SILVER' && '500+ pts'}
                              {key === 'GOLD' && '2000+ pts'}
                              {key === 'VIP' && '5000+ pts'}
                            </p>
                            <ul className="text-[11px] text-gray-400 font-medium space-y-1 list-disc list-inside">
                              {key === 'MEMBER' && <li>ทุก 10 บาท รับ 1 พอยต์</li>}
                              {key === 'SILVER' && <><li>รับพอยต์ x1.2</li><li>แถมตั๋วหวยพิเศษ 1 ใบ/เดือน</li></>}
                              {key === 'GOLD' && <><li>รับพอยต์ x1.5</li><li>โค้ดส่งฟรี 2 ครั้ง/เดือน</li></>}
                              {key === 'VIP' && <><li>ส่งฟรีทุกออเดอร์ (ในระยะ)</li><li>เมนูลับฟรีวันเกิด</li></>}
                            </ul>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Rewards Modal */}
                {activeModal === 'rewards' && (
                  <div className="space-y-4">
                    {/* Balance card */}
                    <div
                      className="rounded-[22px] p-5 flex justify-between items-center relative overflow-hidden shine-sweep"
                      style={{
                        background: 'linear-gradient(135deg, #1C1917, #292524)',
                        border: '1px solid rgba(255,94,0,0.20)',
                      }}
                    >
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">My Balance</p>
                        <p className="text-4xl font-black text-white num-display">
                          {userPoints} <span className="text-sm text-gray-400">pts</span>
                        </p>
                      </div>
                      <Gift className="w-12 h-12 text-orange-400/60 relative z-10" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'ส่วนลด ฿50', desc: 'ขั้นต่ำ ฿200', pts: 500 },
                        { label: 'ข้ามหมูสับ', desc: 'อร่อยฟรีๆ', pts: 800 },
                        { label: 'โกโก้เย็น', desc: '1 แก้ว', pts: 300 },
                        { label: 'ส่งฟรี', desc: 'ระยะ 5km', pts: 200 },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-[20px] p-4 flex flex-col items-center text-center"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                        >
                          <h4 className="font-black text-white text-sm mb-0.5">{item.label}</h4>
                          <p className="text-[10px] font-medium text-gray-400 mb-3">{item.desc}</p>
                          <motion.button
                            whileTap={{ scale: 0.93 }}
                            disabled={userPoints < item.pts || isRedeeming}
                            onClick={async () => {
                              hapticHeavy()
                              if (!user?.id) { addToast({ type: 'error', title: 'Login Required' }); return }
                              setIsRedeeming(true)
                              try {
                                await redeemPoints({ userId: user.id, amount: item.pts })
                                useAuthStore.getState().updatePoints(userPoints - item.pts)
                                addToast({ type: 'success', title: 'สำเร็จ', message: `แลก ${item.label} แล้ว` })
                                setActiveModal(null)
                              } catch { addToast({ type: 'error', title: 'แลกไม่สำเร็จ' }) }
                              finally { setIsRedeeming(false) }
                            }}
                            className={cn(
                              'w-full py-2.5 rounded-[14px] text-xs font-black transition-all cursor-pointer',
                              userPoints >= item.pts
                                ? 'text-white'
                                : 'opacity-40 cursor-not-allowed'
                            )}
                            style={userPoints >= item.pts
                              ? { background: 'linear-gradient(135deg, #FF5E00, #FF3A00)', boxShadow: '0 4px 14px rgba(255,58,0,0.35)' }
                              : { background: 'var(--bg-card)' }
                            }
                          >
                            {isRedeeming ? '...' : `${item.pts} pts`}
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settings Modal */}
                {activeModal === 'settings' && (
                  <div className="space-y-4">
                    <div
                      className="rounded-[24px] overflow-hidden border"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                    >
                      {[
                        { label: 'การสั่นตอบสนอง (Haptics)', sublabel: 'สั่นสัมผัสเมื่อแตะปุ่มและสั่งอาหาร', value: haptics, onToggle: () => { hapticLight(); setHaptics(!haptics) }, color: '#10B981', ariaLabel: 'สั่นเมื่อกดปุ่ม' },
                        { label: 'แจ้งเตือนสถานะออเดอร์', sublabel: 'เมื่อพ่อครัวเริ่มผัดและไรเดอร์ออกส่ง', value: notifOrders, onToggle: () => { hapticLight(); setNotifOrders(!notifOrders) }, color: '#FF5500', ariaLabel: 'แจ้งเตือนออเดอร์' },
                        { label: 'แจ้งเตือนหวยและโปรโมชัน', sublabel: 'ผลสลากกะเพรา 52 และโค้ดลับพิเศษ', value: notifPromos, onToggle: () => { hapticLight(); setNotifPromos(!notifPromos) }, color: '#FF5500', ariaLabel: 'แจ้งเตือนโปรโมชัน' },
                      ].map((s, i, arr) => (
                        <div key={i}>
                          <div className="flex items-center justify-between px-5 py-4">
                            <div>
                              <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.sublabel}</p>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={s.value}
                              aria-label={s.ariaLabel}
                              onClick={s.onToggle}
                              className="w-13 h-7 rounded-full flex items-center px-1 transition-colors cursor-pointer"
                              style={{
                                background: s.value ? s.color : '#CBD5E1',
                                border: '1px solid var(--border-soft)',
                                width: 52,
                              }}
                            >
                              <div
                                className="w-5 h-5 bg-white rounded-full shadow-md transition-transform"
                                style={{ transform: s.value ? 'translateX(24px)' : 'translateX(0)' }}
                              />
                            </button>
                          </div>
                          {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--border-subtle)' }} />}
                        </div>
                      ))}
                    </div>

                    {/* Clear Cache & Diagnostics */}
                    <div
                      className="p-4 rounded-[22px] border space-y-2"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                      <h4 className="font-black text-xs" style={{ color: 'var(--text-primary)' }}>ข้อมูลระบบและแคช</h4>
                      <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        รีเฟรชข้อมูลแคชเพื่ออัปเดตเมนูและสถานะระบบล่าสุด
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          hapticHeavy()
                          localStorage.removeItem('kaprao_menu_cache')
                          addToast({ type: 'success', title: 'ล้างแคชสำเร็จ', message: 'รีเฟรชข้อมูลล่าสุดเรียบร้อยแล้ว' })
                        }}
                        className="w-full py-2.5 rounded-[14px] font-black text-xs border border-slate-200 hover:border-orange-400 text-slate-700 bg-white cursor-pointer transition-all shadow-sm"
                      >
                        🔄 ล้างแคชและซิงค์ข้อมูลใหม่
                      </button>
                    </div>
                  </div>
                )}

                {/* Help Modal */}
                {activeModal === 'help' && (
                  <div className="text-center py-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 relative"
                      style={{ background: 'rgba(0,195,0,0.12)', border: '1px solid rgba(0,195,0,0.20)' }}
                    >
                      <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ opacity: 0.3 }} />
                      <HelpCircle className="w-9 h-9 text-green-400 relative z-10" />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-2">แอดมินใจดี พร้อมตอบ!</h3>
                    <p className="text-sm font-medium mb-8 max-w-[260px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
                      สอบถามเมนู ยกเลิกออเดอร์ หรือเรื่องอื่นๆ ทักมาได้เลยครับ เปิดบริการตลอด 24 ชม.
                    </p>
                    <div className="space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { hapticHeavy(); window.open('https://line.me/R/ti/p/@kaprao52', '_blank') }}
                        className="w-full h-14 text-white rounded-[20px] font-black text-base flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, #00C300, #00A000)',
                          boxShadow: '0 8px 24px rgba(0,185,0,0.35)',
                        }}
                      >
                        แชทผ่าน LINE
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { hapticLight(); window.location.href = 'tel:0812345678' }}
                        className="w-full h-12 rounded-[18px] font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-soft)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Smartphone className="w-4.5 h-4.5" />
                        โทร 081-234-5678
                      </motion.button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rewards Marketplace E-Voucher Store */}
      <RewardsMarketplace
        isOpen={activeModal === 'rewards'}
        onClose={() => setActiveModal(null)}
      />

      {/* Daily Check-In 7 Days Streak Modal */}
      <DailyCheckInModal
        isOpen={activeModal === 'checkin'}
        onClose={() => setActiveModal(null)}
      />

      {/* World-Class Auth & Onboarding Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}

function MenuSection({ title, items }: { title: string; items: MenuItemConfig[] }) {
  return (
    <div
      className="rounded-[28px] overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
    >
      <div
        className="px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h3 className="section-label">{title}</h3>
      </div>
      <div className="p-2 space-y-0.5">
        {items.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.98 }}
            onClick={item.onClick}
            className="w-full px-3 py-3 flex items-center gap-3.5 rounded-[20px] transition-colors cursor-pointer hover:bg-white/5 group"
          >
            <div
              className="w-11 h-11 rounded-[16px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: item.iconBg,
                border: `1px solid ${item.glowColor || 'var(--border-subtle)'}`,
                boxShadow: item.glowColor ? `0 4px 12px ${item.glowColor}` : 'none',
                color: item.iconColor,
              }}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-black text-[14px]" style={{ color: 'var(--text-primary)' }}>{item.label}</h4>
              {item.sublabel && (
                <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.sublabel}
                </p>
              )}
            </div>
            <ChevronRight
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              style={{ color: 'var(--text-micro)' }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
