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
          className="fixed left-4 right-4 bottom-[76px] z-40"
        >
          <motion.button
            onClick={() => navigate('/cart')}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 20px 50px -8px rgba(255, 107, 0, 0.6)',
            }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full overflow-hidden rounded-2xl text-white flex justify-between items-center px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg, #1C1917 0%, #292524 40%, #FF6B00 100%)',
              boxShadow: '0 12px 35px -6px rgba(255, 107, 0, 0.45)',
            }}
          >
            {/* Animated shine */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              className="absolute inset-0 -skew-x-12 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
            />

            {/* Left: bag icon + count + total */}
            <div className="relative flex items-center gap-3">
              <motion.div
                key={totalItems}
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="relative w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <ShoppingBag className="w-5 h-5 text-white" />
                <motion.span
                  key={`badge-${totalItems}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 12, delay: 0.05 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg"
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              </motion.div>

              <div className="flex flex-col items-start">
                <span className="text-[11px] text-white/55 font-medium">ยอดรวม</span>
                <motion.div
                  key={finalTotal}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="font-black text-lg leading-tight text-white"
                >
                  {formatPriceWithoutCurrency(finalTotal)} <span className="text-sm font-bold opacity-80">฿</span>
                </motion.div>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="relative flex items-center gap-2">
              <span className="font-black text-sm text-white">ชำระเงิน</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
