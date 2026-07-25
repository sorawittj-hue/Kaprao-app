import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, RefreshCw, Smartphone, PackageX, Zap } from 'lucide-react'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { OrderCard } from '@/features/orders/components/OrderCard'
import { OrderCardSkeleton } from '@/components/ui/Skeleton'
import { trackPageView } from '@/lib/analytics'
import { useSEO } from '@/hooks/useSEO'
import { getOrCreateGuestIdentity } from '@/features/v2/api/unifiedOrderApi'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { cn } from '@/utils/cn'

const slideUpItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const guestIdentity = isGuest ? getOrCreateGuestIdentity() : null

  const { data: orders, isLoading, refetch, isRefetching } = useOrders(
    user?.id,
    user?.lineUserId,
    undefined,
    guestIdentity?.id
  )

  useEffect(() => {
    trackPageView('/orders', 'Orders')
    window.scrollTo(0, 0)
  }, [])

  useSEO({
    title: 'ประวัติการสั่งซื้อ | กะเพรา 52',
    description: 'ติดตามสถานะออเดอร์และดูประวัติการสั่งซื้อกะเพราของคุณ'
  })

  const activeOrders = orders?.filter(o => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)) || []
  const pastOrders = orders?.filter(o => ['delivered', 'cancelled'].includes(o.status)) || []

  const handleLogin = async () => {
    hapticHeavy()
    try {
      const { loginWithLine } = await import('@/lib/auth')
      await loginWithLine()
    } catch {
      addToast({ type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง' })
    }
  }

  return (
    <div className="min-h-screen pb-32 relative" style={{ background: 'var(--bg-base)' }}>

      {/* Ambient orbs */}
      <div className="fixed top-0 inset-x-0 pointer-events-none z-0 overflow-hidden" style={{ height: '40vh' }}>
        <div
          className="absolute -top-16 right-0 w-64 h-64 rounded-full opacity-15 blur-[60px]"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />
      </div>

      <Container className="py-4 relative z-10 space-y-5 max-w-2xl mx-auto px-4">

        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); navigate(-1) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <div className="text-center">
            <h1 className="text-[17px] font-black tracking-tight text-white">ประวัติออเดอร์</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-400 mt-0.5">Order History</p>
          </div>

          <motion.button
            type="button"
            aria-label="โหลดข้อมูลใหม่"
            aria-busy={isRefetching}
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticMedium(); refetch() }}
            className={cn(
              'w-11 h-11 rounded-[16px] flex items-center justify-center text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              isRefetching ? 'opacity-50 pointer-events-none' : ''
            )}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <RefreshCw className={cn('w-4.5 h-4.5', isRefetching ? 'animate-spin' : '')} aria-hidden="true" />
          </motion.button>
        </div>

        {/* Guest Banner */}
        <AnimatePresence>
          {isGuest && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div
                className="rounded-[20px] p-4 relative overflow-hidden border border-white/10"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-black text-white text-sm mb-0.5">ผู้เยี่ยมชมระบบ</p>
                    <p className="text-gray-400 text-[10px] font-bold">เชื่อมต่อ LINE เพื่อบันทึกประวัติถาวร</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogin}
                    aria-label="เข้าสู่ระบบด้วย LINE"
                    className="text-white px-4 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #00C900, #00A000)',
                      boxShadow: '0 6px 16px -4px rgba(0,185,0,0.4)'
                    }}
                  >
                    <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                    Login
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Content */}
        {isLoading ? (
          <div className="space-y-4">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] p-10 text-center border border-white/10"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--bg-card)]/5 flex items-center justify-center mx-auto mb-4 border border-white/10 text-gray-500">
              <PackageX className="w-8 h-8" />
            </div>
            <h2 className="font-black text-white text-lg mb-1">ยังไม่มีประวัติการสั่งซื้อ</h2>
            <p className="text-xs text-gray-400 font-medium mb-6">คุณยังไม่ได้ทำการสั่งซื้อรายการอาหารใดๆ</p>
            <button
              onClick={() => navigate('/')}
              className="btn-brand px-6 py-3 rounded-full font-black text-xs inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> สั่งอาหารเลย!
            </button>
          </motion.div>
        ) : (
          <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6">

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <motion.div variants={slideUpItem} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <h2 className="text-sm font-black text-white">กำลังดำเนินการ ({activeOrders.length})</h2>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => navigate(`/orders/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Past Orders Section */}
            {pastOrders.length > 0 && (
              <motion.div variants={slideUpItem} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-black text-white">ประวัติที่ผ่านมา ({pastOrders.length})</h2>
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="space-y-3">
                  {pastOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => navigate(`/orders/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

      </Container>
    </div>
  )
}
