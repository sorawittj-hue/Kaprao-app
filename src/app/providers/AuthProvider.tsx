import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useUIStore } from '@/store'
import { initLiff, getLineProfile, isInLineApp, isLiffLoggedIn } from '@/lib/liff'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthProviderProps {
  children: React.ReactNode
}

// ─── Welcome Modal (World-Class Design) ──────────────────────────────────────
function WelcomeModal({
  isOpen,
  onLineLogin,
  onGuestLogin,
  isLoading,
}: {
  isOpen: boolean
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
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0 32px 80px -12px rgba(0,0,0,0.35)' }}
          >
            {/* Decorative top gradient */}
            <div
              className="h-2 w-full"
              style={{ background: 'linear-gradient(90deg, #FF6B00, #FF8C42, #FFB347, #FF6B00)', backgroundSize: '200%' }}
            />

            <div className="p-6">
              {/* Logo + Title */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                  className="w-20 h-20 rounded-[22px] mx-auto mb-4 flex items-center justify-center relative"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C42 50%, #FFB347 100%)',
                    boxShadow: '0 12px 32px -6px rgba(255, 107, 0, 0.45)',
                  }}
                >
                  <span className="text-white font-black text-4xl">K</span>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-sm"
                    style={{ boxShadow: '0 4px 10px rgba(34,197,94,0.5)' }}
                  >
                    🔥
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black text-gray-900 mb-1"
                >
                  ยินดีต้อนรับ!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-gray-500 text-sm leading-relaxed"
                >
                  กะเพรา 52 — เมนูเด็ด สั่งง่าย ส่งไวถึงที่
                </motion.p>
              </div>

              {/* Benefits Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 gap-2.5 mb-6"
              >
                {[
                  { icon: '⭐', label: 'สะสมแต้ม', sub: 'ทุกออเดอร์' },
                  { icon: '🎟️', label: 'ลุ้นหวย', sub: 'รอบรัฐบาล' },
                  { icon: '🎁', label: 'แลกรางวัล', sub: 'อิ่มฟรี!' },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="rounded-2xl p-3 text-center"
                    style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' }}
                  >
                    <div className="text-2xl mb-1">{b.icon}</div>
                    <p className="text-[11px] font-black text-gray-700 leading-tight">{b.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{b.sub}</p>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-3"
              >
                {/* LINE Login - Primary */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onLineLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isLoading ? '#aaa' : '#00B900',
                    boxShadow: '0 8px 24px -4px rgba(0, 185, 0, 0.45)',
                  }}
                >
                  {/* LINE Logo SVG */}
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.086.532c0 .225-.177.405-.399.405h-.001c-.221 0-.399-.18-.399-.405v-.164h.8v.164zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
                  </svg>
                  <span className="text-base">
                    {isLoading ? 'กำลังโหลด...' : 'เข้าสู่ระบบด้วย LINE'}
                  </span>
                </motion.button>

                {/* Guest - Secondary */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onGuestLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 font-bold py-3.5 rounded-2xl transition-all disabled:opacity-50 border-2 border-gray-200 hover:border-gray-300 bg-white"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">ดูเมนูก่อน (ไม่ต้อง Login)</span>
                </motion.button>
              </motion.div>

              {/* Fine print */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed"
              >
                สั่งในโหมด Guest ได้เลย — เข้าสู่ระบบทีหลังก็ยังได้พอยต์คืน! 🎉
              </motion.p>
            </div>
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
  const [isInitializing, setIsInitializing] = useState(true)

  // Handle LIFF session after LINE login
  const handleLiffSession = useCallback(async (profile: {
    userId: string
    displayName: string
    pictureUrl?: string
  }) => {
    console.log('📝 Processing LINE session for:', profile.displayName)
    let supabaseUserId: string | null = null

    try {
      // Look up existing profile by LINE user ID
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, points, total_orders')
        .eq('line_user_id', profile.userId)
        .maybeSingle() as { data: { id: string; points: number; total_orders: number } | null }

      if (existingProfile?.id) {
        supabaseUserId = existingProfile.id
        console.log('✅ Found existing profile with', existingProfile.points, 'points')
      } else {
        // New user — create Supabase anonymous session
        console.log('🆕 Creating new user for:', profile.displayName)
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        supabaseUserId = data.user?.id || null
      }
    } catch (e) {
      console.error('❌ Auth lookup error:', e)
      setGuest()
      return
    }

    if (!supabaseUserId) {
      console.error('❌ No Supabase user ID')
      setGuest()
      return
    }

    // Build initial user state
    const userData: User = {
      id: supabaseUserId,
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      points: 0,
      totalOrders: 0,
      tier: 'MEMBER',
      createdAt: new Date().toISOString(),
    }

    setUser(userData)

    // Save for fast restore on next visit
    localStorage.setItem('kaprao_user_data', JSON.stringify({
      userId: supabaseUserId,
      lineUserId: profile.userId,
      name: profile.displayName,
      image: profile.pictureUrl,
    }))

    // Sync profile to Supabase (upsert)
    try {
      await supabase.from('profiles').upsert({
        id: supabaseUserId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
        line_user_id: profile.userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

      // Load actual points from DB
      const { data: profileData } = await supabase
        .from('profiles')
        .select('points, total_orders, tier')
        .eq('id', supabaseUserId)
        .single() as { data: { points: number; total_orders: number; tier: string } | null }

      if (profileData) {
        setUser({
          ...userData,
          points: profileData.points || 0,
          totalOrders: profileData.total_orders || 0,
          tier: (profileData.tier as User['tier']) || 'MEMBER',
        })
      }
    } catch (e) {
      console.warn('⚠️ Profile sync warning:', e)
    }

    // ─── 🌟 MAGIC: Sync Guest to Member after LINE login ─────────────
    try {
      const guestIdentityStr = localStorage.getItem('kaprao_guest_identity')

      if (guestIdentityStr && supabaseUserId) {
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

        console.log(`🎁 Syncing guest ${guestId} to member ${supabaseUserId}...`)

        const { data, error } = await (supabase.rpc as any)('sync_guest_to_member', {
          p_guest_id: guestId,
          p_user_id: supabaseUserId,
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
            .eq('id', supabaseUserId)
            .single()

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
  const handleLineLogin = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔐 Starting LINE login...')

      // Development mock
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🚧 Dev mode: mocking LINE login...')
        const mockProfile = {
          userId: 'local-dev-' + Math.random().toString(36).slice(2, 8),
          displayName: 'Dev User 🧑‍💻',
          pictureUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        }
        await handleLiffSession(mockProfile)
        setShowWelcome(false)
        return
      }

      const liff = (await import('@line/liff')).default
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href })
      }
    } catch (error) {
      console.error('❌ LINE login error:', error)
      setLoading(false)
    }
  }, [setLoading, handleLiffSession])

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
          displayName: data.display_name || 'Guest',
          pictureUrl: data.picture_url,
          points: data.points || 0,
          totalOrders: data.total_orders || 0,
          tier: data.tier || 'MEMBER',
          createdAt: data.created_at || new Date().toISOString(),
        }

        // If this is actually a real LINE user (has line_user_id), set them as authenticated
        if (data.line_user_id) {
          setUser(restoredUser)
        } else {
          // Anonymous guest session — treat as guest
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
        console.log('🚀 Initializing auth...')

        // 1. Fast restore from localStorage (the most common path for returning users)
        const savedUser = localStorage.getItem('kaprao_user_data')
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser)
            if (parsed.userId && parsed.lineUserId) {
              // Real LINE user — restore immediately
              const restoredUser: User = {
                id: parsed.userId,
                lineUserId: parsed.lineUserId,
                displayName: parsed.name || 'User',
                pictureUrl: parsed.image,
                points: 0,
                totalOrders: 0,
                tier: 'MEMBER',
                createdAt: new Date().toISOString(),
              }
              setUser(restoredUser)
              setLoading(false)
              setIsInitializing(false)

              // Background sync — refresh points from server
              void (async () => {
                try {
                  const { data } = await supabase
                    .from('profiles')
                    .select('points, total_orders, tier, display_name, picture_url')
                    .eq('id', parsed.userId)
                    .maybeSingle()
                  if (data) {
                    setUser({
                      ...restoredUser,
                      points: (data as any).points || 0,
                      totalOrders: (data as any).total_orders || 0,
                      tier: (data as any).tier || 'MEMBER',
                      displayName: (data as any).display_name || restoredUser.displayName,
                      pictureUrl: (data as any).picture_url || restoredUser.pictureUrl,
                    })
                  }
                } catch (e) {
                  console.warn('⚠️ Background sync:', e)
                }
              })()

              // Check if LIFF has completed login and we need to sync guest orders
              const guestIdentityStr = localStorage.getItem('kaprao_guest_identity')
              if (guestIdentityStr && parsed.userId) {
                // We came back from LIFF redirect with guest identity — try to sync
                try {
                  const guestIdentity = JSON.parse(guestIdentityStr)
                  const guestId = guestIdentity.id
                  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guestId)

                  if (!isValidUUID) {
                    localStorage.removeItem('kaprao_guest_identity')
                    throw new Error('Invalid legacy guestId')
                  }

                  const { data, error } = await (supabase.rpc as any)('sync_guest_to_member', {
                    p_guest_id: guestId,
                    p_user_id: parsed.userId,
                  })
                  if (!error && (data as any)?.success) {
                    const pts = (data as any).points_added || 0
                    const orders = (data as any).orders_synced || 0
                    if (pts > 0 || orders > 0) {
                      useUIStore.getState().addToast({
                        type: 'success',
                        title: `🎉 ได้รับ ${pts} พอยต์และเชื่อมต่อ ${orders} ออเดอร์!`,
                        message: `บัญชีของคุณพร้อมใช้งานแล้ว ✨`,
                        duration: 6000,
                      })
                      // Get fresh points from DB
                      const { data: profileData } = await supabase
                        .from('profiles')
                        .select('points')
                        .eq('id', parsed.userId)
                        .single()
                      setUser({ ...restoredUser, points: (profileData as any)?.points || pts })
                    }
                    // Clear guest identity after sync
                    localStorage.removeItem('kaprao_guest_identity')
                  }
                } catch (_) { /* noop */ }
                sessionStorage.removeItem('pending_guest_order_id')
                sessionStorage.removeItem('pending_guest_tracking_token')
              }
              return
            }
          } catch (e) {
            localStorage.removeItem('kaprao_user_data')
          }
        }

        // 2. Check if user has chosen guest this session already
        const isGuestSession = sessionStorage.getItem('kaprao_guest_mode')
        if (isGuestSession) {
          console.log('👤 Guest session from sessionStorage')
          setGuest()
          setLoading(false)
          setIsInitializing(false)
          return
        }

        // 3. Check active Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          console.log('✅ Active Supabase session found')
          await handleUserSession(session.user)
          setLoading(false)
          setIsInitializing(false)
          return
        }

        // 4. Try LIFF (if inside LINE app)
        console.log('🔍 Trying LIFF initialization...')
        const liffInitialized = await initLiff()

        if (liffInitialized && isInLineApp() && isLiffLoggedIn()) {
          console.log('✅ Already logged in via LIFF')
          const profile = await getLineProfile()
          if (profile) {
            await handleLiffSession(profile)
            setLoading(false)
            setIsInitializing(false)
            return
          }
        }

        // 5. New user — show welcome modal
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
        onLineLogin={handleLineLogin}
        onGuestLogin={handleGuestLogin}
        isLoading={isInitializing}
      />
    </>
  )
}

export default AuthProvider
