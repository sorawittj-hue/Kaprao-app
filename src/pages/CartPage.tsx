import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Truck,
  Trash2,
  Plus,
  Minus,
  Tag,
  Sparkles,
  Info,
  Gift,
  ChevronRight
} from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { SmartUpsell } from '@/features/cart/components/SmartUpsell'
import { formatPrice } from '@/utils/formatPrice'
import { scaleIn } from '@/animations/variants'
import { trackPageView, trackBeginCheckout } from '@/lib/analytics'
import { cn } from '@/utils/cn'
import { hapticLight, hapticMedium } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { useCollaborativeCart, ShareCartButton, CollaborativeCartBadge, UserAvatar } from '@/features/collaboration/CollaborativeCart'
import { useSEO } from '@/hooks/useSEO'
import { usePointsCalculator } from '@/features/points/hooks/usePoints'

export default function CartPage() {
  const navigate = useNavigate()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const {
    items,
    finalTotal,
    subtotal,
    discountAmount,
    pointsUsed,
    deliveryMethod,
    setDeliveryMethod,
    updateQuantity,
    removeItem,
    clearCart
  } = useCartStore()
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const collabCart = useCollaborativeCart()

  useEffect(() => {
    console.log('📄 CartPage mounted, items:', items.length)
    trackPageView('/cart', 'Cart')
    if (items.length > 0) {
      trackBeginCheckout(items as any, finalTotal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSEO({
    title: 'ตะกร้าสินค้า',
    description: 'ตรวจสอบรายการอาหารในตะกร้าของคุณ พร้อมสั่งกะเพรารสเด็ดที่ กะเพรา 52'
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const joinId = urlParams.get('join')
    if (joinId && user && !collabCart.isConnected) {
      console.log('🔗 Joining collaborative cart:', joinId)
      collabCart.joinCart(joinId).then((success) => {
        if (success) {
          addToast({ type: 'success', title: 'เข้าร่วมตะกร้ากลุ่มแล้ว' })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, collabCart.isConnected])

  const handleShareCart = async () => {
    if (!user || isGuest) {
      addToast({ type: 'error', title: 'ไม่สามารถแชร์ได้', message: 'กรุณาเข้าสู่ระบบก่อน' })
      return
    }
    let cartId = collabCart.cart?.id
    if (!cartId) {
      cartId = (await collabCart.createCart()) || undefined
    }
    if (cartId) {
      const link = `${window.location.origin}/cart?join=${cartId}`
      navigator.clipboard.writeText(link)
      addToast({ type: 'success', title: 'คัดลอกลิงก์แชร์ตะกร้าแล้ว' })
    }
  }

  const handleRemoveItem = (itemId: string, itemName: string) => {
    console.log('🗑️ Removing item:', itemName)
    hapticMedium()
    removeItem(itemId)
    addToast({
      type: 'info',
      title: 'ลบรายการแล้ว',
      message: itemName,
    })
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    hapticLight()
    if (newQuantity <= 0) {
      const item = items.find(i => i.id === itemId)
      if (item) {
        handleRemoveItem(itemId, item.menuItem.name)
      }
    } else {
      console.log('📝 Updating quantity:', itemId, '→', newQuantity)
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleClearCart = () => {
    setShowClearConfirm(true)
  }

  const confirmClearCart = () => {
    console.log('🧹 Clearing cart')
    hapticMedium()
    clearCart()
    setShowClearConfirm(false)
    addToast({
      type: 'info',
      title: 'ล้างตะกร้าแล้ว',
    })
  }

  const handleCheckout = () => {
    console.log('💳 Proceeding to checkout')
    navigate('/checkout')
  }

  // Calculate points progress
  const { getNextTier } = usePointsCalculator()
  const pointsToEarn = Math.floor(finalTotal / 10)
  const userPoints = user?.points || 0
  const nextTier = getNextTier(userPoints)
  const nextTierProgress = nextTier
    ? Math.min(100, Math.round((userPoints / (userPoints + nextTier.pointsNeeded)) * 100))
    : 100

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface safe-area-pt">
        <Container className="py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 mb-8 active:scale-95 transition-transform group"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold">กลับหน้าหลัก</span>
          </button>

          <EmptyState
            type="cart"
            onAction={() => navigate('/')}
          />
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface safe-area-pt pb-40">
      <Container className="py-6">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-[14px] bg-white shadow-card flex items-center justify-center text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">ตะกร้าสินค้า</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Kaprao 52 · {items.reduce((sum, i) => sum + i.quantity, 0)} รายการ
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {!collabCart.isConnected && items.length > 0 && (
              <ShareCartButton onClick={handleShareCart} />
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClearCart}
              className="w-11 h-11 rounded-[14px] bg-red-50 text-red-500 flex items-center justify-center transition-colors border border-red-100"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Collaborative Info Panel */}
        {collabCart.isConnected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl border-2 border-brand-100 bg-white/50 backdrop-blur-md shadow-sm overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <CollaborativeCartBadge count={collabCart.connectedUsers.length} />
                </div>
                <div>
                   <p className="font-black text-gray-800 text-sm">ตะกร้ากลุ่มกับเพื่อน</p>
                   <div className="flex items-center -space-x-2 mt-1">
                    {collabCart.connectedUsers.map(u => (
                      <div key={u.id} className="border-2 border-white rounded-full">
                        <UserAvatar user={u} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareCart}
                className="bg-white/80 border-brand-200 text-brand-600 font-black h-9 px-4 rounded-xl"
              >
                คัดลอกลิงก์
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Cart Items List */}
            <Card className="overflow-hidden border-none shadow-card">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <h2 className="font-black text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  รายการสั่งซื้อ
                </h2>
              </div>
              <div className="bg-white">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, x: -100 }}
                      className="group"
                    >
                      <div className="p-5 border-b border-gray-50 flex gap-4 last:border-none">
                        <div className="relative group/img">
                          <img
                            src={getValidImageUrl(item.menuItem.imageUrl)}
                            alt={item.menuItem.name}
                            className="w-24 h-24 rounded-2xl object-cover bg-gray-50 shadow-sm transition-transform group-active:scale-95 group-hover/img:scale-105"
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-md flex items-center justify-center text-[10px] font-black text-brand-600 border border-brand-50">
                            x{item.quantity}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-black text-gray-800 text-base leading-tight line-clamp-1">
                                {item.menuItem.name}
                              </h3>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => handleRemoveItem(item.id, item.menuItem.name)}
                                className="text-gray-300 hover:text-red-500 transition-colors mt-0.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>

                            {/* Options with Pill Style */}
                            {item.selectedOptions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.selectedOptions.map(o => (
                                  <span key={o.optionId} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {o.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.note && (
                              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50">
                                <Info className="w-3 h-3" />
                                <span className="font-medium truncate">{item.note}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                             {/* Advanced Quantity Control */}
                            <div className="flex items-center bg-gray-100 rounded-[14px] p-1 border border-gray-200/50 shadow-inner">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-600 transition-colors bg-white rounded-lg shadow-sm"
                              >
                                <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                              </motion.button>
                              <span className="w-9 text-center font-black text-sm text-gray-800">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-600 transition-colors bg-white rounded-lg shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                              </motion.button>
                            </div>

                            <span className="font-black text-lg text-brand-600 tracking-tight">
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>

            {/* Premium Delivery Selection */}
            <Card className="border-none shadow-card bg-white p-5 overflow-hidden relative">
               <div className="flex items-center gap-2 mb-4">
                 <Truck className="w-5 h-5 text-gray-800" />
                 <h2 className="font-black text-gray-800">เลือกวิธีกดรับ/จัดส่ง</h2>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setDeliveryMethod('workplace')
                      hapticLight()
                    }}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-[0.98]',
                      deliveryMethod === 'workplace'
                        ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                        : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                    )}
                  >
                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm',
                      deliveryMethod === 'workplace' ? 'bg-brand-500 text-white shadow-brand-300' : 'bg-gray-50 text-gray-400'
                    )}>
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className={cn('font-black text-sm', deliveryMethod === 'workplace' ? 'text-brand-700' : 'text-gray-500')}>ที่ทำงาน</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Workplace</p>
                    </div>
                    {deliveryMethod === 'workplace' && (
                      <motion.div layoutId="selection" className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setDeliveryMethod('village')
                      hapticLight()
                    }}
                    className={cn(
                      'relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-[0.98]',
                      deliveryMethod === 'village'
                        ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                        : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                    )}
                  >
                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm',
                      deliveryMethod === 'village' ? 'bg-brand-500 text-white shadow-brand-300' : 'bg-gray-50 text-gray-400'
                    )}>
                      <Truck className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className={cn('font-black text-sm', deliveryMethod === 'village' ? 'text-brand-700' : 'text-gray-500')}>หมู่บ้าน</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Delivery</p>
                    </div>
                    {deliveryMethod === 'village' && (
                      <motion.div layoutId="selection" className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </button>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Gamified Points Redemption */}
            {!isGuest && user && (
              <Card className="border-none shadow-card bg-gradient-to-br from-[#1C1917] to-[#44403C] p-5 relative overflow-hidden group">
                {/* Decorative glow */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-white text-base leading-none">แต้มสุดคุ้ม</h2>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">คุณมี {user.points.toLocaleString()} พอยต์</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-[11px] text-gray-300 mb-3 font-medium">ใช้ 10 พอยต์ = ลด 1 บาท</p>
                    <div className="grid grid-cols-2 gap-2">
                       {[50, 100, 200, 500].map((pts) => (
                        <button
                          key={pts}
                          disabled={user.points < pts}
                          onClick={() => {
                            hapticLight()
                            useCartStore.getState().setPointsUsed(pointsUsed === pts ? 0 : pts)
                          }}
                          className={cn(
                            'py-2 px-1 rounded-xl text-[11px] font-black transition-all flex flex-col items-center',
                            pointsUsed === pts
                              ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20'
                              : user.points >= pts
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-white/5 text-gray-600 opacity-40 grayscale cursor-not-allowed'
                          )}
                        >
                          {pts} <span className="text-[8px] opacity-70">pts</span>
                        </button>
                       ))}
                    </div>
                    
                    {pointsUsed > 0 && (
                      <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => useCartStore.getState().setPointsUsed(0)}
                        className="w-full mt-3 text-[10px] text-brand-400 font-black uppercase text-center"
                      >
                         ยกเลิกการใช้แต้ม
                      </motion.button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Smart Coupon Selection */}
            <Card className="border-none shadow-card bg-white p-5">
              <h2 className="font-black text-gray-800 text-sm flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-brand-500" />
                คูปองส่วนลด
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="รหัสคูปอง"
                  className="flex-1 bg-gray-50 border-2 border-transparent h-11 px-4 rounded-xl text-sm font-bold focus:border-brand-200 outline-none transition-all uppercase placeholder:text-gray-300"
                />
                <Button variant="outline" size="sm" className="h-11 px-6 font-black rounded-xl">
                  ตกลง
                </Button>
              </div>
            </Card>

            {/* Premium Summary Card */}
            <Card className="border-none shadow-xl bg-white p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16" />
               
               <h2 className="font-black text-gray-800 text-lg mb-6 relative">สรุปยอดชำระ</h2>
               
               <div className="space-y-4 relative">
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 text-sm font-bold group-hover:text-gray-600 transition-colors">ยอดรวมสินค้า</span>
                    <span className="font-bold text-gray-800">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm font-bold">ส่วนลดคูปอง</span>
                        <span className="font-black text-green-500">-{formatPrice(discountAmount)}</span>
                      </div>
                  )}

                  {pointsUsed > 0 && (
                      <div className="flex justify-between items-center scale-up-center">
                        <span className="text-gray-400 text-sm font-bold flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5" />
                          ส่วนลดจากพอยต์
                        </span>
                        <span className="font-black text-amber-500">-{formatPrice(pointsUsed / 10)}</span>
                      </div>
                  )}

                  <div className="pt-4 border-t-2 border-dashed border-gray-100">
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-gray-800 font-black text-lg">ยอดสุทธิ</span>
                       <span className="text-2xl font-black text-brand-600 tracking-tighter">
                          {formatPrice(finalTotal)}
                       </span>
                    </div>
                  </div>

                  {pointsToEarn > 0 && !isGuest && (
                    <motion.div 
                      variants={scaleIn}
                      className="bg-brand-50 rounded-2xl p-4 flex items-center justify-between"
                    >
                       <div>
                         <p className="text-[11px] font-black text-brand-600 uppercase tracking-tight">คุณจะได้รับ</p>
                         <p className="text-base font-black text-brand-700">{pointsToEarn} <span className="text-xs">พอยต์</span></p>
                       </div>
                       <div className="w-12 h-12 rounded-full overflow-hidden bg-white/50 relative p-1">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="18" fill="transparent" stroke="#E2E8F0" strokeWidth="3" />
                            <motion.circle 
                              cx="20" cy="20" r="18" fill="transparent" stroke="#FF6B00" strokeWidth="3"
                              strokeDasharray="113"
                              initial={{ strokeDashoffset: 113 }}
                              animate={{ strokeDashoffset: 113 - (113 * nextTierProgress) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-600">
                            {nextTierProgress}%
                          </div>
                       </div>
                    </motion.div>
                  )}
               </div>
            </Card>
          </div>
        </div>

        {/* Dynamic Recommendation Section */}
        <div className="mt-12">
           <SmartUpsell />
        </div>
      </Container>

      {/* Floating Modern Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-[50] safe-area-pb">
         <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-t border-white/20 shadow-[0_-12px_44px_-10px_rgba(0,0,0,0.1)]" />
         
         <Container className="relative">
            <div className="flex items-center justify-between mb-4 lg:hidden">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Price</p>
                  <p className="text-xl font-black text-gray-900">{formatPrice(finalTotal)}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Earn Points</p>
                  <p className="text-sm font-black text-gray-700">+{pointsToEarn} pts</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                fullWidth
                onClick={handleCheckout}
                className="h-14 rounded-2xl text-lg font-black shadow-brand active:scale-[0.98] transition-transform flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                ดำเนินการสั่งซื้อ
                <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Button>
              
              {isGuest && (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full py-2 flex items-center justify-center gap-2 group sm:hidden"
                >
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-orange-600 uppercase tracking-tight group-hover:underline">
                    Login LINE เพื่อรับสิทธิพิเศษ
                  </span>
                </button>
              )}
            </div>
         </Container>
      </div>

      {/* Modern Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">ล้างตะกร้า?</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed px-4">
                  อาหารที่เลือกไว้จะหายไปนะ คุณแน่ใจว่าจะล้างตะกร้าทั้งหมดใช่ไหม?
                </p>
              </div>
              <div className="flex flex-col gap-3 mt-8">
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={confirmClearCart}
                  className="h-14 rounded-2xl font-black"
                >
                  ใช่ ล้างเลย
                </Button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full py-3 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
