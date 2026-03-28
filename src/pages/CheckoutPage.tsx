import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Truck,
  Banknote,
  QrCode,
  Check,
  AlertCircle,
  User,
  Sparkles,
  Gift,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
  FileImage,
  CreditCard
} from 'lucide-react'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { formatPrice } from '@/utils/formatPrice'
import type { Order } from '@/types'
import { cn } from '@/utils/cn'
import confetti from 'canvas-confetti'
import { buildLineOrderMessage, getThaiLotteryDrawDate, redirectToLineOA } from '@/utils/buildLineMessage'
import { createUnifiedOrder, getOrCreateGuestIdentity } from '@/features/v2/api/unifiedOrderApi'
import { GuestConversionPanel } from '@/features/v2/components/GuestConversionPanel'
import { CouponInputCompact } from '@/features/coupons/components/CouponInput'
import { validateCheckoutForm } from '@/utils/validations'
import { useAddPoints, usePointsCalculator } from '@/features/points/hooks/usePoints'

// Premium Animation Variants
const staggerList = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }
const slideUpItem = { hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } } }

// Payment method option component
function PaymentOption({ method, selected, onSelect, icon: Icon, title, description, color }: { method: 'cod' | 'transfer' | 'promptpay', selected: string, onSelect: (m: 'cod' | 'transfer' | 'promptpay') => void, icon: React.ElementType, title: string, description: string, color: string }) {
  const isSelected = selected === method
  return (
    <button
      onClick={() => { hapticMedium(); onSelect(method) }}
      className={cn(
        'w-full flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all duration-300 relative overflow-hidden group',
        isSelected ? 'border-[#FF6B00] bg-white shadow-xl shadow-orange-500/10' : 'border-gray-100 bg-white hover:border-gray-200'
      )}
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors relative z-10", isSelected ? "bg-[#FF6B00] text-white shadow-inner" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600")}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-left flex-1 relative z-10">
        <p className={cn("font-black text-[17px] leading-tight", isSelected ? "text-gray-900" : "text-gray-800")}>{title}</p>
        <p className={cn("text-xs font-medium mt-0.5", isSelected ? "text-[#FF6B00]" : "text-gray-400")}>{description}</p>
      </div>
      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors relative z-10", isSelected ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300")}>
         {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
      {isSelected && <div className="absolute inset-0 bg-[#FF6B00]/5 pointer-events-none" />}
    </button>
  )
}

// Order success component PRO MAX
function OrderSuccess({ order, onContinue }: { order: Order; onContinue: () => void }) {
  const navigate = useNavigate()
  const { isGuest } = useAuthStore()
  const { addToast } = useUIStore()
  const { calculateEarned } = usePointsCalculator()
  const pointsMissed = calculateEarned(order.totalPrice)
  const [isUploading, setIsUploading] = useState(false)
  const [slipUrl, setSlipUrl] = useState<string | null>(order.paymentSlipUrl || null)

  const lottoNumber = String(order.id).slice(-2).padStart(2, '0')
  const ticketsEarned = Math.floor(order.totalPrice / 100)

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    hapticHeavy()
    setIsUploading(true)
    try {
      const { uploadPaymentSlip } = await import('@/lib/storage')
      const url = await uploadPaymentSlip(order.id, file)
      setSlipUrl(url)
      addToast({ type: 'success', title: 'อัปโหลดสลิปสำเร็จ', message: 'ได้รับสลิปเรียบร้อยแล้ว แอดมินจะตรวจสอบโดยเร็วที่สุด' })
    } catch (err) {
      addToast({ type: 'error', title: 'อัปโหลดไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง หรือส่งทาง LINE' })
    } finally { setIsUploading(false) }
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col items-center p-4 pb-32 overflow-y-auto relative safe-area-pt">
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-green-500 via-emerald-600 to-[#F4F4F5] pointer-events-none -z-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] pointer-events-none mix-blend-overlay" />

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="w-full max-w-md w-full relative z-10 pt-10">
        
        <div className="text-center mb-8">
           <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }} className="w-32 h-32 bg-white rounded-[36px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/20 border-4 border-white">
              <div className="w-24 h-24 bg-green-50 rounded-[24px] flex items-center justify-center shadow-inner">
                 <Check className="w-12 h-12 text-green-500" strokeWidth={3} />
              </div>
           </motion.div>
           <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md mb-2">สั่งซื้อสำเร็จ!</h1>
           <p className="text-green-50 text-sm font-medium">ออเดอร์ #{order.id} ของคุณกำลังถูกจัดเตรียม</p>
        </div>

        <div className="space-y-6">
          {(order.paymentMethod === 'promptpay' || order.paymentMethod === 'transfer') && (
            <div className="bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden text-center border border-white">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
               <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm relative z-10">
                  <QrCode className="w-8 h-8 text-blue-500" />
               </div>
               <h3 className="font-black text-xl text-gray-900 mb-1 relative z-10">ชำระเงิน</h3>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg w-fit mx-auto mb-6 relative z-10">ยอดโอน {formatPrice(order.totalPrice)}</p>

               <div className="bg-[#FAFAF9] rounded-[32px] p-6 mb-6 shadow-md border border-gray-100/50 relative z-10 group">
                  <div className="w-48 h-48 bg-white rounded-[24px] shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100 overflow-hidden relative">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021129370016A00000067701011101130066XXXXXXXXX263801120000000000005204581453037645802TH6304`} alt="QR" className="w-44 h-44 mix-blend-multiply" />
                  </div>
                  <p className="font-black text-xl text-gray-800 tracking-tight">0XX-XXX-XXXX</p>
                  <p className="text-xs font-bold text-gray-500 uppercase mt-1">กะเพรา 52 (นายxxxx)</p>
               </div>

               {!slipUrl ? (
                 <div className="relative z-10">
                   <input type="file" accept="image/*" onChange={handleSlipUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   <button disabled={isUploading} className="w-full h-16 bg-gray-900 text-white rounded-[24px] shadow-xl shadow-gray-900/20 font-black text-base flex flex-col items-center justify-center relative overflow-hidden active:scale-95 transition-transform border border-gray-800">
                      {isUploading ? <span className="animate-pulse">Uploading...</span> : <><span className="flex items-center gap-2"><UploadCloud className="w-5 h-5"/> แนบสลิปยืนยัน</span><span className="text-[10px] text-gray-400 font-medium">กดเพื่ออัปโหลดรูปภาพ</span></>}
                   </button>
                 </div>
               ) : (
                 <div className="relative z-10 p-4 bg-green-50 rounded-[20px] border border-green-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600"><FileImage className="w-5 h-5"/></div>
                       <div className="text-left">
                          <p className="font-black text-sm text-green-700">แนบสลิปแล้ว</p>
                          <p className="text-[10px] text-green-600/70 font-bold uppercase tracking-widest">รอแอดมินตรวจสอบ</p>
                       </div>
                    </div>
                    <button onClick={() => { hapticLight(); setSlipUrl(null); }} className="text-xs font-black text-green-700 underline underline-offset-4">เปลี่ยนรูป</button>
                 </div>
               )}
            </div>
          )}

          {isGuest && pointsMissed > 0 && (
             <GuestConversionPanel pointsToEarn={pointsMissed} ticketsToEarn={ticketsEarned} lottoNumber={lottoNumber} onLogin={async () => {
                hapticHeavy()
                const guestIdentity = getOrCreateGuestIdentity()
                localStorage.setItem('kaprao_guest_identity', JSON.stringify(guestIdentity))
                const { loginWithLine } = await import('@/lib/auth')
                await loginWithLine()
             }} variant="success" />
          )}

          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100/50">
                <div className="w-10 h-10 bg-gray-50 rounded-[14px] flex items-center justify-center"><Banknote className="w-5 h-5 text-gray-500" /></div>
                <div>
                   <h3 className="font-black text-gray-900">สรุปคำสั่งซื้อ</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order Info</p>
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">ผู้รับ</span>
                   <span className="font-black text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">ยอดรวม</span>
                   <span className="font-black text-[#FF6B00] text-lg">{formatPrice(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">ชำระผ่าน</span>
                   <span className="font-black text-gray-900">{order.paymentMethod === 'cod' ? 'เงินสดจ่ายปลายทาง' : order.paymentMethod === 'transfer' ? 'โอนเงิน' : 'พร้อมเพย์'}</span>
                </div>
                {order.pointsEarned > 0 && !isGuest && (
                   <div className="flex justify-between items-center p-3 bg-green-50 rounded-[16px]">
                      <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">แต้มที่จะได้รับ</span>
                      <span className="font-black text-green-600 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5"/> +{order.pointsEarned}</span>
                   </div>
                )}
             </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
             <button onClick={() => { hapticLight(); navigate(`/orders/${order.id}${order.trackingToken ? `?token=${order.trackingToken}` : ''}`); }} className="h-16 bg-white border border-gray-200 text-gray-900 font-black text-base rounded-[24px] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-50">
               ดูรายละเอียดออเดอร์
             </button>
             <button onClick={() => { hapticLight(); onContinue(); }} className="h-14 font-black text-gray-500 text-sm active:scale-95 transition-transform hover:text-gray-800">
               ดูรายการสั่งซื้อทั้งหมด
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()
  const { items, finalTotal, subtotal, discountAmount, pointsUsed, deliveryMethod, setDeliveryMethod, clearCart, applyCoupon, removeCoupon, couponCode } = useCartStore()

  const { mutateAsync: addPoints } = useAddPoints()
  const { calculateEarned } = usePointsCalculator()

  const [customerName, setCustomerName] = useState(user?.displayName || (isGuest ? 'Guest' : ''))
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'promptpay'>('cod')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const pointsToEarn = calculateEarned(finalTotal)
  const ticketsToEarn = Math.floor(finalTotal / 100)

  useEffect(() => {
    if (items.length === 0 && !showSuccess) navigate('/cart')
    window.scrollTo(0, 0)
  }, [items.length, navigate, showSuccess])

  const handlePlaceOrder = useCallback(async () => {
    hapticHeavy()
    const validation = validateCheckoutForm({ customerName, phoneNumber, address, paymentMethod, deliveryMethod }, deliveryMethod)
    if (!validation.valid) { Object.entries(validation.errors).forEach(([, message]) => { addToast({ type: 'error', title: 'ข้อมูลไม่ครบถ้วน', message }) }); return }

    setIsProcessing(true)
    try {
      let guestId: string | undefined
      let userId: string | undefined
      let lineUserId: string | undefined

      if (user?.id) {
        userId = user.id
        lineUserId = user.lineUserId
      } else {
        const guestIdentity = getOrCreateGuestIdentity()
        guestId = guestIdentity.id
      }

      const unifiedOrder = await createUnifiedOrder({
        guestId, userId, lineUserId, customerName: customerName.trim(), phoneNumber: phoneNumber.trim(),
        items: items.map(item => ({ id: item.id, menuItemId: item.menuItem.id, name: item.menuItem.name, price: item.menuItem.price, quantity: item.quantity, options: item.selectedOptions.map(opt => ({ optionId: opt.optionId, name: opt.name, price: opt.price })), note: item.note, subtotal: item.subtotal })),
        subtotalPrice: subtotal, discountAmount: discountAmount, discountCode: couponCode || undefined, pointsRedeemed: pointsUsed, totalPrice: finalTotal, paymentMethod: paymentMethod, deliveryMethod: deliveryMethod, address: deliveryMethod === 'village' ? address.trim() : undefined, specialInstructions: specialInstructions.trim() || undefined,
      })

      const order: Order = {
        id: unifiedOrder.id, userId: unifiedOrder.userId, lineUserId: unifiedOrder.lineUserId, customerName: unifiedOrder.customerName, phoneNumber: unifiedOrder.phoneNumber, address: unifiedOrder.address, deliveryMethod: unifiedOrder.deliveryMethod, specialInstructions: unifiedOrder.specialInstructions,
        items: unifiedOrder.items.map(item => ({ id: item.id, menuItemId: item.menuItemId, name: item.name, price: item.price, quantity: item.quantity, options: item.options.map(opt => ({ optionId: opt.optionId, name: opt.name, price: opt.price })), note: item.note || '', subtotal: item.subtotal })),
        status: unifiedOrder.status as Order['status'], totalPrice: unifiedOrder.totalPrice, subtotalPrice: unifiedOrder.subtotalPrice, discountAmount: unifiedOrder.discountAmount, discountCode: unifiedOrder.discountCode, pointsRedeemed: unifiedOrder.pointsRedeemed, pointsEarned: unifiedOrder.pointsEarned, paymentMethod: unifiedOrder.paymentMethod, paymentStatus: unifiedOrder.paymentStatus, trackingToken: unifiedOrder.guestId || undefined, createdAt: unifiedOrder.createdAt, updatedAt: unifiedOrder.updatedAt, estimatedReadyTime: unifiedOrder.estimatedReadyTime,
      }

      if (user?.id && pointsToEarn > 0) {
        try { await addPoints({ userId: user.id, amount: pointsToEarn, action: 'EARN', note: `สั่งซื้อออเดอร์ #${order.id}`, orderId: order.id }) } catch (e) { console.error(e) }
      }

      setCreatedOrder(order)
      clearCart()
      useAuthStore.getState().incrementOrderCount()

      const targetId = user?.id || guestId
      if (targetId) { import('@/features/gamification/GamificationEngine').then(m => { const gameEngine = m.getUserGamification(targetId); gameEngine.recordOrder() }) }

      setShowSuccess(true)
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#FF6B00', '#FBBF24', '#10B981'] })
      addToast({ type: 'success', title: 'สุดยอด!', message: unifiedOrder.queue?.display ? `ออเดอร์ #${order.id} - คทรคิว ${unifiedOrder.queue.display}` : `ออเดอร์ #${order.id} ถูกบันทึกแล้ว` })

      const drawDate = getThaiLotteryDrawDate()
      const isGuestUser = !user?.lineUserId
      const lineMessage = buildLineOrderMessage({ order, lottoNumber: unifiedOrder.queue?.display?.slice(-2) || String(order.id).slice(-2).padStart(2, '0'), drawDate, isGuest: isGuestUser, pointsEarned: pointsToEarn, ticketsEarned: ticketsToEarn })

      setTimeout(async () => { await redirectToLineOA(lineMessage) }, 2500)
    } catch (error) { addToast({ type: 'error', title: 'มีบางอย่างผิดพลาด', message: 'กรุณาลองใหม่อีกครั้ง' }) }
    finally { setIsProcessing(false) }
  }, [addPoints, addToast, address, clearCart, couponCode, customerName, deliveryMethod, discountAmount, finalTotal, items, paymentMethod, phoneNumber, pointsToEarn, pointsUsed, specialInstructions, subtotal, ticketsToEarn, user])

  if (showSuccess && createdOrder) return <OrderSuccess order={createdOrder} onContinue={() => navigate('/orders')} />

  return (
    <div className="min-h-screen bg-[#F4F4F5] safe-area-pt pb-48 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-[#FFF5F0] to-[#F4F4F5] pointer-events-none z-0" />
      
      <Container className="py-4 relative z-10 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between sticky top-4 z-50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticLight(); navigate(-1) }} className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-2xl flex items-center justify-center text-gray-800 shadow-xl shadow-gray-200/50 border border-white/60">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div className="text-center">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-orange-400">ชำระเงิน</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Checkout</p>
          </div>
          <div className="w-14" />
        </div>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6">
          
          <motion.div variants={slideUpItem} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 shadow-sm border border-white">
             <div className="px-6 py-5 border-b border-gray-100/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><User className="w-5 h-5 text-blue-500"/></div>
                <h2 className="font-black text-gray-800">ข้อมูลผู้สั่งซื้อ</h2>
             </div>
             <div className="p-6 space-y-5">
                <div>
                   <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-widest pl-1">ชื่อ-นามสกุล {deliveryMethod === 'village' && <span className="text-red-500">*</span>}</label>
                   <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={user?.displayName ? user.displayName : (isGuest ? 'Guest' : 'กรอกชื่อของคุณ')} readOnly={deliveryMethod === 'workplace' && !!user?.displayName} className={cn("w-full h-14 px-5 rounded-[20px] border-2 font-bold focus:border-blue-500 outline-none transition-all", (deliveryMethod === 'workplace' && !!user?.displayName) ? "bg-gray-100/50 text-gray-400 border-transparent cursor-not-allowed" : "bg-[#FAFAF9] border-gray-100 focus:bg-white focus:shadow-sm")} />
                </div>
                <AnimatePresence>
                  {deliveryMethod === 'village' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-widest pl-1 mt-4">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                      <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="เช่น 0812345678" className="w-full h-14 px-5 rounded-[20px] border-2 font-bold bg-[#FAFAF9] border-gray-100 focus:bg-white focus:border-blue-500 focus:shadow-sm outline-none transition-all" />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>

          <motion.div variants={slideUpItem} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 shadow-sm border border-white">
             <div className="px-6 py-5 border-b border-gray-100/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><Truck className="w-5 h-5 text-[#FF6B00]"/></div>
                <h2 className="font-black text-gray-800">วิธีรับอาหาร</h2>
             </div>
             <div className="p-4 space-y-4">
                <div className="flex bg-[#F4F4F5] p-1.5 rounded-[24px] relative">
                   <button onClick={() => { hapticMedium(); setDeliveryMethod('workplace') }} className={cn("flex-1 h-14 rounded-[20px] font-black text-sm relative z-10 transition-colors duration-300 flex items-center justify-center gap-2", deliveryMethod === 'workplace' ? "text-gray-900" : "text-gray-400")}>
                      <MapPin className="w-5 h-5"/> ที่ทำงาน
                   </button>
                   <button onClick={() => { hapticMedium(); setDeliveryMethod('village') }} className={cn("flex-1 h-14 rounded-[20px] font-black text-sm relative z-10 transition-colors duration-300 flex items-center justify-center gap-2", deliveryMethod === 'village' ? "text-gray-900" : "text-gray-400")}>
                      <Truck className="w-5 h-5"/> หมู่บ้าน
                   </button>
                   <motion.div initial={false} animate={{ x: deliveryMethod === 'workplace' ? '0%' : '100%' }} className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[20px] shadow-sm border border-black/5 z-0" transition={{ type: "spring", stiffness: 450, damping: 30 }} />
                </div>

                <AnimatePresence>
                  {deliveryMethod === 'village' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2 pb-2 px-2">
                       <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-widest pl-1">รายละเอียดที่อยู่ส่ง <span className="text-red-500">*</span></label>
                       <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ระบุบ้านเลขที่, ซอย (อย่างน้อยต้องมีเพื่อจัดส่งได้อย่างแม่นยำ)" rows={3} className="w-full p-5 rounded-[24px] border-2 font-bold bg-[#FAFAF9] border-gray-100 focus:bg-white focus:border-[#FF6B00] focus:shadow-sm outline-none transition-all resize-none shadow-inner" />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>

          <motion.div variants={slideUpItem} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 shadow-sm border border-white">
             <div className="px-6 py-5 border-b border-gray-100/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><CreditCard className="w-5 h-5 text-emerald-500"/></div>
                <h2 className="font-black text-gray-800">วิธีชำระเงิน</h2>
             </div>
             <div className="p-4 space-y-3">
                 <PaymentOption method="cod" selected={paymentMethod} onSelect={setPaymentMethod} icon={Banknote} title="จ่ายเงินสด / เก็บเงินปลายทาง" description="ชำระเงินให้พนักงานจัดส่งเมื่อรับอาหาร" color="emerald" />
                 <PaymentOption method="promptpay" selected={paymentMethod} onSelect={setPaymentMethod} icon={QrCode} title="พร้อมเพย์ / สแกนคิวอาร์" description="โอนเงินปลอดภัยผ่านแอปธนาคาร รวดเร็วกว่า" color="blue" />
             </div>
          </motion.div>

          {/* Special notes & coupons */}
          <motion.div variants={slideUpItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white">
                <h2 className="font-black text-gray-800 mb-4 text-sm uppercase tracking-widest">หมายเหตุพิเศษ</h2>
                <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="ไม่ใส่ผัก เผ็ดน้อย พิเศษข้าว..." rows={2} className="w-full p-4 rounded-[20px] border-2 font-bold bg-[#FAFAF9] border-gray-100 focus:bg-white focus:border-gray-300 outline-none transition-all resize-none" />
             </div>
             <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white flex flex-col justify-center">
                <CouponInputCompact orderTotal={subtotal} menuItemIds={items.map(i => i.menuItem.id)} onApply={(res) => applyCoupon(res.code, res.discount)} onRemove={removeCoupon} appliedCoupon={couponCode ? { couponId: 0, code: couponCode, name: couponCode, discount: discountAmount } : null} disabled={isProcessing} />
             </div>
          </motion.div>

          {/* Gamification preview */}
          {!isGuest && user && (
            <motion.div variants={slideUpItem} className="bg-gradient-to-br from-[#1C1917] to-[#292524] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF6B00]/20 rounded-full blur-3xl pointer-events-none" />
               <h2 className="font-black text-white flex items-center gap-2 mb-4 relative z-10"><Gift className="w-5 h-5 text-[#FF6B00]" /> สิ่งที่คุณจะได้รับจากออเดอร์นี้</h2>
               <div className="flex gap-4 relative z-10">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10">
                     <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest mb-1">Earn Points</p>
                     <p className="text-2xl font-black text-white flex items-center gap-1"><Sparkles className="w-5 h-5" /> +{pointsToEarn}</p>
                  </div>
                  {ticketsToEarn > 0 && (
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10">
                        <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest mb-1">Lotto Tickets</p>
                        <p className="text-2xl font-black text-white flex items-center gap-1"><Ticket className="w-5 h-5" /> +{ticketsToEarn}</p>
                     </div>
                  )}
               </div>
            </motion.div>
          )}

          {/* Summary Details */}
          <motion.div variants={slideUpItem} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white mb-24">
             <h2 className="font-black text-gray-800 mb-6 pb-4 border-b border-gray-100/50">สรุปยอดที่ต้องชำระ</h2>
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#FAFAF9] p-4 rounded-2xl border border-gray-100/50">
                  <span className="text-sm font-bold text-gray-500">ยอดรวม ({items.reduce((sum, i) => sum + i.quantity, 0)} รายการ)</span>
                  <span className="font-black text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                {(discountAmount > 0 || pointsUsed > 0) && (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100/50 space-y-2">
                     {discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                           <span className="text-green-700 font-bold">คูปองส่วนลด</span>
                           <span className="text-green-600 font-black">-{formatPrice(discountAmount)}</span>
                        </div>
                     )}
                     {pointsUsed > 0 && (
                        <div className="flex justify-between text-sm">
                           <span className="text-green-700 font-bold">ส่วนลดพอยต์ ({pointsUsed})</span>
                           <span className="text-green-600 font-black">-{formatPrice(pointsUsed / 10)}</span>
                        </div>
                     )}
                  </div>
                )}
             </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Modern Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] safe-area-pb">
        <div className="absolute inset-x-0 bottom-0 h-full bg-white/70 backdrop-blur-3xl border-t border-white shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] -z-10" />
        <Container className="py-5 max-w-2xl mx-auto flex items-center justify-between gap-4">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">ยอดสุทธิ</p>
              <p className="text-3xl font-black text-[#FF6B00] tracking-tighter leading-none m-0 p-0 drop-shadow-sm">{formatPrice(finalTotal)}</p>
           </div>
           
           <motion.button whileTap={{ scale: 0.96 }} disabled={isProcessing} onClick={handlePlaceOrder} className="h-16 px-10 bg-[#FF6B00] text-white rounded-[24px] shadow-xl shadow-[#FF6B00]/40 flex items-center gap-3 relative overflow-hidden group border border-[#FF6B00] disabled:opacity-50 disabled:grayscale transition-all flex-shrink-0">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             {isProcessing ? (
               <span className="font-black text-lg tracking-tight px-4 animate-pulse">กำลังระบบ...</span>
             ) : (
               <>
                  <span className="font-black text-lg tracking-tight">ยืนยันสั่งซื้อ</span>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center relative z-10 backdrop-blur-md">
                     <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
               </>
             )}
           </motion.button>
        </Container>
      </div>
    </div>
  )
}
