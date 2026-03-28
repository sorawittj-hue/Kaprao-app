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
  ChevronRight,
  ShieldCheck,
  Ban
} from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/feedback/EmptyState'
import { SmartUpsell } from '@/features/cart/components/SmartUpsell'
import { formatPrice } from '@/utils/formatPrice'
import { trackPageView, trackBeginCheckout } from '@/lib/analytics'
import { cn } from '@/utils/cn'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { useCollaborativeCart, CollaborativeCartBadge, UserAvatar } from '@/features/collaboration/CollaborativeCart'
import { useSEO } from '@/hooks/useSEO'

// Premium Animation Variants
const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
}

const slideUpItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
}

export default function CartPage() {
  const navigate = useNavigate()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const {
    items,
    finalTotal,
    subtotal,
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
    trackPageView('/cart', 'Cart')
    window.scrollTo(0, 0)
    if (items.length > 0) trackBeginCheckout(items as any, finalTotal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSEO({
    title: 'ตะกร้าสินค้าแบบพรีเมียม',
    description: 'ตรวจสอบรายการอาหารในตะกร้าของคุณ พร้อมสั่งกะเพรารสเด็ดที่ กะเพรา 52'
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const joinId = urlParams.get('join')
    if (joinId && user && !collabCart.isConnected) {
      collabCart.joinCart(joinId).then((success) => {
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
      const item = items.find(i => i.id === itemId)
      if (item) removeItem(itemId)
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] safe-area-pt flex flex-col">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none z-0" />
        <Container className="py-4 relative z-10 flex-1 flex flex-col px-6">
          <motion.button whileHover={{ x: -4 }} onClick={() => { hapticLight(); navigate(-1) }} className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-lg flex items-center justify-center text-gray-800 shadow-sm border border-black/5 self-start">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1 flex items-center justify-center">
             <EmptyState type="cart" onAction={() => navigate('/')} />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] safe-area-pt pb-48 relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none z-0" />

      <Container className="py-4 relative z-10 space-y-6 max-w-2xl mx-auto">
        {/* Apple-style Navigation */}
        <div className="flex items-center justify-between sticky top-4 z-50">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticLight(); navigate(-1) }} className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-2xl flex items-center justify-center text-gray-800 shadow-xl shadow-gray-200/50 border border-white/60">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">ตะกร้าสินค้า</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {items.reduce((sum, i) => sum + i.quantity, 0)} Items
            </p>
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { hapticMedium(); setShowClearConfirm(true) }} className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-2xl flex items-center justify-center text-red-500 shadow-xl shadow-gray-200/50 border border-white/60">
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Collaborative Info Panel (Glassmorphism) */}
        <AnimatePresence>
        {collabCart.isConnected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-3xl border border-gray-100 bg-white shadow-sm relative group mb-6">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                     <CollaborativeCartBadge count={collabCart.connectedUsers.length} />
                  </div>
                  <div>
                     <p className="font-black text-gray-800 text-sm">ปาร์ตี้ตะกร้ากลุ่ม</p>
                     <div className="flex items-center -space-x-2 mt-1.5">
                      {collabCart.connectedUsers.map((u, i) => (
                        <motion.div key={u.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="border-[2px] border-white rounded-full shadow-sm">
                          <UserAvatar user={u} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleShareCart} className="bg-gray-50 hover:bg-gray-100 text-gray-900 shadow-sm font-black text-xs px-5 py-2.5 rounded-2xl active:scale-95 transition-transform border border-gray-200">
                  แชร์ลิงก์
                </button>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        <motion.div variants={staggerList} initial="hidden" animate="visible" className="space-y-6">
          
          {/* Main List */}
          <motion.div variants={slideUpItem} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 shadow-sm border border-white">
            <div className="px-6 py-5 border-b border-gray-100/50">
               <h2 className="font-black text-gray-800 flex items-center gap-2.5">
                 <div className="w-2 h-2 rounded-full bg-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.5)]" /> อาหารที่เลือกไว้
               </h2>
            </div>
            
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100, height: 0 }} className="p-4 group">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img src={getValidImageUrl(item.menuItem.imageUrl)} alt={item.menuItem.name} className="w-full h-full object-cover rounded-[20px] shadow-sm transform group-hover:scale-105 transition-transform duration-500 bg-gray-100" />
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-[11px] font-black text-gray-700">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-gray-900 text-[17px] leading-tight flex-1 pr-2 line-clamp-2">{item.menuItem.name}</h3>
                          <span className="font-black text-lg text-[#FF6B00] tracking-tight">{formatPrice(item.subtotal)}</span>
                        </div>

                        {item.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.selectedOptions.map(o => (
                              <span key={o.optionId} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg border border-gray-200/50 truncate max-w-full">
                                {o.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          {item.note ? (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100/50 max-w-[120px]">
                              <Info className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium truncate">{item.note}</span>
                            </div>
                          ) : <div/>}

                          <div className="flex items-center bg-[#F4F4F5] rounded-2xl p-1 border border-black/5">
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-xl shadow-sm border border-black/5">
                              <Minus className="w-4 h-4" strokeWidth={2.5} />
                            </motion.button>
                            <span className="w-10 text-center font-black text-[15px] text-gray-800">{item.quantity}</span>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-[#FF6B00] bg-white rounded-xl shadow-sm border border-black/5">
                              <Plus className="w-4 h-4" strokeWidth={2.5} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {!isGuest && (
              <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100/50 rounded-b-[24px]">
                 <SmartUpsell />
              </div>
            )}
          </motion.div>

          {/* Delivery Method (Tabs approach) */}
          <motion.div variants={slideUpItem} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white">
             <div className="flex items-center gap-2 mb-4">
                 <Truck className="w-5 h-5 text-gray-800" />
                 <h2 className="font-black text-gray-800">วิธีกดรับ/จัดส่ง</h2>
             </div>
             <div className="flex bg-[#F4F4F5] p-1.5 rounded-3xl relative">
                <button
                  onClick={() => { setDeliveryMethod('workplace'); hapticLight(); }}
                  className={cn("flex-1 py-3.5 rounded-[22px] font-black text-sm flex items-center justify-center gap-2 relative z-10 transition-colors", deliveryMethod === 'workplace' ? "text-gray-900" : "text-gray-400")}
                >
                  <MapPin className="w-4 h-4" /> ที่ทำงาน
                </button>
                <button
                  onClick={() => { setDeliveryMethod('village'); hapticLight(); }}
                  className={cn("flex-1 py-3.5 rounded-[22px] font-black text-sm flex items-center justify-center gap-2 relative z-10 transition-colors", deliveryMethod === 'village' ? "text-gray-900" : "text-gray-400")}
                >
                  <Truck className="w-4 h-4" /> ส่งหมู่บ้าน
                </button>
                
                {/* Active Tab Background Pill */}
                <motion.div 
                  initial={false}
                  animate={{ x: deliveryMethod === 'workplace' ? '0%' : '100%' }}
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[22px] shadow-sm border border-black/5 z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
             </div>
          </motion.div>

          {/* Points & Coupons */}
          <motion.div variants={slideUpItem} className="grid grid-cols-2 gap-4">
            {!isGuest && user ? (
              <div className="bg-amber-50 p-5 rounded-[32px] border border-amber-100 relative overflow-hidden flex flex-col justify-between shadow-sm">
                 <div className="relative z-10">
                    <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
                    <h3 className="font-black text-gray-900 text-base leading-tight mb-1">สะสมพอยต์</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">มี {user.points} pts</p>
                 </div>
                 <div className="mt-4 relative z-10">
                    <button 
                      onClick={() => { hapticMedium(); useCartStore.getState().setPointsUsed(pointsUsed > 0 ? 0 : Math.min(user.points, 50)); }}
                      className={cn("w-full py-3 rounded-2xl font-black text-[11px] transition-all", pointsUsed > 0 ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "bg-white text-gray-900 border border-amber-200 hover:bg-amber-100")}
                    >
                      {pointsUsed > 0 ? `ยกเลิก (-฿${pointsUsed/10})` : 'ใช้พอยต์ลดเลย!'}
                    </button>
                 </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-5 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                 <ShieldCheck className="w-6 h-6 text-gray-400 mb-2" />
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Login for Points</p>
                 <button onClick={() => navigate('/profile')} className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-gray-200 shadow-sm">Login LINE</button>
              </div>
            )}

            <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
               <div>
                  <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center mb-3">
                     <Tag className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <h3 className="font-black text-gray-900 text-base mb-1">คูปองส่วนลด</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">เพิ่มโค้ดลดราคา</p>
               </div>
               <div className="mt-4 flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <input type="text" placeholder="CODE" className="w-full bg-transparent text-sm font-black px-2 uppercase outline-none placeholder:text-gray-300 min-w-0" />
                  <button className="bg-gray-900 text-white w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>

        </motion.div>
      </Container>

      {/* Floating Complete Checkout Action (Sticky at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] safe-area-pb">
        <div className="absolute inset-x-0 bottom-0 h-full bg-white/70 backdrop-blur-3xl border-t border-white shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.1)] -z-10" />
        <Container className="py-5 max-w-2xl mx-auto flex items-center gap-4">
           <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">ยอดชำระสุทธิ</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-black text-[#FF6B00] tracking-tighter leading-none m-0 p-0 drop-shadow-sm">{formatPrice(finalTotal)}</p>
                 {subtotal > finalTotal && <p className="text-sm font-bold text-gray-300 line-through m-0 p-0">{formatPrice(subtotal)}</p>}
              </div>
           </div>
           
           <motion.button
             whileTap={{ scale: 0.96 }}
             onClick={() => { hapticHeavy(); navigate('/checkout'); }}
             className="h-16 px-8 bg-gray-900 rounded-[24px] shadow-xl shadow-gray-900/20 flex items-center gap-3 relative overflow-hidden group border border-gray-800"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             <span className="font-black text-white text-lg relative z-10 tracking-tight">ชำระเงิน</span>
             <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center relative z-10 backdrop-blur-md border border-white/5">
                <ChevronRight className="w-5 h-5 text-white" />
             </div>
           </motion.button>
        </Container>
      </div>

      {/* Modal Clear Confirm */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
            <motion.div initial={{ opacity: 0, y: 300 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 300 }} className="bg-white rounded-[36px] w-full max-w-sm mx-auto p-8 relative z-10 shadow-2xl mb-8 safe-area-pb">
              <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
                <Ban className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 text-center">แน่ใจนะ?</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed px-4 text-center mb-8">
                ประวัติการสั่งอาหารในตะกร้าทั้งหมดจะหายไป คุณสามารถเพิ่มใหม่ได้ทีหลัง
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmClearCart} className="w-full py-4 bg-red-500 text-white rounded-[24px] font-black text-lg active:scale-95 transition-transform shadow-lg shadow-red-500/30">
                  ล้างตะกร้า
                </button>
                <button onClick={() => setShowClearConfirm(false)} className="w-full py-4 bg-gray-50 text-gray-900 rounded-[24px] font-black text-lg active:scale-95 transition-transform hover:bg-gray-100">
                  ยกเลิกก่อน
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
