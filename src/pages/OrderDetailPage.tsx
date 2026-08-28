import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Store, Map, CheckCircle2,
  MapPinned, MessageCircle, ShoppingBag,
  Star, Phone, Receipt, MoreVertical, HeartHandshake, RotateCcw,
  Sparkles
} from 'lucide-react'
import { useOrderDetail } from '@/features/orders/hooks/useOrders'
import { useAuthStore, useCartStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'
import { Container } from '@/components/layout/Container'
import { LiveOrderTracker } from '@/features/orders/components/LiveOrderTracker'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'
import { usePointsCalculator } from '@/features/points/hooks/usePoints'
import { savePendingGuestOrder } from '@/lib/auth'
import { trackPageView } from '@/lib/analytics'
import { useSEO } from '@/hooks/useSEO'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import type { OrderItem, SelectedOption } from '@/types'

import { AuthModal } from '@/components/auth/AuthModal'

const fadeUpSpring = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}

const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const trackingTokenFromUrl = searchParams.get('token')
  const navigate = useNavigate()
  const { isGuest } = useAuthStore()
  const { calculateEarned } = usePointsCalculator()

  const orderId = id ? parseInt(id, 10) : 0
  const { data: order, isLoading } = useOrderDetail(orderId)
  const [showOptions, setShowOptions] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    trackPageView(`/orders/${id}`, 'OrderDetail')
    window.scrollTo(0, 0)
  }, [id])

  useSEO({
    title: order ? `ออเดอร์ #${order.id} | กะเพรา 52` : 'รายละเอียดออเดอร์',
    description: 'ติดตามสถานะออเดอร์ของคุณแบบเรียลไทม์'
  })

  const { addItem } = useCartStore()
  const { addToast } = useUIStore()

  const handleCallShop = () => {
    hapticLight()
    window.location.href = 'tel:0812345678'
  }

  const handleChatShop = () => {
    hapticLight()
    window.open('https://line.me/R/ti/p/@kaprao52', '_blank')
  }

  const handleReorder = () => {
    hapticHeavy()
    if (!order?.items || order.items.length === 0) return

    order.items.forEach((item) => {
      addItem(
        {
          id: item.menuItemId,
          name: item.name,
          price: item.price,
          category: 'kaprao',
          requiresMeat: false,
          isRecommended: false,
          isAvailable: true,
        },
        item.quantity,
        item.options || [],
        item.note || ''
      )
    })

    addToast({
      type: 'success',
      title: 'เพิ่มเมนูทั้งหมดลงตะกร้าแล้ว',
      message: 'กำลังนำคุณไปที่หน้าตะกร้าสินค้า...',
    })
    navigate('/cart')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen safe-area-pt flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 rounded-full border-4 border-t-orange-500" style={{ borderColor: 'var(--border-soft)', borderTopColor: '#FF5500' }} />
        <p className="text-xs font-bold mt-4 tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen safe-area-pt flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
          <div
            className="w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 4px 16px rgba(15,23,42,0.05)' }}
          >
            <Receipt className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>ไม่พบออเดอร์</h2>
          <p className="text-sm mb-8 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            ออเดอร์นี้อาจถูกยกเลิกแล้ว หรือหมายเลขออเดอร์ไม่ถูกต้อง
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { hapticLight(); navigate('/orders') }}
            className="text-white px-8 py-3.5 rounded-full font-black text-sm cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FF5500, #E03E00)', boxShadow: '0 8px 20px rgba(255,85,0,0.35)' }}
          >
            กลับไปหน้าออเดอร์
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const pointsMissed = calculateEarned(order.totalPrice)
  const ticketsMissed = Math.floor(order.totalPrice / 100)
  const effectiveToken = trackingTokenFromUrl || order.trackingToken

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-24 -right-12 w-[300px] h-[300px] rounded-full animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <Container className="py-4 space-y-6 max-w-2xl mx-auto px-4">
        {/* Dynamic Nav */}
        <div className="flex items-center justify-between sticky top-4 z-50">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); navigate(-1); }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 cursor-pointer shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
          </motion.button>
          
          <div className="flex flex-col items-center">
            <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-1" style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>
              Order Details
            </motion.span>
            <h1 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>#{order.id}</h1>
          </div>

          <motion.button
            type="button"
            aria-label="ตัวเลือกเพิ่มเติม"
            aria-expanded={showOptions}
            aria-haspopup="menu"
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); setShowOptions(!showOptions); }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 cursor-pointer shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <MoreVertical className="w-5 h-5 text-slate-700" aria-hidden="true" />
            
            {/* Context Menu */}
            <AnimatePresence>
               {showOptions && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8, transformOrigin: 'top right' }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="absolute top-14 right-0 w-48 rounded-2xl shadow-xl p-2 z-50 overflow-hidden"
                   style={{ background: '#FFFFFF', border: '1px solid var(--border-soft)', backdropFilter: 'blur(20px)' }}
                 >
                    <div className="text-left">
                       <p className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">ความช่วยเหลือ</p>
                       <button onClick={handleCallShop} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold text-slate-800 cursor-pointer">
                          <Phone className="w-4 h-4 text-sky-600" /> โทรติดต่อร้าน
                       </button>
                       <button onClick={handleChatShop} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold text-slate-800 cursor-pointer">
                          <MessageCircle className="w-4 h-4 text-emerald-600" /> แชท LINE ร้าน
                       </button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-5">
          
          {/* Status Tracker */}
          <motion.div variants={fadeUpSpring}>
            <LiveOrderTracker
              orderId={order.id}
              initialStatus={order.status}
              estimatedReadyTime={order.estimatedReadyTime}
            />
          </motion.div>

          {/* Guest Gamification Notice */}
          <AnimatePresence>
          {isGuest && pointsMissed > 0 && (
            <motion.div
              variants={fadeUpSpring}
              initial="hidden" animate="visible" exit="hidden"
              className="relative rounded-3xl overflow-hidden group border shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                borderColor: 'rgba(245,158,11,0.3)',
              }}
            >
              <div className="p-6 relative z-10">
                <div className="flex items-start gap-4 mb-5">
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl shadow-sm border border-amber-200/80 bg-white" >
                    🎁
                  </motion.div>
                  <div className="pt-1">
                    <h3 className="font-black text-amber-950 text-base leading-tight mb-1">สะสมพอยต์ก่อนหมดอายุ!</h3>
                    <p className="text-xs leading-relaxed font-medium text-amber-900/80">
                      คุณได้รับสิทธิ์สะสม {pointsMissed} แต้ม เข้าสู่ระบบตอนนี้เพื่อรับแต้มย้อนหลังและลุ้นกินฟรี
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="rounded-2xl p-3 flex flex-col items-center justify-center border border-amber-200/80 bg-white shadow-xs">
                    <p className="text-xl font-black text-amber-600 num-display">+{pointsMissed}</p>
                    <p className="text-[9px] font-black mt-0.5 text-slate-500 uppercase tracking-wider">แต้มสะสม</p>
                  </div>
                  <div className="rounded-2xl p-3 flex flex-col items-center justify-center border border-emerald-200/80 bg-white shadow-xs">
                    <p className="text-xl font-black text-emerald-600 num-display">+{ticketsMissed}</p>
                    <p className="text-[9px] font-black mt-0.5 text-slate-500 uppercase tracking-wider">สิทธิ์ลุ้นหวย</p>
                  </div>
                  <div className="rounded-2xl p-3 flex flex-col items-center justify-center border border-orange-200/80 bg-white shadow-xs">
                    <p className="text-xl font-black text-orange-600 num-display">฿{Math.round(pointsMissed / 10)}</p>
                    <p className="text-[9px] font-black mt-0.5 text-slate-500 uppercase tracking-wider">มูลค่าส่วนลด</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticHeavy()
                    if (effectiveToken) savePendingGuestOrder(order.id, effectiveToken)
                    setIsAuthModalOpen(true)
                  }}
                  className="w-full py-3.5 rounded-[20px] font-black text-white text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  style={{ background: 'linear-gradient(135deg, #FF5500, #E03E00)', boxShadow: '0 8px 20px rgba(255, 85, 0, 0.35)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เข้าสู่ระบบเพื่อรับแต้ม & สิทธิ์ลุ้นหวย</span>
                </motion.button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Delivery & Payment Info */}
          <motion.div variants={fadeUpSpring}>
            <div className="rounded-3xl p-1 shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-soft)' }}>
               <div className="rounded-[22px] px-5 py-4 flex items-center justify-between border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        {order.deliveryMethod === 'workplace' ? <Store className="w-5 h-5 text-sky-600" /> : <Map className="w-5 h-5 text-orange-500" />}
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{order.deliveryMethod === 'workplace' ? 'รับที่ออฟฟิศ' : 'ส่งถึงบ้าน'}</p>
                        <p className="font-black" style={{ color: 'var(--text-primary)' }}>{formatOrderDate(order.createdAt)}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                       style={{ background: 'rgba(22,163,74,0.10)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.20)' }}
                     >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ชำระแล้ว
                     </div>
                  </div>
               </div>
               
               <div className="p-5 space-y-4">
                  <div className="flex gap-4 items-start">
                     <div
                       className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                     >
                        <MapPinned className="w-4 h-4 text-slate-500" />
                     </div>
                     <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{order.customerName} <span className="font-medium ml-1" style={{ color: 'var(--text-muted)' }}>({order.phoneNumber || 'ไม่มีเบอร์'})</span></p>
                        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{order.address || 'รับที่ร้าน'}</p>
                     </div>
                  </div>

                  {order.specialInstructions && (
                     <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(245,158,11,0.12)' }}>
                           <MessageCircle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="rounded-2xl p-3.5 flex-1 border border-amber-500/20 bg-amber-50/60">
                           <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">หมายเหตุเพิ่มเติม</p>
                           <p className="text-sm text-amber-900 italic font-medium">{order.specialInstructions}</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </motion.div>

          {/* Receipt Style Items List */}
          <motion.div variants={fadeUpSpring}>
             <div className="rounded-3xl overflow-hidden shadow-sm border relative" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-soft)' }}>
                <div className="p-6 pt-6 pb-4 border-b border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
                   <h3 className="font-black text-lg flex items-center gap-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                      <ShoppingBag className="w-5 h-5" style={{ color: 'var(--brand)' }} /> สรุปรายการอาหาร
                   </h3>
                   <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{order.items.length} รายการในออเดอร์นี้</p>
                </div>

                <div className="p-2">
                   {order.items.map((item: OrderItem, index: number) => (
                     <div key={index} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                        >
                           {item.quantity}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-base leading-tight pr-4" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                              <span className="font-black num-display" style={{ color: 'var(--text-primary)' }}>{formatPrice(item.subtotal)}</span>
                           </div>
                           
                           {item.options.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                 {item.options.map((opt: SelectedOption, i: number) => (
                                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                                       {opt.name}
                                    </span>
                                 ))}
                              </div>
                           )}

                           {item.note && (
                              <div className="mt-2 text-xs px-3 py-2 rounded-xl inline-flex items-center gap-1.5 font-medium" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                                 {item.note}
                              </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>

                {/* Subtotals & Totals */}
                <div className="p-6 border-t border-dashed space-y-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                   <div className="flex justify-between items-center text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                      <span>ยอดรวมค่าอาหาร</span>
                      <span style={{ color: 'var(--text-primary)' }}>{formatPrice(order.subtotalPrice)}</span>
                   </div>
                   
                   {order.discountAmount > 0 && (
                     <div
                       className="flex justify-between items-center text-sm font-bold p-2.5 rounded-xl"
                       style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.18)' }}
                     >
                        <span className="flex items-center gap-2">ส่วนลด</span>
                        <span>-{formatPrice(order.discountAmount)}</span>
                     </div>
                   )}

                   {order.pointsRedeemed > 0 && (
                     <div
                       className="flex justify-between items-center text-sm font-bold p-2.5 rounded-xl"
                       style={{ background: 'rgba(245,158,11,0.08)', color: '#D97706', border: '1px solid rgba(245,158,11,0.18)' }}
                     >
                        <span className="flex items-center gap-2"><Star className="w-4 h-4 fill-amber-500 text-amber-500"/> ใช้พอยต์</span>
                        <span>-{formatPrice(order.pointsRedeemed / 10)}</span>
                     </div>
                   )}

                   <div className="pt-4 mt-2 border-t flex justify-between items-end" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div>
                         <p className="text-xs font-black uppercase tracking-widest mb-1 text-slate-400">ยอดสุทธิ</p>
                         <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>ชำระผ่าน {order.paymentMethod === 'promptpay' ? 'QR Code' : 'เงินสด'}</p>
                      </div>
                      <span className="text-3xl font-black text-gradient-fire tracking-tight num-display">{formatPrice(order.totalPrice)}</span>
                   </div>

                   {/* 1-Tap Reorder CTA */}
                   <div className="pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleReorder}
                        className="w-full py-3.5 rounded-[18px] text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25"
                        style={{
                          background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>สั่งซ้ำเมนูนี้ลงตะกร้า (Reorder)</span>
                      </motion.button>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* Cancel Action */}
          {(order.status === 'placed' || order.status === 'pending') && (
            <motion.button
               variants={fadeUpSpring}
               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
               onClick={async () => {
                 hapticMedium()
                 if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์นี้?')) {
                   const { updateOrderStatus } = await import('@/features/orders/hooks/useOrders')
                   try {
                     await updateOrderStatus(order.id, 'cancelled')
                     alert('ยกเลิกออเดอร์สำเร็จ')
                   } catch {
                     alert('ไม่สามารถยกเลิกได้ กรุณาติดต่อร้านค้า')
                   }
                 }
               }}
               className="w-full py-4 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-80"
               style={{ background: 'rgba(239,68,68,0.07)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.18)' }}
             >
               ยกเลิกออเดอร์นี้
             </motion.button>
          )}

          {/* Review Section */}
          <AnimatePresence>
            {order.status === 'delivered' && (
              <motion.div variants={fadeUpSpring} initial="hidden" animate="visible">
                <div
                  className="rounded-[28px] overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid rgba(99,102,241,0.20)', boxShadow: '0 8px 28px rgba(99,102,241,0.08)' }}
                >
                  <div
                    className="p-5 flex flex-col items-center text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(192,132,252,0.04))', borderBottom: '1px solid rgba(99,102,241,0.12)' }}
                  >
                    <div
                      className="w-14 h-14 rounded-[20px] mx-auto mb-3 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 20px rgba(99,102,241,0.30)' }}
                    >
                      <HeartHandshake className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>อาหารอร่อยไหม?</h3>
                    <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>บอกเราหน่อย เพื่อให้เราพัฒนาขึ้นในครั้งถัดไป</p>
                  </div>
                  <div className="p-5">
                    <ReviewForm order={order} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </Container>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}
