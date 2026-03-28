import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Phone, MessageCircle, Star, MapPinned, MoreVertical, Receipt, Store, Map, CheckCircle2, ShoppingBag, HeartHandshake } from 'lucide-react'
import { useOrderDetail, useOrderRealtime } from '@/features/orders/hooks/useOrders'
import { useAuthStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { LiveOrderTracker } from '@/features/orders/components/LiveOrderTracker'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'
import { trackPageView } from '@/lib/analytics'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { savePendingGuestOrder } from '@/lib/auth'
import { usePointsCalculator } from '@/features/points/hooks/usePoints'
import { useContactInfo } from '@/features/config/hooks/useShopConfig'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'

// Pro Max Animations
const fadeUpSpring = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isGuest } = useAuthStore()
  const { calculateEarned } = usePointsCalculator()

  const orderId = parseInt(id || '0')
  const trackingTokenFromUrl = searchParams.get('token')

  const { data: order, isLoading } = useOrderDetail(orderId)
  const { data: contactInfo } = useContactInfo()
  const [showOptions, setShowOptions] = useState(false)
  useOrderRealtime(orderId)

  useEffect(() => {
    trackPageView(`/orders/${orderId}`, 'Order Detail')
    window.scrollTo(0, 0)
  }, [orderId])

  const handleCallShop = () => {
    hapticMedium()
    if (contactInfo?.phone) {
      window.location.href = `tel:${contactInfo.phone}`
    }
  }

  const handleChatShop = () => {
    hapticHeavy()
    if (contactInfo?.line_id) {
      window.open(`https://line.me/R/ti/p/${contactInfo.line_id}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <motion.div
           animate={{ rotate: 360, scale: [1, 1.1, 1] }}
           transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
           className="relative flex items-center justify-center"
        >
          <div className="w-16 h-16 border-4 border-gray-100 rounded-full absolute"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-[#FF6B00] border-r-[#FF6B00] rounded-full animate-spin"></div>
          <ShoppingBag className="w-6 h-6 text-[#FF6B00] absolute" />
        </motion.div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen safe-area-pt flex flex-col items-center justify-center bg-[#FAFAF9]">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <Receipt className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="font-black text-gray-800 text-2xl mb-2">ไม่พบออเดอร์</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            ออเดอร์นี้อาจถูกยกเลิกแล้ว หรือหมายเลขออเดอร์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง
          </p>
          <button onClick={() => { hapticLight(); navigate('/orders'); }} className="bg-gray-900 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-gray-900/20 active:scale-95 transition-all">
            กลับไปหน้าออเดอร์
          </button>
        </motion.div>
      </div>
    )
  }

  const pointsMissed = calculateEarned(order.totalPrice)
  const ticketsMissed = Math.floor(order.totalPrice / 100)
  const effectiveToken = trackingTokenFromUrl || order.trackingToken

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-28">
      {/* Immersive Header Background */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#FFF5F0] via-[#FAFAF9] to-[#F4F4F5] -z-10 overflow-hidden">
         <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl"></div>
         <div className="absolute top-20 -left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <Container className="py-4 space-y-6">
        {/* Dynamic Nav */}
        <div className="flex items-center justify-between sticky top-4 z-50">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); navigate(-1); }}
            className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl flex items-center justify-center text-gray-700 shadow-lg shadow-gray-200/50 border border-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex flex-col items-center">
            <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-black text-[#FF6B00] tracking-widest uppercase bg-[#FF6B00]/10 px-3 py-1 rounded-full mb-1">
              Order Details
            </motion.span>
            <h1 className="text-lg font-black text-gray-900">#{order.id}</h1>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); setShowOptions(!showOptions); }}
            className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl flex items-center justify-center text-gray-700 shadow-lg shadow-gray-200/50 border border-white/50 relative"
          >
            <MoreVertical className="w-5 h-5" />
            
            {/* Context Menu */}
            <AnimatePresence>
               {showOptions && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8, transformOrigin: 'top right' }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="absolute top-14 right-0 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white p-2 z-50 overflow-hidden"
                 >
                    <div className="text-left">
                       <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">ความช่วยเหลือ</p>
                       <button onClick={handleCallShop} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold text-gray-700">
                          <Phone className="w-4 h-4 text-blue-500" /> โทรติดต่อร้าน
                       </button>
                       <button onClick={handleChatShop} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold text-gray-700">
                          <MessageCircle className="w-4 h-4 text-green-500" /> แชท LINE ร้าน
                       </button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-5">
          
          {/* Pro Max Interactive Status Tracker Tracker */}
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
              className="relative rounded-3xl overflow-hidden group border border-white"
              style={{
                background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
              }}
            >
              {/* Animated particles */}
              <motion.div animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #FF6B00 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              
              <div className="p-6 relative z-10">
                <div className="flex items-start gap-4 mb-5">
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', backdropFilter: 'blur(10px)' }}>
                    🎁
                  </motion.div>
                  <div className="pt-1">
                    <h3 className="font-black text-white text-lg leading-tight mb-1">สะสมพอยต์ก่อนหายไป!</h3>
                    <p className="text-blue-200/80 text-xs leading-relaxed font-medium">คุณพลาดพอยต์ไปแล้ว {pointsMissed} แต้ม ผูก LINE ตอนนี้เพื่อรับพอยต์ย้อนหลังและลุ้นหวยฟรี</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-2xl p-3.5 flex flex-col items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md">
                    <p className="text-2xl font-black text-amber-400 drop-shadow-md">{pointsMissed}</p>
                    <p className="text-[10px] text-white/50 font-bold mt-1 uppercase tracking-wider">Points</p>
                  </div>
                  <div className="rounded-2xl p-3.5 flex flex-col items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md">
                    <p className="text-2xl font-black text-emerald-400 drop-shadow-md">{ticketsMissed}</p>
                    <p className="text-[10px] text-white/50 font-bold mt-1 uppercase tracking-wider">Tickets</p>
                  </div>
                  <div className="rounded-2xl p-3.5 flex flex-col items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md">
                    <p className="text-2xl font-black text-blue-400 drop-shadow-md">{Math.round(pointsMissed / 10)}</p>
                    <p className="text-[10px] text-white/50 font-bold mt-1 uppercase tracking-wider">Baht</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  onClick={async () => {
                    hapticHeavy();
                    try {
                      if (effectiveToken) savePendingGuestOrder(order.id, effectiveToken)
                      const { loginWithLine } = await import('@/lib/auth')
                      await loginWithLine()
                    } catch (error) {
                      const { useUIStore } = await import('@/store')
                      useUIStore.getState().addToast({ type: 'error', title: 'Login Failed', message: error instanceof Error ? error.message : 'Please try again.' })
                    }
                  }}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2.5 relative overflow-hidden group"
                  style={{ background: '#00C300', boxShadow: '0 8px 24px -6px rgba(0, 195, 0, 0.5)' }}
                >
                  <motion.div className="absolute inset-0 bg-white/20" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.5 }} />
                  <MessageCircle className="w-5 h-5" />
                  Claim via LINE
                </motion.button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Delivery & Payment Info (Glass Card) */}
          <motion.div variants={fadeUpSpring}>
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100">
               <div className="bg-gray-50/50 rounded-[22px] px-5 py-4 flex items-center justify-between border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        {order.deliveryMethod === 'workplace' ? <Store className="w-5 h-5 text-blue-500" /> : <Map className="w-5 h-5 text-[#FF6B00]" />}
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{order.deliveryMethod === 'workplace' ? 'รับที่ออฟฟิศ' : 'ส่งถึงบ้าน'}</p>
                        <p className="font-black text-gray-900">{formatOrderDate(order.createdAt)}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ชำระแล้ว
                     </div>
                  </div>
               </div>
               
               <div className="p-5 space-y-4">
                  <div className="flex gap-4 items-start">
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPinned className="w-4 h-4 text-gray-500" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900">{order.customerName} <span className="text-gray-400 font-medium ml-1">({order.phoneNumber || 'ไม่มีเบอร์'})</span></p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{order.address || 'รับที่ร้าน'}</p>
                     </div>
                  </div>

                  {order.specialInstructions && (
                     <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                           <MessageCircle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="bg-amber-50/50 rounded-2xl p-3.5 flex-1 border border-amber-100/50">
                           <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">หมายเหตุเพิ่มเติม</p>
                           <p className="text-sm text-amber-900/80 italic font-medium">{order.specialInstructions}</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </motion.div>

          {/* Receipt Style Items List */}
          <motion.div variants={fadeUpSpring}>
             <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
                {/* Receipt Zig Zag Top */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI0Ij48cGF0aCBkPSJNMCAwbDUgNCA1LTR2NHgtMTB6IiBmaWxsPSIjRjRGNEY1Ii8+PC9zdmc+')] bg-repeat-x z-10 -mt-[1px]"></div>
                
                <div className="p-6 pt-8 pb-4 border-b border-dashed border-gray-200">
                   <h3 className="font-black text-gray-900 text-lg flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-5 h-5 text-[#FF6B00]" /> สรุปรายการอาหาร
                   </h3>
                   <p className="text-xs font-bold text-gray-400">{order.items.length} รายการในออเดอร์นี้</p>
                </div>

                <div className="p-2">
                   {order.items.map((item, index) => (
                     <div key={index} className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-700 shadow-sm flex-shrink-0">
                           {item.quantity}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-gray-900 text-base leading-tight pr-4">{item.name}</h4>
                              <span className="font-black text-gray-900">{formatPrice(item.subtotal)}</span>
                           </div>
                           
                           {item.options.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                 {item.options.map((opt, i) => (
                                    <span key={i} className="text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg shadow-sm">
                                       {opt.name}
                                    </span>
                                 ))}
                              </div>
                           )}

                           {item.note && (
                              <div className="mt-2 text-xs text-gray-500 bg-gray-100/80 px-3 py-2 rounded-xl border border-gray-200/60 inline-flex items-center gap-1.5 font-medium">
                                 <span className="text-[10px]">✏️</span> {item.note}
                              </div>
                           )}
                        </div>
                     </div>
                   ))}
                </div>

                {/* Subtotals & Totals */}
                <div className="p-6 bg-gray-50/50 border-t border-dashed border-gray-200 space-y-3">
                   <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                      <span>ยอดรวมค่าอาหาร</span>
                      <span>{formatPrice(order.subtotalPrice)}</span>
                   </div>
                   
                   {order.discountAmount > 0 && (
                     <div className="flex justify-between items-center text-sm font-bold bg-green-50 text-green-600 p-2.5 rounded-xl border border-green-100">
                        <span className="flex items-center gap-2"><div className="bg-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">🎫</div> ส่วนลด</span>
                        <span>-{formatPrice(order.discountAmount)}</span>
                     </div>
                   )}

                   {order.pointsRedeemed > 0 && (
                     <div className="flex justify-between items-center text-sm font-bold bg-amber-50 text-amber-600 p-2.5 rounded-xl border border-amber-100">
                        <span className="flex items-center gap-2"><Star className="w-4 h-4 fill-amber-500 text-amber-500"/> ใช้พอยต์</span>
                        <span>-{formatPrice(order.pointsRedeemed / 10)}</span>
                     </div>
                   )}

                   <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between items-end">
                      <div>
                         <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ยอดสุทธิ</p>
                         <p className="text-gray-500 text-xs font-medium">ชำระผ่าน {order.paymentMethod === 'promptpay' ? 'QR Code' : 'เงินสด'}</p>
                      </div>
                      <span className="text-3xl font-black text-[#FF6B00] tracking-tight drop-shadow-sm">{formatPrice(order.totalPrice)}</span>
                   </div>
                </div>

                {/* Receipt Zig Zag Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI0Ij48cGF0aCBkPSJNMCA0bDUtNCA1IDR2LTR4LTEweiIgZmlsbD0iI0Y0RjRGNSIvPjwvc3ZnPg==')] bg-repeat-x z-10 -mb-[1px]"></div>
             </div>
          </motion.div>

          {/* ❌ Cancel Action */}
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
                   } catch (err) {
                     alert('ไม่สามารถยกเลิกได้ กรุณาติดต่อร้านค้า')
                   }
                 }
               }}
               className="w-full py-4 text-gray-500 font-bold text-sm bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-gray-200 hover:border-red-200 flex items-center justify-center gap-2 group"
             >
               ยกเลิกออเดอร์นี้
             </motion.button>
          )}

          {/* Review Section */}
          <AnimatePresence>
          {order.status === 'delivered' && (
             <motion.div variants={fadeUpSpring} initial="hidden" animate="visible">
               <div className="bg-gradient-to-br from-indigo-50 to-[#FAFAF9] rounded-3xl p-1 shadow-sm border border-indigo-100/50">
                  <div className="bg-white/60 backdrop-blur-xl rounded-[22px] p-6 text-center border border-white">
                     <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3">
                        <HeartHandshake className="w-8 h-8 text-white tracking-widest" />
                     </div>
                     <h3 className="text-lg font-black text-gray-900 mb-1">อาหารอร่อยไหม?</h3>
                     <p className="text-gray-500 text-sm font-medium mb-6">บอกเราหน่อย เพื่อให้เราพัฒนาขึ้นในครั้งถัดไป</p>
                     <ReviewForm order={order} />
                  </div>
               </div>
             </motion.div>
          )}
          </AnimatePresence>

        </motion.div>
      </Container>
    </div>
  )
}
