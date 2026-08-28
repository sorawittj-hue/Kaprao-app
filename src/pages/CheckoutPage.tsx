import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Check, QrCode, MapPin, Truck, CreditCard,
  Banknote, ChevronRight, User, Sparkles, Ticket, Gift, Upload, Copy,
  Clock, Calendar
} from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import { Container } from '@/components/layout/Container'
import { createUnifiedOrder, getOrCreateGuestIdentity } from '@/features/v2/api/unifiedOrderApi'
import { CouponInputCompact } from '@/features/coupons/components/CouponInput'
import { GuestConversionPanel } from '@/features/v2/components/GuestConversionPanel'
import { usePointsCalculator, useAddPoints } from '@/features/points/hooks/usePoints'
import { buildLineOrderMessage, getThaiLotteryDrawDate, redirectToLineOA } from '@/utils/buildLineMessage'
import { validateCheckoutForm } from '@/utils/validations'
import confetti from 'canvas-confetti'
import type { Order, CartItem, SelectedOption } from '@/types'

export type OrderWithLotto = Order & { lottoNumber?: string; lottoFortune?: string }

const slideUpItem = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

// Payment Option Component
function PaymentOption({
  method, selected, onSelect, icon: Icon, title, description
}: {
  method: 'cod' | 'promptpay' | 'transfer'
  selected: 'cod' | 'promptpay' | 'transfer'
  onSelect: (m: 'cod' | 'promptpay' | 'transfer') => void
  icon: any
  title: string
  description: string
}) {
  const isSelected = selected === method
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => { hapticMedium(); onSelect(method) }}
      className={cn(
        "w-full p-4 rounded-[22px] border text-left flex items-center gap-3.5 transition-all relative overflow-hidden cursor-pointer",
        isSelected
          ? 'border-orange-500/80 bg-orange-50/50 shadow-md shadow-orange-500/10'
          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-orange-200'
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-[16px] flex items-center justify-center transition-all relative z-10",
        isSelected
          ? "bg-gradient-to-br from-[#FF5500] to-[#E03E00] text-white shadow-md shadow-orange-500/30"
          : "bg-[var(--bg-card)] text-slate-500 border border-[var(--border-subtle)]"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 relative z-10 min-w-0">
        <p className={cn("font-black text-sm leading-tight", isSelected ? "text-orange-600" : "text-slate-900")}>{title}</p>
        <p className={cn("text-[11px] font-medium mt-0.5 truncate", isSelected ? "text-orange-500" : "text-slate-500")}>{description}</p>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border flex items-center justify-center transition-all relative z-10",
        isSelected ? "border-[#FF5500] bg-[#FF5500]" : "border-slate-300 bg-transparent"
      )}>
         {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none" />
      )}
    </motion.button>
  )
}

// Order success component
function OrderSuccess({ order, onContinue }: { order: OrderWithLotto; onContinue: () => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [slipUrl, setSlipUrl] = useState<string | null>(order.paymentSlipUrl || null)
  const [copied, setCopied] = useState(false)
  const { addToast } = useUIStore()

  const lottoNumber = order.lottoNumber || String(order.id).slice(-2).padStart(2, '0')
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
    } catch {
      addToast({ type: 'error', title: 'อัปโหลดไม่สำเร็จ', message: 'กรุณาลองใหม่อีกครั้ง หรือส่งทาง LINE' })
    } finally { setIsUploading(false) }
  }

  const handleCopyPromptPay = () => {
    navigator.clipboard.writeText('0812345678')
    hapticLight()
    setCopied(true)
    addToast({ type: 'success', title: 'คัดลอกเลขพร้อมเพย์แล้ว' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen safe-area-pt flex flex-col items-center p-4 pb-32 overflow-y-auto relative" style={{ background: 'var(--bg-base)' }}>
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-md relative z-10 pt-6 space-y-6"
      >
        {/* Celebration Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
            className="w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto mb-5 shadow-xl relative"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              boxShadow: '0 12px 36px rgba(34,197,94,0.35)',
              border: '2px solid rgba(255,255,255,0.4)'
            }}
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>สั่งซื้อสำเร็จ!</h1>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">
            ออเดอร์ #{order.id} กำลังถูกจัดเตรียม
          </p>
        </div>

        {/* Payment QR section */}
        {(order.paymentMethod === 'promptpay' || order.paymentMethod === 'transfer') && (
          <div
            className="rounded-[30px] p-6 shadow-sm relative overflow-hidden text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
            }}
          >
             <div className="w-12 h-12 rounded-[16px] flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(2,132,199,0.10)', border: '1px solid rgba(2,132,199,0.20)' }}>
                <QrCode className="w-6 h-6 text-sky-600" />
             </div>
             <h3 className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>สแกนชำระเงิน</h3>
             <p className="text-xs font-black text-orange-600 uppercase tracking-wider px-3 py-1 rounded-full w-fit mx-auto mb-5"
                style={{ background: 'rgba(255,85,0,0.10)', border: '1px solid rgba(255,85,0,0.20)' }}>
               ยอดโอน {formatPrice(order.totalPrice)}
             </p>

             <div
               className="rounded-[24px] p-5 mb-5 border relative z-10 bg-slate-50"
               style={{ borderColor: 'var(--border-subtle)' }}
             >
                <div className="w-44 h-44 bg-white rounded-[20px] p-2 shadow-sm flex items-center justify-center mx-auto mb-4 overflow-hidden border border-slate-100">
                   <img
                     src={`https://promptpay.io/0812345678/${order.totalPrice}.png`}
                     alt="PromptPay QR"
                     className="w-full h-full object-contain"
                   />
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="font-black text-lg tracking-wider num-display" style={{ color: 'var(--text-primary)' }}>081-234-5678</p>
                  <button
                    onClick={handleCopyPromptPay}
                    className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    title="คัดลอกเบอร์"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium">ชื่อบัญชี: กะเพรา 52 (พร้อมเพย์)</p>
             </div>

             {/* Slip Upload */}
             <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="slip-upload-success"
                />
                <label
                  htmlFor="slip-upload-success"
                  className={cn(
                    "w-full py-3.5 px-4 rounded-[18px] border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all",
                    slipUrl
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 hover:border-orange-400 bg-slate-50 text-slate-700"
                  )}
                >
                  {isUploading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" />
                  ) : slipUrl ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-xs">แนบสลิปเรียบร้อยแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-500" />
                      <div className="text-left">
                        <p className="font-black text-xs">แนบหลักฐานการโอน (สลิป)</p>
                        <span className="text-[10px] text-slate-500 font-normal">แตะเพื่ออัปโหลดรูปภาพ</span>
                      </div>
                    </>
                  )}
                </label>
             </div>
          </div>
        )}

        {/* Gemini AI Lucky Number Ticket */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-[28px] p-5 border relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            borderColor: 'rgba(245,158,11,0.3)',
            boxShadow: '0 4px 20px rgba(245,158,11,0.12)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-200/60 border border-amber-300/40">
                ⭐ เลขเด็ดลุ้นกินฟรี
              </span>
              <p className="text-xs font-bold text-slate-600 mt-2">
                ตั๋วสลากประจำออเดอร์นี้ (งวดถัดไป)
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-amber-700 num-display tracking-widest">
                {lottoNumber}
              </span>
              {ticketsEarned > 0 && (
                <p className="text-[9px] font-bold text-amber-800 mt-0.5">+{ticketsEarned} ตั๋วสิทธิ์</p>
              )}
            </div>
          </div>

          {order.lottoFortune && (
            <div className="pt-2.5 border-t border-amber-300/40 flex items-center gap-1.5 text-xs font-medium text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="italic">"{order.lottoFortune}"</span>
            </div>
          )}
        </motion.div>

        {/* Order Summary Receipt */}
        <div
           className="rounded-[28px] p-5 space-y-3"
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}
        >
           <div className="flex items-center gap-2.5 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <Banknote className="w-4 h-4 text-slate-500" />
              <h3 className="font-black text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>สรุปคำสั่งซื้อ</h3>
           </div>
           <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-500">
                <span>ราคารวม ({order.items.reduce((s: number, i: any) => s + i.quantity, 0)} รายการ)</span>
                <span className="num-display" style={{ color: 'var(--text-primary)' }}>{formatPrice(order.subtotalPrice || order.totalPrice)}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>ส่วนลดคูปอง</span>
                  <span className="num-display">-{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              {order.pointsRedeemed ? (
                <div className="flex justify-between font-bold text-amber-600">
                  <span>ส่วนลดพอยต์</span>
                  <span className="num-display">-{formatPrice(order.pointsRedeemed / 10)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-black text-sm pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-primary)' }}>ยอดสุทธิ</span>
                <span className="text-gradient-fire num-display">{formatPrice(order.totalPrice)}</span>
              </div>
           </div>
        </div>

        {/* Continue Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onContinue}
          className="w-full py-4 rounded-[22px] font-black text-sm flex items-center justify-center gap-2 cursor-pointer text-white"
          style={{
            background: 'linear-gradient(135deg, #FF5500, #E03E00)',
            boxShadow: '0 8px 24px rgba(255,85,0,0.35)',
          }}
        >
          <span>ดูสถานะคำสั่งซื้อ</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()
  const {
    items,
    subtotal,
    discountAmount,
    couponCode,
    pointsUsed,
    deliveryMethod,
    setDeliveryMethod,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const addPointsMutation = useAddPoints()
  const { calculateEarned } = usePointsCalculator()

  const [customerName, setCustomerName] = useState(user?.displayName || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'promptpay'>('cod')
  const [deliveryTimeType, setDeliveryTimeType] = useState<'now' | 'scheduled'>('now')
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('12:00 น.')

  const [showSuccess, setShowSuccess] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<OrderWithLotto | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Restore saved checkout info from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kaprao_saved_checkout_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.customerName && !customerName) setCustomerName(parsed.customerName)
        if (parsed.phoneNumber && !phoneNumber) setPhoneNumber(parsed.phoneNumber)
        if (parsed.address && !address) setAddress(parsed.address)
      } else if (user?.phoneNumber && !phoneNumber) {
        setPhoneNumber(user.phoneNumber)
      }
    } catch {}
  }, [user])

  const pointsDiscount = pointsUsed / 10
  const finalTotal = Math.max(0, subtotal - discountAmount - pointsDiscount)
  const pointsToEarn = calculateEarned(finalTotal)
  const ticketsToEarn = Math.floor(finalTotal / 100)

  useEffect(() => {
    if (items.length === 0 && !showSuccess) navigate('/cart')
    window.scrollTo(0, 0)
  }, [items.length, navigate, showSuccess])

  const handlePlaceOrder = useCallback(async () => {
    hapticHeavy()
    const validation = validateCheckoutForm({ customerName, phoneNumber, address, paymentMethod, deliveryMethod }, deliveryMethod)
    if (!validation.valid) {
      Object.entries(validation.errors).forEach(([, message]) => {
        addToast({ type: 'error', title: 'ข้อมูลไม่ครบถ้วน', message: message as string })
      })
      return
    }

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

      const formattedInstructions = deliveryTimeType === 'scheduled'
        ? `[เวลารับ: ${deliveryTimeSlot}] ${specialInstructions.trim()}`.trim()
        : specialInstructions.trim()

      const unifiedOrder = await createUnifiedOrder({
        guestId, userId, lineUserId, customerName: customerName.trim(), phoneNumber: phoneNumber.trim(),
        items: items.map((item: CartItem) => ({ id: item.id, menuItemId: item.menuItem.id, name: item.menuItem.name, price: item.menuItem.price, quantity: item.quantity, options: item.selectedOptions.map((opt: SelectedOption) => ({ optionId: opt.optionId, name: opt.name, price: opt.price })), note: item.note, subtotal: item.subtotal })),
        subtotalPrice: subtotal, discountAmount: discountAmount, discountCode: couponCode || undefined, pointsRedeemed: pointsUsed, totalPrice: finalTotal, paymentMethod: paymentMethod, deliveryMethod: deliveryMethod, address: deliveryMethod === 'village' ? address.trim() : undefined, specialInstructions: formattedInstructions || undefined,
      })

      const order: Order = {
        id: unifiedOrder.id, userId: unifiedOrder.userId, lineUserId: unifiedOrder.lineUserId, customerName: unifiedOrder.customerName, phoneNumber: unifiedOrder.phoneNumber, address: unifiedOrder.address, deliveryMethod: unifiedOrder.deliveryMethod, specialInstructions: unifiedOrder.specialInstructions,
        items: unifiedOrder.items.map((item: any) => ({ id: item.id, menuItemId: item.menuItemId, name: item.name, price: item.price, quantity: item.quantity, options: item.options.map((opt: any) => ({ optionId: opt.optionId, name: opt.name, price: opt.price })), note: item.note || '', subtotal: item.subtotal })),
        status: unifiedOrder.status as Order['status'], totalPrice: unifiedOrder.totalPrice, subtotalPrice: unifiedOrder.subtotalPrice, discountAmount: unifiedOrder.discountAmount, discountCode: unifiedOrder.discountCode, pointsRedeemed: unifiedOrder.pointsRedeemed, pointsEarned: unifiedOrder.pointsEarned, paymentMethod: unifiedOrder.paymentMethod, paymentStatus: unifiedOrder.paymentStatus, trackingToken: unifiedOrder.guestId || undefined, createdAt: unifiedOrder.createdAt, updatedAt: unifiedOrder.updatedAt, estimatedReadyTime: unifiedOrder.estimatedReadyTime,
      }

      if (user?.id && pointsToEarn > 0) {
        try { await addPointsMutation.mutateAsync({ userId: user.id, amount: pointsToEarn, action: 'EARN', note: `สั่งซื้อออเดอร์ #${order.id}`, orderId: order.id }) } catch (e) { console.error(e) }
      }

      // -- GEMINI AI LUCKY NUMBER --
      let finalLottoNumber = unifiedOrder.queue?.display?.slice(-2) || String(order.id).slice(-2).padStart(2, '0')
      let lottoFortune = undefined
      try {
        const { generateLuckyLotteryWithGemini } = await import('@/features/ai/api/geminiLotteryApi')
        const geminiResult = await generateLuckyLotteryWithGemini(unifiedOrder as any)
        finalLottoNumber = geminiResult.number
        lottoFortune = geminiResult.fortune
      } catch (e) { console.error('Gemini Failed:', e) }

      const finalOrder = { ...order, lottoNumber: finalLottoNumber, lottoFortune }

      setCreatedOrder(finalOrder)
      clearCart()
      useAuthStore.getState().incrementOrderCount()

      try {
        localStorage.setItem('kaprao_saved_checkout_profile', JSON.stringify({
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim()
        }))
      } catch {}

      const targetId = user?.id || guestId
      if (targetId) {
        import('@/features/gamification/GamificationEngine').then(m => {
          const gameEngine = m.getUserGamification(targetId)
          gameEngine.recordOrder()
        })
      }

      setShowSuccess(true)
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 }, colors: ['#FF5500', '#FBBF24', '#10B981'] })
      addToast({ type: 'success', title: 'ยอดเยี่ยม!', message: unifiedOrder.queue?.display ? `ออเดอร์ #${order.id} - คิว ${unifiedOrder.queue.display}` : `ออเดอร์ #${order.id} บันทึกเรียบร้อย` })

      const drawDate = getThaiLotteryDrawDate()
      const isGuestUser = !user?.lineUserId
      const lineMessage = buildLineOrderMessage({ order, lottoNumber: finalLottoNumber, drawDate, isGuest: isGuestUser, pointsEarned: pointsToEarn, ticketsEarned: ticketsToEarn })

      setTimeout(async () => { await redirectToLineOA(lineMessage) }, 4000)
    } catch {
      addToast({ type: 'error', title: 'เกิดข้อผิดพลาด', message: 'กรุณาลองใหม่อีกครั้ง' })
    } finally {
      setIsProcessing(false)
    }
  }, [addPointsMutation, addToast, address, clearCart, couponCode, customerName, deliveryMethod, discountAmount, finalTotal, items, paymentMethod, phoneNumber, pointsToEarn, pointsUsed, specialInstructions, subtotal, ticketsToEarn, user])

  if (showSuccess && createdOrder) {
    return <OrderSuccess order={createdOrder} onContinue={() => navigate('/orders')} />
  }

  return (
    <div className="min-h-screen safe-area-pt pb-52 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-16 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #FF5500 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      <Container className="py-4 relative z-10 max-w-2xl mx-auto space-y-5 px-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pt-1">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.88 }}
            onClick={() => { hapticLight(); navigate(-1) }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center cursor-pointer transition-colors shadow-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
          </motion.button>
          <div className="text-center">
            <h1 className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>ชำระเงิน</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-500 mt-0.5">CHECKOUT</p>
          </div>
          <div className="w-11" />
        </div>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-4">

          {/* 1. Customer Information Card */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] overflow-hidden p-5 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}
          >
             <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(2,132,199,0.10)', border: '1px solid rgba(2,132,199,0.20)' }}>
                  <User className="w-4 h-4 text-sky-600"/>
                </div>
                <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>ข้อมูลผู้สั่งซื้อ</h2>
             </div>
             <div className="space-y-3.5">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                     ชื่อ-นามสกุล {deliveryMethod === 'village' && <span className="text-red-500">*</span>}
                   </label>
                   <input
                     type="text"
                     value={customerName}
                     onChange={(e) => setCustomerName(e.target.value)}
                     placeholder={user?.displayName ? user.displayName : 'ระบุชื่อของคุณ เช่น สมชาย'}
                     readOnly={deliveryMethod === 'workplace' && !!user?.displayName}
                     className={cn(
                       "w-full h-12 px-4 rounded-[16px] text-sm font-bold outline-none transition-all border",
                       (deliveryMethod === 'workplace' && !!user?.displayName)
                         ? "opacity-60 cursor-not-allowed bg-slate-100"
                         : "focus:border-orange-500 bg-white"
                     )}
                     style={{
                       borderColor: 'var(--border-subtle)',
                       color: 'var(--text-primary)',
                     }}
                   />
                </div>
                <AnimatePresence>
                  {(deliveryMethod === 'village' || (deliveryMethod === 'workplace' && isGuest)) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider pl-1 mt-3">
                        เบอร์โทรศัพท์{' '}
                        {deliveryMethod === 'village'
                          ? <span className="text-red-500">*</span>
                          : <span className="text-slate-400 text-[9px] font-normal">(ไม่บังคับ)</span>
                        }
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="เช่น 0812345678"
                        className="w-full h-12 px-4 rounded-[16px] text-sm font-bold outline-none transition-all border focus:border-orange-500 bg-white"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>

          {/* 2. Delivery Method Card */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}
          >
             <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,85,0,0.10)', border: '1px solid rgba(255,85,0,0.20)' }}>
                  <Truck className="w-4 h-4 text-orange-500"/>
                </div>
                <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>วิธีรับอาหาร</h2>
             </div>
             <div className="space-y-3">
                <div
                  className="flex p-1 rounded-[18px] relative"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                   <button
                     type="button"
                     onClick={() => { hapticMedium(); setDeliveryMethod('workplace') }}
                     className={cn(
                       "flex-1 py-3 rounded-[14px] font-black text-xs relative z-10 transition-colors flex items-center justify-center gap-2 cursor-pointer",
                       deliveryMethod === 'workplace' ? "text-white" : "text-slate-600"
                     )}
                   >
                      <MapPin className="w-4 h-4"/> ที่ทำงาน
                   </button>
                   <button
                     type="button"
                     onClick={() => { hapticMedium(); setDeliveryMethod('village') }}
                     className={cn(
                       "flex-1 py-3 rounded-[14px] font-black text-xs relative z-10 transition-colors flex items-center justify-center gap-2 cursor-pointer",
                       deliveryMethod === 'village' ? "text-white" : "text-slate-600"
                     )}
                   >
                      <Truck className="w-4 h-4"/> หมู่บ้าน
                   </button>
                   <motion.div
                     initial={false}
                     animate={{ x: deliveryMethod === 'workplace' ? '0%' : '100%' }}
                     className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[14px] z-0"
                     style={{
                       background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                       boxShadow: '0 4px 14px rgba(255,85,0,0.30)',
                     }}
                     transition={{ type: "spring", stiffness: 450, damping: 30 }}
                   />
                </div>

                <AnimatePresence>
                  {deliveryMethod === 'village' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                       <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider pl-1">
                         รายละเอียดที่อยู่จัดส่ง <span className="text-red-500">*</span>
                       </label>
                       <textarea
                         value={address}
                         onChange={(e) => setAddress(e.target.value)}
                         placeholder="ระบุบ้านเลขที่, ซอย เพื่อให้จัดส่งได้ถูกต้อง"
                         rows={2}
                         className="w-full p-3.5 rounded-[16px] text-sm font-medium border outline-none transition-all resize-none focus:border-orange-500 bg-white"
                         style={{
                           borderColor: 'var(--border-subtle)',
                           color: 'var(--text-primary)',
                         }}
                       />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>

          {/* 3. Delivery Time Slot Card (Scheduled / Immediate) */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}
          >
             <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(2,132,199,0.10)', border: '1px solid rgba(2,132,199,0.20)' }}>
                  <Clock className="w-4 h-4 text-sky-600"/>
                </div>
                <div>
                  <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>เวลารับอาหาร</h2>
                  <p className="text-[10px] font-bold text-sky-800">ส่งด่วนหรือเลือกเวลารับล่วงหน้า</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { hapticLight(); setDeliveryTimeType('now') }}
                  className={cn(
                    "py-3 px-3 rounded-[16px] font-black text-xs border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                    deliveryTimeType === 'now'
                      ? "bg-sky-50 border-sky-500 text-sky-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>ส่งด่วนทันที</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">15-25 นาที</span>
                </button>

                <button
                  type="button"
                  onClick={() => { hapticLight(); setDeliveryTimeType('scheduled') }}
                  className={cn(
                    "py-3 px-3 rounded-[16px] font-black text-xs border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                    deliveryTimeType === 'scheduled'
                      ? "bg-sky-50 border-sky-500 text-sky-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ระบุเวลารับ</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">สั่งล่วงหน้า</span>
                </button>
             </div>

             <AnimatePresence>
                {deliveryTimeType === 'scheduled' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 space-y-2"
                  >
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1">
                      เลือกช่วงเวลาที่ต้องการรับ
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['11:30 น.', '12:00 น.', '12:30 น.', '13:00 น.', '17:30 น.', '18:00 น.', '18:30 น.', '19:00 น.'].map((slot) => {
                        const isSelected = deliveryTimeSlot === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => { hapticLight(); setDeliveryTimeSlot(slot) }}
                            className={cn(
                              "py-2 rounded-[12px] font-black text-[11px] border cursor-pointer transition-all",
                              isSelected
                                ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300"
                            )}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>

          {/* 4. Payment Method Card */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}
          >
             <div className="flex items-center gap-2.5 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.20)' }}>
                  <CreditCard className="w-4 h-4 text-emerald-600"/>
                </div>
                <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>วิธีชำระเงิน</h2>
             </div>
             <div className="space-y-2.5">
                 <PaymentOption method="cod" selected={paymentMethod} onSelect={setPaymentMethod} icon={Banknote} title="เงินสด / เก็บเงินปลายทาง" description="จ่ายกับพนักงานเมื่อรับอาหาร" />
                 <PaymentOption method="promptpay" selected={paymentMethod} onSelect={setPaymentMethod} icon={QrCode} title="พร้อมเพย์ / สแกน QR" description="โอนผ่านแอปธนาคาร รวดเร็วและสะดวก" />
             </div>
          </motion.div>

          {/* 4. Notes & Coupons */}
          <motion.div variants={slideUpItem} className="space-y-4">
             <div className="rounded-[28px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}>
                <h2 className="font-black mb-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>หมายเหตุพิเศษ</h2>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย, ข้าวแยกกล่อง..."
                  rows={2}
                  className="w-full p-3.5 rounded-[16px] text-sm font-medium border outline-none transition-all resize-none focus:border-orange-500 bg-white"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
                
                {/* Quick Note Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {['🌶️ แยกพริกน้ำปลา', '🥢 ขอช้อนส้อม', '🌿 ไม่ใส่ผักชี', '📞 โทรเมื่อถึง'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        hapticLight()
                        setSpecialInstructions((prev) => prev ? `${prev}, ${chip}` : chip)
                      }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
             </div>
             <div className="rounded-[28px] p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', boxShadow: '0 2px 14px rgba(15,23,42,0.04)' }}>
                <CouponInputCompact
                  orderTotal={subtotal}
                  menuItemIds={items.map((i: CartItem) => i.menuItem.id)}
                  onApply={(res: { code: string; discount: number }) => applyCoupon(res.code, res.discount)}
                  onRemove={removeCoupon}
                  appliedCoupon={couponCode ? { couponId: 0, code: couponCode, name: couponCode, discount: discountAmount } : null}
                  disabled={isProcessing}
                />
             </div>
          </motion.div>

          {/* Guest conversion banner */}
          {isGuest && pointsToEarn > 0 && (
            <motion.div variants={slideUpItem}>
              <GuestConversionPanel
                pointsToEarn={pointsToEarn}
                ticketsToEarn={ticketsToEarn}
                onLogin={async () => {
                  hapticHeavy()
                  const guestIdentity = getOrCreateGuestIdentity()
                  localStorage.setItem('kaprao_guest_identity', JSON.stringify(guestIdentity))
                  const { loginWithLine } = await import('@/lib/auth')
                  await loginWithLine()
                }}
                variant="checkout"
              />
            </motion.div>
          )}

          {/* Rewards Preview */}
          {!isGuest && user && (
            <motion.div
              variants={slideUpItem}
              className="rounded-[28px] p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                border: '1px solid rgba(245,158,11,0.3)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.08)',
              }}
            >
               <h2 className="font-black text-amber-900 flex items-center gap-2 mb-3 text-sm">
                 <Gift className="w-4 h-4 text-amber-600" />
                 สิทธิประโยชน์ที่จะได้รับจากออเดอร์นี้
               </h2>
               <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-[18px] p-3.5 border bg-white/70"
                    style={{ borderColor: 'rgba(245,158,11,0.2)' }}
                  >
                     <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider mb-1">พอยต์ที่จะได้รับ</p>
                     <p className="text-xl font-black text-amber-700 flex items-center gap-1 num-display">
                       <Sparkles className="w-4 h-4 text-amber-600" /> +{pointsToEarn} <span className="text-xs text-amber-800/70 font-bold">pts</span>
                     </p>
                  </div>
                  {ticketsToEarn > 0 && (
                     <div
                       className="rounded-[18px] p-3.5 border bg-white/70"
                       style={{ borderColor: 'rgba(22,163,74,0.2)' }}
                     >
                        <p className="text-[9px] font-black text-emerald-800 uppercase tracking-wider mb-1">ตั๋วลุ้นกินฟรี</p>
                        <p className="text-xl font-black text-emerald-700 flex items-center gap-1 num-display">
                          <Ticket className="w-4 h-4 text-emerald-600" /> +{ticketsToEarn} <span className="text-xs text-emerald-800/70 font-bold">ใบ</span>
                        </p>
                     </div>
                  )}
               </div>
            </motion.div>
          )}

          {/* Summary Breakdown */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-3"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: '0 2px 14px rgba(15,23,42,0.04)'
            }}
          >
             <h2 className="font-black text-xs uppercase tracking-wider pb-2 border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
               สรุปยอดชำระ
             </h2>
             <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>ราคารวม ({items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0)} รายการ)</span>
                  <span className="num-display" style={{ color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>ส่วนลดคูปอง ({couponCode})</span>
                    <span className="num-display">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {pointsUsed > 0 && (
                  <div className="flex justify-between font-bold text-amber-600">
                    <span>ส่วนลดพอยต์ ({pointsUsed} pts)</span>
                    <span className="num-display">-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="pt-3 flex justify-between items-center border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>ยอดชำระสุทธิ</span>
                  <span className="text-2xl font-black text-gradient-fire num-display">{formatPrice(finalTotal)}</span>
                </div>
             </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] safe-area-pb p-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between gap-3 p-4 rounded-[26px]"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(36px) saturate(180%)',
              WebkitBackdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255, 85, 0, 0.20)',
              boxShadow: '0 16px 40px -6px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)',
            }}
          >
             <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">ยอดชำระสุทธิ</p>
                <p className="text-2xl font-black text-gradient-fire leading-none mt-0.5 num-display">{formatPrice(finalTotal)}</p>
             </div>

             <motion.button
               type="button"
               whileTap={{ scale: 0.95 }}
               disabled={isProcessing}
               onClick={handlePlaceOrder}
               className="h-12 px-6 rounded-[18px] font-black text-sm flex items-center gap-2 text-white cursor-pointer disabled:opacity-50 transition-all"
               style={{
                 background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                 boxShadow: '0 6px 20px rgba(255,85,0,0.35)',
               }}
             >
               {isProcessing ? (
                 <span className="flex items-center gap-2">
                   <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                   กำลังสั่ง...
                 </span>
               ) : (
                 <>
                   <span>ยืนยันการสั่งซื้อ</span>
                   <Check className="w-4 h-4" strokeWidth={3} />
                 </>
               )}
             </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
