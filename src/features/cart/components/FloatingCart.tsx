import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store'
import { formatPriceWithoutCurrency } from '@/utils/formatPrice'

export function FloatingCart() {
  const navigate = useNavigate()
  const { totalItems, finalTotal } = useCartStore()

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-[104px] left-4 right-4 z-40 mx-auto max-w-lg"
        >
          <motion.button
            type="button"
            onClick={() => navigate('/cart')}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 20px 50px rgba(255, 94, 0, 0.55)',
            }}
            whileTap={{ scale: 0.97 }}
            aria-label={`ไปที่ตะกร้า ${totalItems} รายการ ยอดรวม ${formatPriceWithoutCurrency(finalTotal)} บาท`}
            className="relative flex w-full items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            style={{
              background: 'linear-gradient(135deg, #1C1917 0%, #292524 40%, #FF5E00 100%)',
              boxShadow: '0 12px 40px rgba(255, 94, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,94,0,0.3)',
            }}
          >
            {/* Animated shine */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              className="absolute inset-0 -skew-x-12 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
            />

            {/* Left: bag icon + count + total */}
            <div className="relative flex items-center gap-3">
              <motion.div
                key={totalItems}
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="relative w-11 h-11 rounded-[14px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <ShoppingBag className="w-5 h-5 text-white" />
                <motion.span
                  key={`badge-${totalItems}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 12, delay: 0.05 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1C1917]"
                  style={{
                    background: 'linear-gradient(135deg, #FF5E00, #FF2D00)',
                    boxShadow: '0 2px 8px rgba(255,45,0,0.6)'
                  }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              </motion.div>

              <div className="text-left">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                  ตะกร้าของคุณ ({totalItems} รายการ)
                </p>
                <p className="font-black text-lg tracking-tight text-white leading-none mt-0.5">
                  ฿{formatPriceWithoutCurrency(finalTotal)}
                </p>
              </div>
            </div>

            {/* Right: Checkout CTA */}
            <div className="relative flex items-center gap-1.5 font-black text-sm text-white">
              <span>ไปที่ตะกร้า</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
