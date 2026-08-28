import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useUIStore } from '@/store'
import { initLiff, getLineProfile, isLiffLoggedIn } from '@/lib/liff'
import { supabase, isConfigured } from '@/lib/supabase'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { AuthModal } from '@/components/auth/AuthModal'
import { hapticHeavy, hapticMedium } from '@/utils/haptics'
import type { User } from '@/types'

interface AuthProviderProps {
  children: React.ReactNode
}

// ─── Welcome Modal (World-Class Design) ──────────────────────────────────────
function WelcomeModal({
  isOpen,
  onPhoneLogin,
  onLineLogin,
  onGuestLogin,
  isLoading,
}: {
  isOpen: boolean
  onPhoneLogin: () => void
  onLineLogin: () => void
  onGuestLogin: () => void
  isLoading: boolean
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)' }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-sm rounded-t-[36px] sm:rounded-[36px] overflow-hidden p-6 pb-9 shadow-2xl space-y-5"
            style={{ background: 'var(--bg-base)' }}
          >
            {/* Logo + Title */}
            <div className="text-center pt-2">
              <div className="flex justify-center mb-3">
                <BrandLogo size="lg" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1">
                ยินดีต้อนรับสู่ กะเพรา 52
              </h2>
              <p className="text-xs font-bold text-slate-500 max-w-xs mx-auto">
                ต้นตำรับผัดกะเพราพรีเมียม สั่งง่าย ส่งไวถึงที่
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🎁', label: 'รับแต้มฟรี', sub: '+50 pts ทันที' },
                { icon: '🎟️', label: 'สลากกินฟรี', sub: 'รอบรัฐบาล' },
                { icon: '⚡', label: 'สูตรโปรด', sub: 'สั่งไว 1 คลิก' },
              ].map((b) => (
                <div
                  key={b.label}
                  className="rounded-[18px] p-2.5 text-center border border-amber-200/60 bg-gradient-to-b from-amber-50/80 to-orange-50/40"
                >
                  <div className="text-xl mb-0.5">{b.icon}</div>
                  <p className="text-[11px] font-black text-slate-900 leading-tight">{b.label}</p>
                  <p className="text-[9px] font-bold text-amber-800 mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Phone Login - Primary (Fastest & Most Reliable) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  hapticHeavy()
                  onPhoneLogin()
                }}
                disabled={isLoading}
                className="w-full h-13 flex items-center justify-center gap-2.5 text-white font-black text-sm rounded-[20px] shadow-lg shadow-orange-500/25 transition-all disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                }}
              >
                <span>📱 เข้าสู่ระบบด้วยเบอร์โทร (รับ 50 pts)</span>
              </motion.button>

              {/* LINE Login - Secondary */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  hapticHeavy()
                  onLineLogin()
                }}
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2.5 text-white font-bold text-xs rounded-[18px] shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #00C300, #00A000)',
                }}
              >
                <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.086.532c0 .225-.177.405-.399.405h-.001c-.221 0-.399-.18-.399-.405v-.164h.8v.164zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
                </svg>
                <span>เข้าสู่ระบบด้วย LINE</span>
              </motion.button>

              {/* Guest - Tertiary */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  hapticMedium()
                  onGuestLogin()
                }}
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2 text-slate-600 font-bold text-xs rounded-[16px] border border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer transition-all"
              >
                <span>ดูเมนูก่อน (สั่งได้เลย ไม่ต้อง Login)</span>
              </motion.button>
            </div>

            {/* Fine print */}
            <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
              🛡️ สั่งในโหมด Guest ได้ทันที — ใส่เบอร์ตอนสั่งเพื่อรับแต้มสะสมได้ 100%!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Points Claim Banner (shown after successful LINE login when pending order) ─
export function PendingOrderClaimBanner() {
  const pendingOrderId = sessionStorage.getItem('pending_guest_order_id')
  if (!pendingOrderId) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 right-4 z-[150] max-w-sm mx-auto"
    >
      <div
        className="rounded-2xl p-4 text-white flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #00B900, #00A000)', boxShadow: '0 8px 24px rgba(0,185,0,0.4)' }}
      >
        <div className="text-2xl animate-bounce">🎁</div>
        <div>
          <p className="font-black text-sm">กำลังโอนพอยต์เข้ากระเป๋า...</p>
          <p className="text-xs text-green-100">ออเดอร์ #{pendingOrderId} จะถูกเชื่อมกับบัญชีของคุณ</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Auth Provider ────────────────────────────────────────────────────────────
export function AuthProvider({ children }: AuthProviderProps) {
  const initialized = useRef(false)
  const { setUser, setGuest, setLoading } = useAuthStore()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Handle LIFF session after LINE login
  const handleLiffSession = useCallback(async (profile: {
    userId: string
    displayName: string
    pictureUrl?: string
  }) => {
    console.log('📝 Processing LINE session for:', profile.displayName)
    const userId = `usr_line_${profile.userId}`

    let existingPoints = 20
    let existingOrders = 0
    let existingTier: User['tier'] = 'MEMBER'
    let existingAdmin = false

    try {
      // Look up existing profile by LINE user ID or id
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, points, total_orders, tier, is_admin')
        .or(`line_user_id.eq.${profile.userId},id.eq.${userId}`)
        .maybeSingle() as { data: { id: string; points: number; total_orders: number; tier: string; is_admin: boolean } | null }

      if (existingProfile) {
        existingPoints = existingProfile.points ?? existingPoints
        existingOrders = existingProfile.total_orders ?? 0
        existingTier = (existingProfile.tier as User['tier']) ?? 'MEMBER'
        existingAdmin = existingProfile.is_admin ?? false
      }

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: userId,
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
        points: existingPoints,
        total_orders: existingOrders,
        tier: existingTier,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch (e) {
      console.warn('⚠️ Supabase sync warning during LINE session:', e)
    }

    const userData: User = {
      id: userId,
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      points: existingPoints,
      totalOrders: existingOrders,
      tier: existingTier,
      isAdmin: existingAdmin,
      createdAt: new Date().toISOString(),
    }

    setUser(userData)
    sessionStorage.removeItem('kaprao_guest_mode')
    localStorage.setItem('kaprao_user_data', JSON.stringify(userData))
    setShowWelcome(false)

    // ─── 🌟 MAGIC: Sync Guest to Member after LINE login ─────────────
    try {
      const guestIdentityStr = localStorage.getItem('kaprao_guest_identity')

      if (guestIdentityStr && userId) {
        const guestIdentity = JSON.parse(guestIdentityStr)
        const guestId = guestIdentity.id

        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guestId)
        if (!isValidUUID) {
          console.warn('⚠️ Invalid guestId format for sync, clearing local identity:', guestId)
          localStorage.removeItem('kaprao_guest_identity')
          sessionStorage.removeItem('pending_guest_order_id')
          sessionStorage.removeItem('pending_guest_tracking_token')
          return
        }

        console.log(`🎁 Syncing guest ${guestId} to member ${userId}...`)

        const { data, error } = await (supabase.rpc as any)('sync_guest_to_member', {
          p_guest_id: guestId,
          p_user_id: userId,
        })

        if (!error && (data as any)?.success) {
          const pointsAdded = (data as any).points_added || 0
          const ordersSynced = (data as any).orders_synced || 0
          const ticketsTransferred = (data as any).tickets_transferred || 0

          console.log(`🎉 Sync complete! +${pointsAdded} points, ${ordersSynced} orders, ${ticketsTransferred} tickets`)

          // Get updated points from DB
          const { data: profileData } = await supabase
            .from('profiles')
            .select('points, total_orders')
            .eq('id', userId)
            .maybeSingle()

          const newPoints = (profileData as any)?.points || pointsAdded
          const totalOrders = (profileData as any)?.total_orders || ordersSynced

          // Update user state with fresh data
          setUser({
            ...userData,
            points: newPoints,
            totalOrders: totalOrders,
          })

          // Show celebration toast
          if (pointsAdded > 0) {
            useUIStore.getState().addToast({
              type: 'success',
              title: `🎉 ได้รับ ${pointsAdded} พอยต์เข้ากระเป๋าแล้ว!`,
              message: `เชื่อมต่อออเดอร์ ${ordersSynced} รายการ และตั๋วหวย ${ticketsTransferred} ใบเรียบร้อย ✨`,
              duration: 6000,
            })
          } else {
            useUIStore.getState().addToast({
              type: 'success',
              title: 'เชื่อมต่อบัญชีสำเร็จ!',
              message: `บัญชีของคุณพร้อมใช้งานแล้ว`,
              duration: 4000,
            })
          }

          // Clear guest identity after successful sync
          localStorage.removeItem('kaprao_guest_identity')
        } else {
          console.warn('⚠️ Sync failed:', error || data)
        }

        // Clean up
        sessionStorage.removeItem('pending_guest_order_id')
        sessionStorage.removeItem('pending_guest_tracking_token')
      }
    } catch (e) {
      console.error('❌ Guest sync error:', e)
      sessionStorage.removeItem('pending_guest_order_id')
      sessionStorage.removeItem('pending_guest_tracking_token')
    }
  }, [setUser, setGuest])

  // Handle LINE login button press
  // Handle LINE login button press
  const handleLineLogin = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔐 Starting REAL LINE login via LIFF...')

      const { loginWithLine } = await import('@/lib/auth')
      const loggedInUser = await loginWithLine()
      if (loggedInUser) {
        setShowWelcome(false)
        useUIStore.getState().addToast({
          type: 'success',
          title: 'เข้าสู่ระบบด้วย LINE สำเร็จ! 💚',
          message: `ยินดีต้อนรับคุณ ${loggedInUser.displayName}`,
        })
      }
    } catch (error) {
      console.error('❌ LINE login error:', error)
      setLoading(false)
      useUIStore.getState().addToast({
        type: 'error',
        title: 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ',
        message: error instanceof Error ? error.message : 'กรุณาลองใหม่อีกครั้ง หรือเข้าสู่ระบบด้วยเบอร์โทรศัพท์',
        duration: 7000,
      })
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // Handle Guest access (no Supabase session needed — pure local state)
  const handleGuestLogin = useCallback(() => {
    console.log('👤 Guest access granted')
    setShowWelcome(false)
    setGuest()
    // Store guest preference so we don't show modal again this session
    sessionStorage.setItem('kaprao_guest_mode', 'true')
  }, [setGuest])

  // Handle existing Supabase session (returning anonymous user)
  const handleUserSession = useCallback(async (supabaseUser: { id: string }) => {
    console.log('👤 Restoring Supabase session:', supabaseUser.id)

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle() as { data: any }

      if (data) {
        const restoredUser: User = {
          id: supabaseUser.id,
          lineUserId: data.line_user_id,
          phoneNumber: data.phone_number,
          displayName: data.display_name || 'สมาชิกกะเพรา 52',
          pictureUrl: data.picture_url,
          points: data.points || 0,
          totalOrders: data.total_orders || 0,
          tier: data.tier || 'MEMBER',
          isAdmin: data.is_admin || false,
          createdAt: data.created_at || new Date().toISOString(),
        }

        if (data.line_user_id || data.phone_number) {
          setUser(restoredUser)
        } else {
          setGuest()
        }
      } else {
        setGuest()
      }
    } catch (e) {
      console.warn('⚠️ Session restore warning:', e)
      setGuest()
    }
  }, [setUser, setGuest])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        console.log('🚀 Initializing auth & LIFF...')

        // 1. Initialize LIFF FIRST to handle any OAuth redirect callbacks or in-app LINE sessions
        const [supabaseResult, liffInitialized] = await Promise.all([
          isConfigured ? supabase.auth.getSession() : Promise.resolve({ data: { session: null }, error: null }),
          initLiff()
        ])

        if (liffInitialized && isLiffLoggedIn()) {
          console.log('✅ Active LINE LIFF session detected')
          const profile = await getLineProfile()
          if (profile) {
            await handleLiffSession(profile)
            setLoading(false)
            setIsInitializing(false)
            return
          }
        }

        // 2. Fast restore from localStorage
        const savedUser = localStorage.getItem('kaprao_user_data')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            if (parsed.id || parsed.userId) {
              const restoredUser: User = {
                id: parsed.id || parsed.userId,
                lineUserId: parsed.lineUserId,
                phoneNumber: parsed.phoneNumber,
                displayName: parsed.displayName || parsed.name || 'สมาชิกกะเพรา 52',
                pictureUrl: parsed.pictureUrl || parsed.image,
                points: parsed.points || 0,
                totalOrders: parsed.totalOrders || 0,
                tier: parsed.tier || 'MEMBER',
                isAdmin: parsed.isAdmin || false,
                createdAt: parsed.createdAt || new Date().toISOString(),
              }
              setUser(restoredUser)
              setLoading(false)
              setIsInitializing(false)

              // Background sync points
              void (async () => {
                try {
                  const { data } = await supabase
                    .from('profiles')
                    .select('points, total_orders, tier, display_name, picture_url, is_admin')
                    .eq('id', restoredUser.id)
                    .maybeSingle()

                  if (data) {
                    setUser({
                      ...restoredUser,
                      points: (data as any).points ?? restoredUser.points,
                      totalOrders: (data as any).total_orders ?? restoredUser.totalOrders,
                      tier: (data as any).tier || restoredUser.tier,
                      displayName: (data as any).display_name || restoredUser.displayName,
                      pictureUrl: (data as any).picture_url || restoredUser.pictureUrl,
                      isAdmin: (data as any).is_admin || false,
                    })
                  }
                } catch (e) {
                  console.warn('⚠️ Background sync:', e)
                }
              })()
              return
            }
          } catch (e) {
            localStorage.removeItem('kaprao_user_data')
          }
        }

        // 3. Check Supabase session
        const session = supabaseResult?.data?.session
        if (isConfigured && session?.user) {
          console.log('✅ Active Supabase session found')
          await handleUserSession(session.user)
          setLoading(false)
          setIsInitializing(false)
          return
        }

        // 4. Check returning guest session
        const isGuestSession = sessionStorage.getItem('kaprao_guest_mode')
        const existingGuestIdentity = localStorage.getItem('kaprao_guest_identity')
        if (isGuestSession || existingGuestIdentity) {
          setGuest()
          setLoading(false)
          setIsInitializing(false)
          return
        }

        // 5. New visitor — show welcome screen
        console.log('👋 New visitor — showing welcome screen')
        setShowWelcome(true)
        setGuest()

      } catch (err) {
        console.error('❌ Auth init error:', err)
        setGuest()
      } finally {
        setLoading(false)
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [setUser, setGuest, setLoading, handleLiffSession, handleUserSession])

  return (
    <>
      {children}
      <WelcomeModal
        isOpen={showWelcome && !isInitializing}
        onPhoneLogin={() => {
          setShowWelcome(false)
          setIsAuthModalOpen(true)
        }}
        onLineLogin={handleLineLogin}
        onGuestLogin={handleGuestLogin}
        isLoading={isInitializing}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  )
}

export default AuthProvider
