import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  Check, 
  Clock, 
  Percent, 
  Tag, 
  Truck, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'
import { useAvailableCoupons, useDiscountCalculator } from '../hooks/useCoupons'
import type { Coupon, DiscountType } from '../types/coupon.types'

interface CouponListProps {
  orderTotal: number
  menuItemIds: number[]
  onApply?: (coupon: Coupon, discount: number) => void
  selectedCouponId?: number | null
}

export function CouponList({
  orderTotal,
  menuItemIds,
  onApply,
  selectedCouponId,
}: CouponListProps) {
  const { data: coupons, isLoading } = useAvailableCoupons()
  const { calculateDiscount, isCouponValid } = useDiscountCalculator()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback: silently fail
    }
  }

  const getDiscountIcon = (type: DiscountType) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />
      case 'free_delivery':
        return <Truck className="w-4 h-4" />
      default:
        return <Tag className="w-4 h-4" />
    }
  }

  const getDiscountLabel = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `ลด ${coupon.discountValue}%`
      case 'free_delivery':
        return 'ส่งฟรี'
      default:
        return `ลด ${formatPrice(coupon.discountValue)}`
    }
  }

  const formatExpiryDate = (date: string | null) => {
    if (!date) return 'ไม่มีวันหมดอายุ'
    
    const expiry = new Date(date)
    const now = new Date()
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 0) return 'หมดอายุแล้ว'
    if (daysLeft === 1) return 'หมดอายุพรุ่งนี้'
    if (daysLeft <= 7) return `เหลืออีก ${daysLeft} วัน`
    
    return `หมดอายุ ${expiry.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short' 
    })}`
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!coupons || coupons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Tag className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 text-sm">ยังไม่มีคูปองส่วนลด</p>
      </motion.div>
    )
  }

  // Sort coupons by applicability and discount value
  const sortedCoupons = [...coupons].sort((a, b) => {
    const aValid = isCouponValid(a) && a.minOrderAmount <= orderTotal
    const bValid = isCouponValid(b) && b.minOrderAmount <= orderTotal
    
    if (aValid && !bValid) return -1
    if (!aValid && bValid) return 1
    
    return calculateDiscount(b, orderTotal) - calculateDiscount(a, orderTotal)
  })

  return (
    <div className="space-y-3">
      {sortedCoupons.map((coupon, index) => {
        const discount = calculateDiscount(coupon, orderTotal)
        const isValid = isCouponValid(coupon) && coupon.minOrderAmount <= orderTotal
        const hasApplicableItems = !coupon.applicableItems?.length || 
          menuItemIds.some(id => coupon.applicableItems?.includes(id))
        const hasExcludedItems = coupon.excludedItems?.some(id => menuItemIds.includes(id)) ?? false
        const canApply = isValid && hasApplicableItems && !hasExcludedItems
        const isSelected = selectedCouponId === coupon.id

        return (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'relative overflow-hidden rounded-xl transition-all',
              canApply ? 'cursor-pointer' : 'opacity-60',
              isSelected && 'ring-2 ring-orange-500 ring-offset-2'
            )}
            style={{
              background: canApply 
                ? 'white' 
                : '#F9FAFB',
              border: '1.5px solid',
              borderColor: isSelected 
                ? '#F97316' 
                : canApply 
                  ? 'rgba(0,0,0,0.08)' 
                  : 'rgba(0,0,0,0.04)',
              boxShadow: canApply 
                ? '0 2px 10px -2px rgba(0,0,0,0.08)' 
                : 'none',
            }}
            onClick={() => {
              if (canApply && onApply) {
                onApply(coupon, discount)
              }
            }}
          >
            {/* Discount Badge */}
            <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
              <div 
                className={cn(
                  'absolute -top-8 -left-8 w-16 h-16 rotate-45 flex items-end justify-center pb-1.5',
                  canApply ? 'bg-gradient-to-br from-orange-500 to-orange-400' : 'bg-gray-400'
                )}
              >
                {getDiscountIcon(coupon.discountType)}
              </div>
            </div>

            <div className="p-4 pl-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{coupon.name}</h3>
                  {coupon.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{coupon.description}</p>
                  )}
                  
                  {/* Conditions */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {coupon.minOrderAmount > 0 && (
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        orderTotal >= coupon.minOrderAmount
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      )}>
                        ขั้นต่ำ {formatPrice(coupon.minOrderAmount)}
                      </span>
                    )}
                    
                    {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        สูงสุด {formatPrice(coupon.maxDiscount)}
                      </span>
                    )}
                    
                    {coupon.usageLimit && (
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        coupon.usageCount >= coupon.usageLimit
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      )}>
                        เหลือ {Math.max(0, (coupon.usageLimit || 0) - coupon.usageCount)} สิทธิ์
                      </span>
                    )}
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center gap-1 mt-2 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">{formatExpiryDate(coupon.expiresAt)}</span>
                  </div>

                  {/* Applicability Warning */}
                  {!hasApplicableItems && coupon.applicableItems && coupon.applicableItems.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[10px]">ไม่มีสินค้าที่ใช้ร่วมได้ในตะกร้า</span>
                    </div>
                  )}
                  
                  {hasExcludedItems && (
                    <div className="flex items-center gap-1 mt-1.5 text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[10px]">มีสินค้าที่ไม่ร่วมรายการ</span>
                    </div>
                  )}
                </div>

                {/* Right Side */}
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    'text-lg font-black',
                    canApply ? 'text-orange-500' : 'text-gray-400'
                  )}>
                    {getDiscountLabel(coupon)}
                  </div>
                  
                  {canApply && discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-green-600 font-medium"
                    >
                      ประหยัด {formatPrice(discount)}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Code Section */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                    {coupon.code}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy(coupon.code, coupon.id)
                    }}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      copiedId === coupon.id
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    {copiedId === coupon.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </motion.button>
                </div>

                {canApply && onApply && (
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-1 text-orange-500 text-sm font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    ใช้เลย
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Compact horizontal version for checkout
export function CouponListHorizontal({
  orderTotal,
  menuItemIds,
  onApply,
  selectedCouponId,
}: CouponListProps) {
  const { data: coupons, isLoading } = useAvailableCoupons()
  const { calculateDiscount, isCouponValid } = useDiscountCalculator()

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex-shrink-0 w-40 h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!coupons || coupons.length === 0) return null

  const applicableCoupons = coupons.filter(coupon => {
    const isValid = isCouponValid(coupon) && coupon.minOrderAmount <= orderTotal
    const hasApplicableItems = !coupon.applicableItems?.length || 
      menuItemIds.some(id => coupon.applicableItems?.includes(id))
    const hasExcludedItems = coupon.excludedItems?.some(id => menuItemIds.includes(id)) ?? false
    return isValid && hasApplicableItems && !hasExcludedItems
  }).slice(0, 3)

  if (applicableCoupons.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">คูปองที่ใช้ได้</p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {applicableCoupons.map((coupon) => {
          const discount = calculateDiscount(coupon, orderTotal)
          const isSelected = selectedCouponId === coupon.id

          return (
            <motion.button
              key={coupon.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onApply?.(coupon, discount)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-lg text-left transition-all',
                isSelected
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-bold truncate max-w-[100px]">{coupon.name}</span>
              </div>
              <p className={cn(
                'text-[10px] mt-0.5',
                isSelected ? 'text-orange-100' : 'text-orange-600'
              )}>
                ประหยัด {formatPrice(discount)}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
