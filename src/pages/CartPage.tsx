import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Trash2, ArrowRight, ArrowLeft, Plus, Minus,
  Truck, MapPin, Tag, Sparkles, AlertCircle, Share2, Info, Flame
} from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/feedback/EmptyState'
import { CouponInput } from '@/features/coupons/components/CouponInput'
import { CouponWalletModal } from '@/features/coupons/components/CouponWalletModal'
import { SmartUpsell } from '@/features/cart/components/SmartUpsell'
import { CollaborativeCartBadge, UserAvatar, useCollaborativeCart } from '@/features/collaboration/CollaborativeCart'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { trackPageView } from '@/lib/analytics'
import type { CartItem, SelectedOption } from '@/types'

const slideUpItem = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } }
}
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

export default function CartPage() {
  const navigate = useNavigate()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryMethod,
    setDeliveryMethod,
    discountAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
    pointsUsed,
    setPointsUsed,
  } = useCartStore()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCouponWallet, setShowCouponWallet] = useState(false)
  const collabCart = useCollaborativeCart()

  const totalQty = items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0)
  const pointsDiscount = pointsUsed / 10
  const finalTotal = Math.max(0, subtotal - discountAmount - pointsDiscount)
  const maxPoints = Math.min(user?.points || 0, Math.floor(subtotal * 10))

  useEffect(() => {
    trackPageView('/cart', 'Cart')
    window.scrollTo(0, 0)
  }, [])

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      hapticMedium()
      removeItem(id)
      addToast({ type: 'info', title: 'ลบรายการแล้ว' })
    } else {
      hapticLight()
      updateQuantity(id, qty)
    }
  }

  const confirmClearCart = () => {
    hapticHeavy()
    clearCart()
    setShowClearConfirm(false)
    addToast({ type: 'info', title: 'ล้างตะกร้าเรียบร้อย' })
  }

  const handleShareCart = async () => {
    hapticLight()
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'มาร่วมสั่ง กะเพรา 52 กัน!',
          text: `สั่งอาหารด้วยกัน มี ${totalQty} รายการแล้ว`,
          url
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(url)
      addToast({ type: 'success', title: 'คัดลอกลิงก์แล้ว', message: 'ส่งให้เพื่อนเข้ามาร่วมสั่งได้เลย' })
    }
  }

  /* ── Empty Cart View ── */
  if (items.length === 0) {
    return (
      <div
        className="min-h-screen safe-area-pt pb-28 flex flex-col relative"
        style={{ background: 'var(--bg-base)' }}
      >
        <Container className="py-4 relative z-10 flex-1 flex flex-col px-4">
          <div className="flex items-center justify-between pt-1">
            <motion.button
              type="button"
              aria-label="ย้อนกลับ"
              whileTap={{ scale: 0.9 }}
              onClick={() => { hapticLight(); navigate(-1) }}
              className="w-11 h-11 rounded-[18px] flex items-center justify-center cursor-pointer shadow-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" aria-hidden="true" />
            </motion.button>
            <h1 className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>ตะกร้าสินค้า</h1>
            <div className="w-11" />
          </div>

          <div className="flex-1 flex items-center justify-center my-auto">
            <EmptyState type="cart" onAction={() => navigate('/')} />
          </div>
        </Container>
      </div>
    )
  }

  /* ── Cart Has Items View ── */
  return (
    <div
      className="min-h-screen safe-area-pt pb-52 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-16 w-[380px] h-[380px] rounded-full animate-glow-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255,85,0,0.10) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-1/2 -left-20 w-[240px] h-[240px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,140,66,0.05) 0%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
      </div>

      <Container className="py-4 relative z-10 space-y-4 max-w-2xl mx-auto px-4">

        {/* ── Premium Navigation Header ── */}
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
            <h1 className="text-[17px] font-black tracking-tight flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <ShoppingBag className="w-4.5 h-4.5" style={{ color: 'var(--brand)' }} />
              <span>ตะกร้าสินค้า</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] mt-0.5" style={{ color: 'var(--brand)' }}>
              {totalQty} รายการ • {formatPrice(subtotal)}
            </p>
          </div>

          <motion.button
            type="button"
            aria-label="ล้างตะกร้า"
            whileTap={{ scale: 0.88 }}
            onClick={() => { hapticMedium(); setShowClearConfirm(true) }}
            className="w-11 h-11 rounded-[18px] flex items-center justify-center cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.18)',
            }}
          >
            <Trash2 className="w-4.5 h-4.5 text-red-500" aria-hidden="true" />
          </motion.button>
        </div>

        {/* ── Collaborative Party Cart Banner ── */}
        <AnimatePresence>
          {collabCart.isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 rounded-[22px] relative overflow-hidden shine-sweep"
                style={{
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(14,165,233,0.04))',
                  border: '1px solid rgba(56,189,248,0.20)',
                }}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <CollaborativeCartBadge count={collabCart.connectedUsers.length} />
                    <div>
                      <p className="font-black text-xs" style={{ color: 'var(--text-primary)' }}>ปาร์ตี้ตะกร้ากลุ่ม</p>
                      <div className="flex items-center -space-x-2 mt-1">
                        {collabCart.connectedUsers.map((u: any, i: number) => (
                          <motion.div
                            key={u.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="border-2 rounded-full"
                            style={{ borderColor: 'var(--bg-card)' }}
                          >
                            <UserAvatar user={u} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleShareCart}
                    className="bg-white/80 hover:bg-white text-sky-700 font-black text-xs px-4 py-2 rounded-full border border-sky-500/20 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    แชร์ลิงก์
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-4">

          {/* ── Items List Card ── */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: '0 2px 14px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Card Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand-border)' }}
                >
                  <Flame className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
                </div>
                <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>รายการสั่งอาหาร</h2>
              </div>
              <span className="badge-brand">{items.length} เมนู</span>
            </div>

            {/* Items */}
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {items.map((item: CartItem, idx: number) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: idx * 0.04 } }}
                    exit={{ opacity: 0, x: -60, scale: 0.9, height: 0 }}
                    className="flex gap-3.5 p-3.5 rounded-[20px] relative overflow-hidden"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {/* Food Image */}
                    <div className="relative w-[76px] h-[76px] flex-shrink-0 rounded-[16px] overflow-hidden bg-slate-100">
                      <img
                        src={getValidImageUrl(item.menuItem.imageUrl)}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Quantity badge on image */}
                      <motion.div
                        key={item.quantity}
                        initial={{ scale: 1.4 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                          boxShadow: '0 2px 8px rgba(255,85,0,0.4)',
                        }}
                      >
                        {item.quantity}
                      </motion.div>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-black text-sm leading-snug line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                            {item.menuItem.name}
                          </h3>
                          <span className="font-black text-sm text-gradient-fire flex-shrink-0 num-display">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>

                        {/* Options */}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.selectedOptions.map((o: SelectedOption) => (
                              <span
                                key={o.optionId}
                                className="text-[9.5px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  background: '#FFFFFF',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border-soft)',
                                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                                }}
                              >
                                {o.name}{o.price > 0 ? ` +฿${o.price}` : ''}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Note */}
                        {item.note && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Info className="w-3 h-3 flex-shrink-0 text-amber-500" />
                            <span className="text-[9.5px] font-medium text-amber-600 truncate italic">
                              "{item.note}"
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                          ฿{item.menuItem.price} / จาน
                        </span>

                        <div
                          className="flex items-center gap-1.5 px-1 py-1 rounded-full"
                          style={{ background: '#FFFFFF', border: '1px solid var(--border-soft)', boxShadow: '0 1px 4px rgba(15, 23, 42, 0.05)' }}
                        >
                          <motion.button
                            whileTap={{ scale: 0.75 }}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label="ลดจำนวน"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </motion.button>

                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="w-6 text-center font-black text-sm num-display"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {item.quantity}
                          </motion.span>

                          <motion.button
                            whileTap={{ scale: 0.75 }}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                            style={{ color: 'var(--brand)' }}
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

            {/* Smart Upsell */}
            {!isGuest && (
              <div className="px-4 pb-4">
                <SmartUpsell />
              </div>
            )}
          </motion.div>

          {/* ── Delivery Method ── */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: '0 2px 14px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,85,0,0.10)', border: '1px solid rgba(255,85,0,0.20)' }}
              >
                <Truck className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              </div>
              <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>วิธีรับอาหาร</h2>
            </div>

            <div
              className="flex p-1 rounded-[20px] relative"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              {(['workplace', 'village'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => { setDeliveryMethod(method); hapticLight() }}
                  className={cn(
                    'flex-1 py-3 rounded-[16px] font-black text-xs flex items-center justify-center gap-2 relative z-10 transition-colors cursor-pointer',
                    deliveryMethod === method ? 'text-white' : 'text-slate-600'
                  )}
                >
                  {method === 'workplace' ? <MapPin className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                  {method === 'workplace' ? 'รับที่ทำงาน' : 'ส่งหมู่บ้าน'}
                </button>
              ))}

              <motion.div
                initial={false}
                animate={{ x: deliveryMethod === 'workplace' ? '0%' : '100%' }}
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[16px] z-0"
                style={{
                  background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                  boxShadow: '0 4px 16px rgba(255,85,0,0.30)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            </div>
          </motion.div>

          {/* ── Coupons & Points ── */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: '0 2px 14px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.20)' }}
                >
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>ส่วนลด & สิทธิพิเศษ</h2>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  hapticLight()
                  setShowCouponWallet(true)
                }}
                className="px-3 py-1 rounded-full text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer flex items-center gap-1"
              >
                <span>🎟️ เลือกคูปอง</span>
              </motion.button>
            </div>

            <CouponInput
              orderTotal={subtotal}
              menuItemIds={items.map((i: CartItem) => i.menuItem.id)}
              appliedCoupon={couponCode ? { couponId: 1, discount: discountAmount, code: couponCode, name: couponCode } : null}
              onApply={(res: { code: string; discount: number }) => applyCoupon(res.code, res.discount)}
              onRemove={() => removeCoupon()}
            />

            {!isGuest && user && maxPoints >= 10 && (
              <div
                className="p-4 rounded-[18px]"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.22)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-amber-700 text-xs">ใช้พอยต์สะสมลดเพิ่ม</p>
                    <p className="text-[10px] font-medium mt-0.5 text-slate-500">
                      10 pts = ฿10 ลด • คุณมี {user.points} pts
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      hapticMedium()
                      setPointsUsed(pointsUsed > 0 ? 0 : Math.min(maxPoints, 50))
                    }}
                    className={cn(
                      'px-4 py-2 rounded-full font-black text-xs transition-all cursor-pointer',
                      pointsUsed > 0
                        ? 'text-white'
                        : 'text-amber-700'
                    )}
                    style={pointsUsed > 0
                      ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }
                      : { background: '#FFFFFF', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }
                    }
                  >
                    {pointsUsed > 0 ? `✓ ใช้ ${pointsUsed} pts` : 'ใช้พอยต์'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* ── Order Summary ── */}
          <motion.div
            variants={slideUpItem}
            className="rounded-[28px] p-5 space-y-3"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: '0 2px 14px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                สรุปยอดรวม
              </h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                <span>ราคารวมสินค้า ({totalQty} รายการ)</span>
                <span className="num-display" style={{ color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-between text-xs font-bold text-emerald-600"
                >
                  <span>ส่วนลดคูปอง ({couponCode})</span>
                  <span className="num-display">-{formatPrice(discountAmount)}</span>
                </motion.div>
              )}

              {pointsUsed > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-between text-xs font-bold text-amber-600"
                >
                  <span>ส่วนลดพอยต์ ({pointsUsed} pts)</span>
                  <span className="num-display">-{formatPrice(pointsDiscount)}</span>
                </motion.div>
              )}

              <div
                className="pt-3 flex justify-between items-center"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>ยอดชำระสุทธิ</span>
                <motion.span
                  key={finalTotal}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black text-gradient-fire num-display"
                >
                  {formatPrice(finalTotal)}
                </motion.span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </Container>

      {/* ── Floating Checkout Bar (Above BottomNav) ── */}
      <div className="fixed bottom-[84px] left-0 right-0 z-40 px-4 py-2 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 28 }}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-[26px]"
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(36px) saturate(180%)',
              WebkitBackdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255, 85, 0, 0.20)',
              boxShadow: '0 16px 40px -6px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                ยอดรวม
              </p>
              <p className="text-xl font-black text-gradient-fire leading-none mt-0.5 num-display">
                {formatPrice(finalTotal)}
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { hapticHeavy(); navigate('/checkout') }}
              className="flex-1 max-w-[180px] h-[48px] btn-brand rounded-[18px] font-black text-sm flex items-center justify-center gap-2 cursor-pointer text-white"
            >
              <span>ชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Clear Cart Confirm Modal ── */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/60"
              style={{ backdropFilter: 'blur(16px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="rounded-[32px] w-full max-w-sm p-6 relative z-10 text-center"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(239,68,68,0.20)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.20)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.20)',
                }}
              >
                <AlertCircle className="w-8 h-8 text-red-500" />
              </motion.div>
              <h3 className="font-black text-lg mb-1.5" style={{ color: 'var(--text-primary)' }}>ล้างรายการในตะกร้า?</h3>
              <p className="text-xs font-medium mb-6" style={{ color: 'var(--text-secondary)' }}>
                รายการอาหารทั้งหมด {totalQty} รายการจะถูกลบออก
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="py-3 rounded-[18px] font-bold text-sm cursor-pointer transition-colors"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  ยกเลิก
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmClearCart}
                  className="py-3 rounded-[18px] font-bold text-sm text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    boxShadow: '0 6px 20px rgba(239,68,68,0.30)',
                  }}
                >
                  ยืนยันล้างตะกร้า
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupon Wallet Selector Modal */}
      <CouponWalletModal
        isOpen={showCouponWallet}
        onClose={() => setShowCouponWallet(false)}
      />
    </div>
  )
}
