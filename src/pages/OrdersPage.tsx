import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, LogIn } from 'lucide-react'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { useAuthStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { OrderCard } from '@/features/orders/components/OrderCard'
import { OrderCardSkeleton } from '@/components/ui/Skeleton'
import { staggerContainer, fadeInUp } from '@/animations/variants'
import { trackPageView } from '@/lib/analytics'
import { getOrCreateGuestIdentity } from '@/features/v2/api/unifiedOrderApi'

export default function OrdersPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()

  const guestIdentity = isGuest ? getOrCreateGuestIdentity() : null

  // Use persistent ID for fetching orders
  const { data: orders, isLoading, refetch } = useOrders(
    user?.id,
    user?.lineUserId,
    undefined,
    guestIdentity?.id
  )

  useEffect(() => {
    trackPageView('/orders', 'Orders')
  }, [])

  const activeOrders = orders?.filter(
    (o) => ['placed', 'confirmed', 'preparing', 'ready'].includes(o.status)
  )
  const pastOrders = orders?.filter(
    (o) => ['delivered', 'cancelled'].includes(o.status)
  )

  return (
    <div className="min-h-screen pb-28" style={{ background: '#FAFAF9' }}>
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
      <Container className="py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-sm border border-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">รายการสั่งซื้อของคุณ</h1>
            {orders && orders.length > 0 && (
              <p className="text-sm text-gray-400 mt-1 font-medium">{orders.length} ออเดอร์ทั้งหมด</p>
            )}
          </div>
          {/* Refresh button */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={() => refetch()}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>

        {/* Guest Login Prompt */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00B900 0%, #00A000 100%)',
              boxShadow: '0 8px 24px -4px rgba(0,185,0,0.35)',
            }}
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
                👤
              </div>
              <div className="flex-1">
                <p className="font-black text-white text-sm">เข้าสู่ระบบเพื่อดูออเดอร์ทั้งหมด</p>
                <p className="text-green-100 text-xs mt-0.5">ด้วย LINE — ดูประวัติ สะสมพอยต์ ลุ้นหวย</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  const { loginWithLine } = await import('@/lib/auth')
                  await loginWithLine()
                }}
                className="flex items-center gap-1.5 bg-white text-green-700 font-black text-xs px-3 py-2 rounded-xl flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </motion.button>
            </div>
          </motion.div>
        )}



        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : !orders?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >

            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-tr from-orange-100 to-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-20"></div>
                <span className="text-4xl drop-shadow-sm">🛵</span>
              </div>
              <h2 className="font-black text-gray-800 text-2xl mb-2">หิวรึยังคะ?</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-[260px] mx-auto font-medium">
                {isGuest ? 'ดูเหมือนคุณจะยังไม่เคยสั่งอาหารเลย' : 'คุณยังไม่เคยสั่งอาหารกับกะเพรา 52'}<br />
                มาลองเมนูเด็ดๆ กันเลยดีไหม!
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/')}
                className="w-full max-w-[260px] mx-auto py-3.5 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C42)', boxShadow: '0 8px 24px -6px rgba(255,107,0,0.45)' }}
              >
                <span className="text-xl">🥗</span>
                ดูเมนูอาหารทั้งหมด
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Active Orders */}
            {activeOrders && activeOrders.length > 0 && (
              <motion.section variants={fadeInUp}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.4)' }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-2.5 h-2.5 bg-white rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-800">กำลังดำเนินการ</h2>
                    <p className="text-xs font-bold text-blue-600">{activeOrders.length} ออเดอร์</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Past Orders */}
            {pastOrders && pastOrders.length > 0 && (
              <motion.section variants={fadeInUp} className="pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}
                  >
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-500">ประวัติการสั่งซื้อ</h2>
                    <p className="text-xs font-bold text-gray-400">{pastOrders.length} ออเดอร์</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Guest: invite to link LINE after seeing orders */}
            {isGuest && orders && orders.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="rounded-2xl p-4 text-center"
                style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '1px solid #A7F3D0' }}
              >
                <p className="text-sm font-bold text-green-800 mb-1">💡 ยังเป็นไอดีผู้เยี่ยมชมอยู่</p>
                <p className="text-xs text-green-600 mb-3">
                  เข้าสู่ระบบ LINE เพื่อบันทึกประวัติการสั่งซื้อนี้ และสะสมพอยต์ในครั้งหน้า!
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    const { loginWithLine } = await import('@/lib/auth')
                    await loginWithLine()
                  }}
                  className="px-6 py-2.5 rounded-xl font-black text-white text-sm"
                  style={{ background: '#00B900', boxShadow: '0 4px 12px rgba(0,185,0,0.4)' }}
                >
                  เข้าสู่ระบบ LINE ตอนนี้
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </Container>
    </div>
  )
}
