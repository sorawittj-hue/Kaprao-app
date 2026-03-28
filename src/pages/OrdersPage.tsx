import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, Clock, RefreshCw, Smartphone, PackageX } from 'lucide-react'
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
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
    } catch (error) {
       addToast({ type: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-32">
       {/* Background Aesthetics */}
       <div className="absolute top-0 inset-x-0 h-[200px] bg-gradient-to-b from-gray-100 to-transparent pointer-events-none z-0" />

      <Container className="py-4 relative z-10 px-5 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between sticky top-4 z-50 mb-2">
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticLight(); navigate(-1) }} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-800 border border-gray-100 shadow-sm">
             <ArrowLeft className="w-5 h-5" />
           </motion.button>
           <div className="text-center">
             <h1 className="text-lg font-black tracking-tight text-gray-900">ประวัติออเดอร์</h1>
             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order History</p>
           </div>
           <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticMedium(); refetch() }} className={cn("w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-800 border border-gray-100 shadow-sm", isRefetching ? "opacity-50 pointer-events-none" : "")}>
             <RefreshCw className={cn("w-5 h-5", isRefetching ? "animate-spin" : "")} />
           </motion.button>
        </div>

        {/* Guest Banner */}
        <AnimatePresence>
           {isGuest && (
             <motion.div initial={{ opacity: 0, height: 0, scale: 0.9 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                <div className="bg-white rounded-[24px] p-5 relative overflow-hidden shadow-sm border border-gray-100">
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1">
                         <p className="font-black text-gray-900 text-sm">ผู้เยี่ยมชมระบบ</p>
                         <p className="text-gray-500 text-[10px] font-bold mt-0.5">เชื่อมต่อ LINE เพื่อบันทึกประวัติถาวร</p>
                      </div>
                      <button onClick={handleLogin} className="bg-[#00B900] text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-transform flex items-center gap-1.5 flex-shrink-0">
                         <Smartphone className="w-4 h-4"/> Login
                      </button>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>

        {isLoading ? (
           <div className="space-y-4 pt-4">
             {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
           </div>
        ) : !orders?.length ? (
           <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-[40px] p-8 text-center shadow-sm border border-white mt-10">
              <div className="w-24 h-24 bg-gray-50 rounded-[28px] border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-6">
                 <PackageX className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="font-black text-xl text-gray-900 tracking-tight mb-2">หิวรึยังคะ?</h2>
              <p className="text-sm font-medium text-gray-500 mb-8 max-w-[240px] mx-auto leading-relaxed">ดูเหมือนคุณจะยังไม่เคยสั่งอาหารกับกะเพรา 52 เลย มาลองเมนูเด็ดๆ กัน!</p>
              
              <button onClick={() => { hapticHeavy(); navigate('/') }} className="w-full h-14 bg-gray-900 text-white rounded-[20px] shadow-md font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform relative overflow-hidden group">
                 ดูเมนูอาหารทั้งหมด
              </button>
           </motion.div>
        ) : (
           <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6 pt-4 pb-16">
              
              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <motion.section variants={slideUpItem}>
                   <div className="flex items-center gap-3 mb-4 px-2">
                      <div className="w-10 h-10 rounded-[14px] bg-blue-50 flex items-center justify-center border border-blue-100/50 shadow-inner relative overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                         <Clock className="w-5 h-5 text-blue-500 relative z-10" />
                      </div>
                      <div>
                         <h2 className="font-black text-gray-800 text-[15px]">กำลังดำเนินการ</h2>
                         <p className="text-[11px] font-bold text-blue-500 tracking-widest uppercase">{activeOrders.length} ออเดอร์</p>
                      </div>
                   </div>
                   <div className="space-y-4">
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
                <motion.section variants={slideUpItem} className={cn("pt-4", activeOrders.length > 0 ? "border-t border-gray-200/50 dashed" : "")}>
                   <div className="flex items-center gap-3 mb-4 px-2">
                      <div className="w-10 h-10 rounded-[14px] bg-gray-50 flex items-center justify-center border border-gray-100/50 shadow-inner">
                         <CheckCircle className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                         <h2 className="font-black text-gray-600 text-[15px]">เสร็จสิ้นแล้ว</h2>
                         <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">{pastOrders.length} ออเดอร์</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {pastOrders.map((order) => (
                         <div key={order.id} className="opacity-80 hover:opacity-100 active:scale-[0.98] transition-all">
                            <OrderCard order={order} onClick={() => { hapticLight(); navigate(`/orders/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`) }} />
                         </div>
                      ))}
                   </div>
                </motion.section>
              )}

              {/* End Note */}
              <div className="pt-8 text-center">
                 <p className="text-[10px] font-black tracking-widest uppercase text-gray-300">แสดงรายการทั้งหมดแล้ว</p>
              </div>

           </motion.div>
        )}
      </Container>
    </div>
  )
}
