import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Truck,
  MapPin,
  Info,
  Share2
} from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { CouponInput } from '@/features/coupons/components/CouponInput'
import { formatPrice } from '@/utils/formatPrice'
import { EmptyState } from '@/components/feedback/EmptyState'
import { SmartUpsell } from '@/features/cart/components/SmartUpsell'
import { CollaborativeCartBadge, UserAvatar, useCollaborativeCart } from '@/features/collaboration/CollaborativeCart'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { trackPageView, trackBeginCheckout } from '@/lib/analytics'
import { useSEO } from '@/hooks/useSEO'
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

export default function CartPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discountAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
    pointsUsed,
    setPointsUsed,
    finalTotal,
    deliveryMethod,
    setDeliveryMethod,
  } = useCartStore()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const collabCart = useCollaborativeCart()

  const maxPoints = user ? Math.min(user.points || 0, Math.floor(subtotal / 10) * 10) : 0

  useEffect(() => {
    trackPageView('/cart', 'Cart')
    window.scrollTo(0, 0)
    if (items.length > 0) trackBeginCheckout(items as any, finalTotal)
  }, [])

  useSEO({
    title: 'ตะกร้าสินค้า | กะเพรา 52',
    description: 'ตรวจสอบรายการอาหารในตะกร้าของคุณ พร้อมสั่งกะเพรารสเด็ดที่ กะเพรา 52'
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const joinId = urlParams.get('join')
    if (joinId && user && !collabCart.isConnected) {
      collabCart.joinCart(joinId).then((success: boolean) => {
        if (success) addToast({ type: 'success', title: 'เข้าร่วมตะกร้าแบบกลุ่มสำเร็จแล้ว' })
      })
    }
  }, [user, collabCart.isConnected, collabCart, addToast])

  const handleShareCart = async () => {
    hapticHeavy()
    if (!user || isGuest) {
      addToast({ type: 'error', title: 'ไม่สามารถแชร์ได้', message: 'กรุณาเข้าสู่ระบบผ่าน LINE' })
      return
    }
    let cartId = collabCart.cart?.id
    if (!cartId) cartId = (await collabCart.createCart()) || undefined
    if (cartId) {
      navigator.clipboard.writeText(`${window.location.origin}/cart?join=${cartId}`)
      addToast({ type: 'success', title: 'คัดลอกลิงก์ตะกร้าปาร์ตี้แล้ว' })
    }
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    hapticLight()
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const confirmClearCart = () => {
    hapticHeavy()
    clearCart()
    setShowClearConfirm(false)
    addToast({ type: 'info', title: 'ล้างตะกร้าเรียบร้อย' })
  }

  /* Empty Cart View */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-base)' }}>
        {/* Background Ambient Glow */}
        <div className="fixed top-0 left-0 right-0 h-[40vh] pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[80px] opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #FF5E00 0%, transparent 70%)' }}
          />
        </div>

        <Container className="py-5 relative z-10 flex-1 flex flex-col px-4 max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between">
            <motion.button
              type="button"
              aria-label="ย้อนกลับ"
              whileTap={{ scale: 0.9 }}
              onClick={() => { hapticLight(); navigate(-1) }}
              className="w-11 h-11 rounded-[16px] flex items-center justify-center text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </motion.button>
            <h1 className="text-base font-black text-white">ตะกร้าสินค้า</h1>
            <div className="w-11" />
          </div>

          <div className="flex-1 flex items-center justify-center my-auto">
            <EmptyState type="cart" onAction={() => navigate('/')} />
          </div>
        </Container>
      </div>
    )
  }

  /* Cart Has Items View */
  return (
    <div className="min-h-screen safe-area-pt pb-48 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background Glow */}
      <div className="fixed top-0 left-0 right-0 h-[35vh] pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-24 right-0 w-80 h-80 rounded-full blur-[70px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF5E00 0%, transparent 70%)' }}
        />
      </div>

      <Container className="py-4 relative z-10 space-y-5 max-w-2xl mx-auto px-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            aria-label="ย้อนกลับ"
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticLight(); navigate(-1) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </motion.button>

          <div className="text-center">
            <h1 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>ตะกร้าสินค้า</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {items.reduce((sum, i) => sum + i.quantity, 0)} จาน
              </span>
            </h1>
          </div>

          <motion.button
            type="button"
            aria-label="ล้างตะกร้า"
            whileTap={{ scale: 0.9 }}
            onClick={() => { hapticMedium(); setShowClearConfirm(true) }}
            className="w-11 h-11 rounded-[16px] flex items-center justify-center text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <Trash2 className="w-4.5 h-4.5" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Collaborative Party Cart Banner */}
        <AnimatePresence>
          {collabCart.isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 rounded-[22px] border border-white/10 relative overflow-hidden"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <CollaborativeCartBadge count={collabCart.connectedUsers.length} />
                    <div>
                      <p className="font-black text-white text-xs">ปาร์ตี้ตะกร้ากลุ่ม</p>
                      <div className="flex items-center -space-x-2 mt-1">
                        {collabCart.connectedUsers.map((u: any, i: number) => (
                          <motion.div
                            key={u.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="border-2 border-[#1A1A1E] rounded-full"
                          >
                            <UserAvatar user={u} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleShareCart}
                    className="bg-[var(--bg-surface)] hover:bg-white/10 text-white font-black text-xs px-4 py-2 rounded-full border border-white/10 flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    แชร์ลิงก์
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items List */}
        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={slideUpItem} className="rounded-[28px] p-4 border border-white/10 space-y-3" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="font-black text-white text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                รายการอาหารที่สั่ง ({items.length})
              </h2>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50, height: 0 }}
                    className="p-3.5 rounded-[20px] flex gap-3.5 relative overflow-hidden border border-white/5"
                    style={{ background: 'var(--bg-surface)' }}
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-[16px] overflow-hidden border border-white/10 bg-black/30">
                      <img
                        src={getValidImageUrl(item.menuItem.imageUrl)}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md">
                        {item.quantity}
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-black text-white text-sm leading-snug line-clamp-1">
                            {item.menuItem.name}
                          </h3>
                          <span className="font-black text-sm text-gradient-fire flex-shrink-0">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>

                        {/* Selected Options */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedOptions.map(o => (
                              <span key={o.optionId} className="text-[10px] font-bold bg-white/5 text-gray-300 px-2 py-0.5 rounded-md border border-white/5">
                                {o.name} {o.price > 0 && `(+฿${o.price})`}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.note && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1 italic">
                            <Info className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium truncate">"{item.note}"</span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-bold text-gray-500">฿{item.menuItem.price} / จาน</span>

                        <div className="flex items-center gap-2 p-1 rounded-full bg-black/40 border border-white/10">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-300 rounded-full hover:bg-white/10"
                            aria-label="ลดจำนวน"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </motion.button>
                          <span className="w-5 text-center font-black text-xs text-white">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-orange-400 rounded-full hover:bg-white/10"
                            aria-label="เพิ่มจำนวน"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Smart Upsell Section */}
            {!isGuest && (
              <div className="pt-2">
                <SmartUpsell />
              </div>
            )}
          </motion.div>

          {/* Delivery Method Toggle */}
          <motion.div variants={slideUpItem} className="rounded-[28px] p-4 border border-white/10 space-y-3" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4 text-orange-400" />
              <span>วิธีรับอาหาร / จัดส่ง</span>
            </div>

            <div className="flex bg-[var(--bg-surface)] p-1 rounded-[18px] relative border border-white/5">
              <button
                type="button"
                onClick={() => { setDeliveryMethod('workplace'); hapticLight(); }}
                className={cn(
                  "flex-1 py-3 rounded-[14px] font-black text-xs flex items-center justify-center gap-2 relative z-10 transition-colors",
                  deliveryMethod === 'workplace' ? "text-white" : "text-gray-400"
                )}
              >
                <MapPin className="w-3.5 h-3.5" /> รับที่ทำงาน
              </button>
              <button
                type="button"
                onClick={() => { setDeliveryMethod('village'); hapticLight(); }}
                className={cn(
                  "flex-1 py-3 rounded-[14px] font-black text-xs flex items-center justify-center gap-2 relative z-10 transition-colors",
                  deliveryMethod === 'village' ? "text-white" : "text-gray-400"
                )}
              >
                <Truck className="w-3.5 h-3.5" /> ส่งหมู่บ้าน
              </button>

              <motion.div
                initial={false}
                animate={{ x: deliveryMethod === 'workplace' ? '0%' : '100%' }}
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#FF5E00] to-[#FF3A00] rounded-[14px] shadow-lg shadow-orange-500/25 z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
          </motion.div>

          {/* Coupons & Points Section */}
          <motion.div variants={slideUpItem} className="rounded-[28px] p-5 space-y-4 border border-white/10" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ส่วนลด & สิทธิพิเศษ</span>
            </div>

            <CouponInput
              orderTotal={subtotal}
              menuItemIds={items.map(i => i.menuItem.id)}
              appliedCoupon={couponCode ? { couponId: 1, discount: discountAmount, code: couponCode, name: couponCode } : null}
              onApply={(res) => applyCoupon(res.code, res.discount)}
              onRemove={() => removeCoupon()}
            />

            {!isGuest && user && maxPoints >= 10 && (
              <div className="p-3.5 rounded-[18px] border border-amber-500/20 bg-amber-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-amber-300 text-xs">ใช้พอยต์สะสมลดเพิ่ม</p>
                    <p className="text-[10px] text-amber-200/70 font-medium">10 พอยต์ = 10 บาท (มี {user.points} pts)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      hapticMedium()
                      setPointsUsed(pointsUsed > 0 ? 0 : Math.min(maxPoints, 50))
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full font-black text-xs transition-all",
                      pointsUsed > 0
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "bg-white/10 text-amber-300 border border-amber-500/30 hover:bg-white/20"
                    )}
                  >
                    {pointsUsed > 0 ? `ใช้ ${pointsUsed} pts` : 'ใช้พอยต์'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={slideUpItem} className="rounded-[28px] p-5 space-y-3 border border-white/10" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">สรุปยอดรวม</h2>
            <div className="space-y-2 text-xs font-bold text-gray-300">
              <div className="flex justify-between">
                <span>ราคารวมสินค้า</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>ส่วนลดคูปอง ({couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {pointsUsed > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>ส่วนลดพอยต์ ({pointsUsed} pts)</span>
                  <span>-{formatPrice(pointsUsed)}</span>
                </div>
              )}
              <div className="pt-2 flex justify-between items-baseline text-sm font-black text-white border-t border-white/5">
                <span>ยอดชำระสุทธิ</span>
                <span className="text-xl text-gradient-fire">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Floating Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-pb pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div
            className="p-4 rounded-[28px] flex items-center justify-between gap-4"
            style={{
              background: 'rgba(20, 20, 24, 0.96)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 94, 0, 0.3)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255, 94, 0, 0.1)'
            }}
          >
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ยอดรวมทั้งหมด</p>
              <p className="text-xl font-black text-gradient-fire leading-none mt-0.5">
                {formatPrice(finalTotal)}
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticHeavy(); navigate('/checkout') }}
              className="flex-1 max-w-[200px] h-13 btn-brand rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
            >
              <span>ชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="rounded-[28px] w-full max-w-sm p-6 relative z-10 text-center border border-white/10"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg text-white mb-1">ล้างรายการในตะกร้า?</h3>
              <p className="text-xs text-gray-400 mb-6">รายการอาหารทั้งหมดในตะกร้าจะถูกลบออก</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="py-3 rounded-full font-bold text-xs bg-white/10 text-gray-300 hover:bg-white/15"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmClearCart}
                  className="py-3 rounded-full font-bold text-xs bg-red-500 text-white shadow-lg shadow-red-500/30"
                >
                  ยืนยันล้างตะกร้า
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
