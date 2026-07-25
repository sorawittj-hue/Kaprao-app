import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, Clock, RefreshCw, Smartphone, PackageX, Zap } from 'lucide-react'
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
    <div className="min-h-screen pb-32" style={{ background: 'var(--page-bg)' }}>

      {/* Ambient orbs */}
      <div className="fixed top-0 inset-x-0 pointer-events-none z-0 overflow-hidden" style={{ height: '40vh' }}>
        <div
          className="absolute -top-16 right-0 w-64 h-64 rounded-full opacity-10 blur-[60px]"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />
      </div>

      <Container className="py-5 relative z-10 px-4 space-y-5">

        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); navigate(-1) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            style={{
              background: 'white',
              boxShadow: '0 2px 12px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <div className="text-center">
            <h1 className="text-[17px] font-black tracking-tight text-gray-900">ประวัติออเดอร์</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mt-0.5">Order History</p>
          </div>

          <motion.button
            type="button"
            aria-label="โหลดข้อมูลใหม่"
            aria-busy={isRefetching}
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticMedium(); refetch() }}
            className={cn(
              'w-11 h-11 rounded-[16px] flex items-center justify-center text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              isRefetching ? 'opacity-50 pointer-events-none' : ''
            )}
            style={{
              background: 'white',
              boxShadow: '0 2px 12px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)'
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
                className="rounded-[20px] p-4 relative overflow-hidden"
                style={{
                  background: 'white',
                  boxShadow: '0 4px 20px -6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-sm mb-0.5">ผู้เยี่ยมชมระบบ</p>
                    <p className="text-gray-400 text-[10px] font-bold">เชื่อมต่อ LINE เพื่อบันทึกประวัติถาวร</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogin}
                    aria-label="เข้าสู่ระบบด้วย LINE"
                    className="text-white px-4 py-2.5 rounded-full font-black text-xs flex items-center gap-1.5 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B900] focus-visible:ring-offset-2 active:scale-95 transition-transform"
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

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 pt-2">
            {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : !orders?.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 25 }}
            className="flex flex-col items-center text-center pt-16 pb-10"
          >
            <div
              className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <PackageX className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="font-black text-2xl text-gray-900 tracking-tight mb-2">หิวรึยัง?</h2>
            <p className="text-sm font-medium text-gray-400 mb-8 max-w-[240px] leading-relaxed">
              ดูเหมือนคุณยังไม่เคยสั่งอาหารกับกะเพรา 52 มาลองเมนูเด็ดๆ กัน!
            </p>
            <button
              type="button"
              onClick={() => { hapticHeavy(); navigate('/') }}
              className="font-black text-sm text-white h-14 px-8 rounded-full flex items-center gap-2 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)',
                boxShadow: '0 8px 24px -6px rgba(0,0,0,0.3)'
              }}
            >
              <Zap className="w-4 h-4" />
              ดูเมนูอาหาร
            </button>
          </motion.div>
        ) : (
          <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6 pt-2 pb-16">

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <motion.section variants={slideUpItem}>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}
                  >
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-white/20"
                    />
                    <Clock className="w-4.5 h-4.5 text-white relative z-10" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-[15px]">กำลังดำเนินการ</h2>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{activeOrders.length} ออเดอร์กำลังทำ</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="active:scale-[0.98] transition-transform">
                      <OrderCard order={order} onClick={() => { hapticLight(); navigate(`/orders/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`) }} />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <motion.section
                variants={slideUpItem}
                className={cn('pt-4', activeOrders.length > 0 ? 'border-t border-dashed border-gray-200' : '')}
              >
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    <CheckCircle className="w-4.5 h-4.5 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-600 text-[15px]">เสร็จสิ้นแล้ว</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pastOrders.length} ออเดอร์</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <div key={order.id} className="opacity-75 hover:opacity-100 active:scale-[0.98] transition-all">
                      <OrderCard order={order} onClick={() => { hapticLight(); navigate(`/orders/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`) }} />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* End Note */}
            <div className="pt-6 text-center">
              <p className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-300">แสดงรายการทั้งหมดแล้ว ✓</p>
            </div>

          </motion.div>
        )}
      </Container>
    </div>
  )
}
