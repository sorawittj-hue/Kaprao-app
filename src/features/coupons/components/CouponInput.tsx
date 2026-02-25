import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Check, X, Loader2, Ticket } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'
import { useValidateCoupon } from '../hooks/useCoupons'

interface CouponInputProps {
  orderTotal: number
  menuItemIds: number[]
  onApply: (result: { couponId: number; discount: number; code: string; name: string }) => void
  onRemove: () => void
  appliedCoupon?: { couponId: number; discount: number; code: string; name: string } | null
  disabled?: boolean
}

export function CouponInput({
  orderTotal,
  menuItemIds,
  onApply,
  onRemove,
  appliedCoupon,
  disabled = false,
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const validateMutation = useValidateCoupon()

  const handleApply = async () => {
    if (!code.trim()) return
    
    setError(null)
    
    try {
      const result = await validateMutation.mutateAsync({
        code,
        orderTotal,
        menuItemIds,
      })

      if (result.valid && result.couponId) {
        onApply({
          couponId: result.couponId,
          discount: result.discount || 0,
          code: code.toUpperCase().trim(),
          name: result.name || code,
        })
        setCode('')
      } else {
        setError(result.message || 'ไม่สามารถใช้คูปองนี้ได้')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }

  return (
    <div className="w-full">
      {/* Applied Coupon Display */}
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="relative overflow-hidden rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, #10B981, #34D399)',
              boxShadow: '0 4px 15px -2px rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold">{appliedCoupon.name}</p>
                  <p className="text-white/80 text-sm">
                    ส่วนลด {formatPrice(appliedCoupon.discount)}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRemove}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'relative rounded-xl overflow-hidden',
              disabled && 'opacity-60 pointer-events-none'
            )}
            style={{
              background: 'white',
              border: '1.5px solid rgba(0,0,0,0.08)',
              boxShadow: '0 2px 10px -2px rgba(0,0,0,0.05)',
            }}
          >
            <div className="flex items-center">
              <div className="pl-3 pr-2">
                <Tag className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="กรอกโค้ดส่วนลด"
                className="flex-1 py-3.5 px-2 text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                disabled={disabled || validateMutation.isPending}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                disabled={!code.trim() || validateMutation.isPending || disabled}
                className={cn(
                  'm-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all',
                  !code.trim() || validateMutation.isPending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md hover:shadow-lg'
                )}
              >
                {validateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'ใช้'
                )}
              </motion.button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                      <X className="w-3.5 h-3.5" />
                      {error}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact version for checkout summary
export function CouponInputCompact({
  orderTotal,
  menuItemIds,
  onApply,
  onRemove,
  appliedCoupon,
  disabled = false,
}: CouponInputProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const validateMutation = useValidateCoupon()

  const handleApply = async () => {
    if (!code.trim()) return
    
    setError(null)
    
    try {
      const result = await validateMutation.mutateAsync({
        code,
        orderTotal,
        menuItemIds,
      })

      if (result.valid && result.couponId) {
        onApply({
          couponId: result.couponId,
          discount: result.discount || 0,
          code: code.toUpperCase().trim(),
          name: result.name || code,
        })
        setCode('')
        setIsExpanded(false)
      } else {
        setError(result.message || 'ไม่สามารถใช้คูปองนี้ได้')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  if (appliedCoupon) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between py-2 text-green-600"
      >
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          <span className="text-sm font-medium">{appliedCoupon.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">-{formatPrice(appliedCoupon.discount)}</span>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={cn(disabled && 'opacity-60 pointer-events-none')}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
          >
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">ใช้คูปองส่วนลด</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                placeholder="กรอกโค้ดส่วนลด"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                disabled={validateMutation.isPending}
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                disabled={!code.trim() || validateMutation.isPending}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'ใช้'
                )}
              </motion.button>
              <button
                onClick={() => {
                  setIsExpanded(false)
                  setCode('')
                  setError(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
