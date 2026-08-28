import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RefreshCw, Smartphone, ChevronRight, ShoppingBag } from 'lucide-react'
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
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')
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
  const completedOrders = orders?.filter(o => ['delivered', 'cancelled'].includes(o.status)) || []

  const displayedOrders = activeTab === 'active'
    ? activeOrders
    : activeTab === 'completed'
    ? completedOrders
    : (orders || [])

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
    <div className="min-h-screen pb-36 relative" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-12 w-[340px] h-[340px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #FF5500 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      <Container className="py-4 relative z-10 space-y-4 max-w-2xl mx-auto px-4">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between pt-1">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.88 }}
            onClick={() => { hapticLight(); navigate('/') }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center cursor-pointer shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
          </motion.button>

          <div className="text-center">
            <h1 className="text-base font-black tracking-tight text-slate-900">ประวัติคำสั่งซื้อ</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-500 mt-0.5">
              ORDER TRACKER
            </p>
          </div>

          <motion.button
            type="button"
            aria-label="โหลดข้อมูลใหม่"
            aria-busy={isRefetching}
            whileTap={{ scale: 0.88 }}
            onClick={() => { hapticMedium(); refetch() }}
            className={cn(
              'w-11 h-11 rounded-[18px] flex items-center justify-center cursor-pointer shadow-sm',
              isRefetching ? 'opacity-50 pointer-events-none' : ''
            )}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <RefreshCw
              className={cn('w-4.5 h-4.5 text-slate-700', isRefetching ? 'animate-spin' : '')}
              aria-hidden="true"
            />
          </motion.button>
        </div>

        {/* ── Guest Sync Card ── */}
        <AnimatePresence>
          {isGuest && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-[24px] p-4 flex items-center justify-between gap-3 border shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs text-amber-950">บันทึกประวัติถาวร</p>
                <p className="text-[11px] font-medium text-amber-900/80 mt-0.5">
                  ผูก LINE เพื่อรับแต้มสะสม & ลุ้นหวยฟรีทุกออเดอร์
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={handleLogin}
                className="text-white px-3.5 py-2 rounded-full font-black text-xs flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-md"
                style={{ background: '#00C300' }}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>ผูก LINE</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filter Tabs ── */}
        <div
          className="flex p-1 rounded-[18px] border shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
        >
          {[
            { id: 'all', label: 'ทั้งหมด', count: orders?.length || 0 },
            { id: 'active', label: 'กำลังทำ', count: activeOrders.length, highlight: activeOrders.length > 0 },
            { id: 'completed', label: 'สำเร็จแล้ว', count: completedOrders.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  hapticLight()
                  setActiveTab(tab.id as any)
                }}
                className={cn(
                  'flex-1 py-2.5 rounded-[14px] font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer relative',
                  isActive ? 'text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                )}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                        boxShadow: '0 3px 12px rgba(255, 85, 0, 0.30)',
                      }
                    : {}
                }
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-black px-1.5 py-0.2 rounded-full',
                      isActive
                        ? 'bg-white/25 text-white'
                        : tab.highlight
                        ? 'bg-orange-100 text-orange-600 font-black'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Orders Feed ── */}
        {isLoading ? (
          <div className="space-y-3 pt-2">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : displayedOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[28px] p-8 text-center border shadow-sm space-y-4 my-6"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-soft)',
            }}
          >
            <div
              className="w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(255, 85, 0, 0.08)',
                border: '1px solid rgba(255, 85, 0, 0.15)',
              }}
            >
              <ShoppingBag className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {activeTab === 'active'
                  ? 'ไม่มีออเดอร์ที่กำลังดำเนินการ'
                  : activeTab === 'completed'
                  ? 'ยังไม่มีประวัติออเดอร์ที่เสร็จสิ้น'
                  : 'ยังไม่มีประวัติการสั่งซื้อ'}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs mx-auto">
                หิวกะเพราร้อน ๆ รสเด็ด สั่งตอนนี้รอรับความอร่อยได้ทันที!
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticMedium()
                navigate('/')
              }}
              className="px-6 py-3 rounded-full font-black text-xs text-white cursor-pointer shadow-md inline-flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
              }}
            >
              <span>สั่งอาหารเลย</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-3 pt-1">
            {displayedOrders.map((order) => (
              <motion.div key={order.id} variants={slideUpItem}>
                <OrderCard order={order} />
              </motion.div>
            ))}
          </motion.div>
        )}

      </Container>
    </div>
  )
}
