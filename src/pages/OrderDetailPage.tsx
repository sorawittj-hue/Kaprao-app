import { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, MessageCircle, Star } from 'lucide-react'
import { useOrderDetail, useOrderRealtime } from '@/features/orders/hooks/useOrders'
import { useAuthStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LiveOrderTracker } from '@/features/orders/components/LiveOrderTracker'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'
import { staggerContainer, fadeInUp } from '@/animations/variants'
import { trackPageView } from '@/lib/analytics'
import { savePendingGuestOrder } from '@/lib/auth'
import { usePointsCalculator } from '@/features/points/hooks/usePoints'
import { useContactInfo } from '@/features/config/hooks/useShopConfig'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'

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
  useOrderRealtime(orderId)

  useEffect(() => {
    trackPageView(`/orders/${orderId}`, 'Order Detail')
  }, [orderId])

  const handleCallShop = () => {
    if (contactInfo?.phone) {
      window.location.href = `tel:${contactInfo.phone}`
    }
  }

  const handleChatShop = () => {
    if (contactInfo?.line_id) {
      window.open(`https://line.me/R/ti/p/${contactInfo.line_id}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAF9' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 rounded-full"
          style={{ borderColor: '#FF6B00 transparent transparent transparent' }}
        />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen safe-area-pt" style={{ background: '#FAFAF9' }}>
        <Container className="py-6">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-black text-gray-800 text-xl mb-2">ไม่พบออเดอร์นี้</h2>
            <p className="text-gray-500 text-sm mb-6">
              อาจถูกลบหรือ ID ผิด กรุณาตรวจสอบอีกครั้ง
            </p>
            <Button onClick={() => navigate('/orders')}>
              ดูรายการออเดอร์
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  const pointsMissed = calculateEarned(order.totalPrice)
  const ticketsMissed = Math.floor(order.totalPrice / 100)
  const effectiveToken = trackingTokenFromUrl || order.trackingToken

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FAFAF9' }}>
      <Container className="py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-600"
            style={{ boxShadow: '0 2px 10px -2px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-black text-gray-800">รายละเอียดออเดอร์</h1>
            <p className="text-sm text-gray-400">#{order.id}</p>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Live Order Tracking */}
          <motion.div variants={fadeInUp}>
            <LiveOrderTracker
              orderId={order.id}
              initialStatus={order.status}
              estimatedReadyTime={order.estimatedReadyTime}
            />
          </motion.div>

          {/* 🌟 Guest Conversion Panel — shown when viewing as guest */}
          {isGuest && pointsMissed > 0 && (
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                boxShadow: '0 12px 32px -6px rgba(0,0,0,0.3)',
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    🌟
                  </motion.div>
                  <div>
                    <h3 className="font-black text-white text-base leading-tight">
                      ออเดอร์นี้มีพอยต์รออยู่!
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                      Login LINE แล้วพอยต์จาก Order #{order.id} จะโอนเข้ากระเป๋าทันที
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xl font-black text-yellow-400">{pointsMissed}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">⭐ พอยต์</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xl font-black text-purple-400">{ticketsMissed}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">🎟️ ตั๋วหวย</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xl font-black text-green-400">+{Math.round(pointsMissed / 10)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">💰 บาท</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    if (effectiveToken) {
                      savePendingGuestOrder(order.id, effectiveToken)
                    }
                    const { loginWithLine } = await import('@/lib/auth')
                    await loginWithLine()
                  }}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: '#00B900', boxShadow: '0 6px 18px rgba(0,185,0,0.45)' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
                  </svg>
                  Login LINE รับพอยต์ {pointsMissed} ทันที!
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Points earned (for logged-in users) */}
          {!isGuest && order.pointsEarned > 0 && (
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1.5px solid #FDE68A' }}
            >
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="font-black text-amber-800 text-sm">ได้รับ {order.pointsEarned} พอยต์จากออเดอร์นี้!</p>
                <p className="text-xs text-amber-600">สะสมต่อเพื่อขึ้น tier และแลกรางวัล</p>
              </div>
            </motion.div>
          )}

          {/* Order Info */}
          <motion.div variants={fadeInUp}>
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">ข้อมูลการสั่งซื้อ</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">วันที่สั่งซื้อ</span>
                  <span>{formatOrderDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ชื่อผู้สั่ง</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">เบอร์โทรศัพท์</span>
                  <span>{order.phoneNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">วิธีรับอาหาร</span>
                  <span>{order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน (พรุ่งนี้)' : 'ส่งในหมู่บ้าน'}</span>
                </div>
                {order.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ที่อยู่จัดส่ง</span>
                    <span className="text-right max-w-[60%] whitespace-pre-line">{order.address}</span>
                  </div>
                )}
                {order.specialInstructions && (
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-50">
                    <span className="text-gray-500">หมายเหตุ</span>
                    <span className="text-right text-amber-600 max-w-[60%] italic whitespace-pre-line">{order.specialInstructions}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">วิธีชำระเงิน</span>
                  <span>
                    {order.paymentMethod === 'cod' && 'เงินสด'}
                    {order.paymentMethod === 'transfer' && 'โอนเงิน'}
                    {order.paymentMethod === 'promptpay' && 'พร้อมเพย์'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ❌ Cancel Order Action */}
          {(order.status === 'placed' || order.status === 'pending') && (
            <motion.div variants={fadeInUp}>
              <button
                onClick={async () => {
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
                className="w-full py-3 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
              >
                ยกเลิกออเดอร์นี้
              </button>
            </motion.div>
          )}

          {/* Items */}
          <motion.div variants={fadeInUp}>
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">รายการอาหาร</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      {item.options.length > 0 && (
                        <p className="text-xs text-gray-500">{item.options.map(o => o.name).join(', ')}</p>
                      )}
                      {item.note && (
                        <p className="text-xs text-amber-600 italic mt-0.5">📝 {item.note}</p>
                      )}
                      <p className="text-sm text-gray-400">x{item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-800">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ยอดรวม</span>
                  <span>{formatPrice(order.subtotalPrice)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ส่วนลด</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.pointsRedeemed > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ใช้พอยต์</span>
                    <span className="text-green-600">-{formatPrice(order.pointsRedeemed / 10)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span>ยอดสุทธิ</span>
                  <span style={{ color: '#FF6B00' }}>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Review Form */}
          {order.status === 'delivered' && (
            <motion.div variants={fadeInUp}>
              <Card>
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    รีวิวและให้คะแนน
                  </h2>
                </div>
                <div className="p-4">
                  <ReviewForm order={order} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Contact Actions */}
          <motion.div variants={fadeInUp} className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCallShop}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 bg-white font-bold text-gray-700 text-sm hover:border-gray-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              โทรหาร้าน
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleChatShop}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: '#00B900', boxShadow: '0 4px 14px rgba(0,185,0,0.35)' }}
            >
              <MessageCircle className="w-4 h-4" />
              แชท LINE
            </motion.button>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  )
}
