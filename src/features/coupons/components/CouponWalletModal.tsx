import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, X } from 'lucide-react'
import { useCartStore, useUIStore } from '@/store'
import { getWalletCoupons, RedeemedVoucher } from '@/features/points/components/RewardsMarketplace'
import { formatPrice } from '@/utils/formatPrice'
import { hapticLight, hapticHeavy } from '@/utils/haptics'
import { cn } from '@/utils/cn'

interface PublicCoupon {
  code: string
  name: string
  description: string
  discount: number
  minOrder: number
}

const PUBLIC_COUPONS: PublicCoupon[] = [
  {
    code: 'KAPRAO10',
    name: 'ส่วนลดต้อนรับ 10.-',
    description: 'ลดทันที 10 บาท เมื่อสั่งครบ 50 บาท',
    discount: 10,
    minOrder: 50,
  },
  {
    code: 'KAPRAO20',
    name: 'ส่วนลดพิเศษ 20.-',
    description: 'ลดทันที 20 บาท เมื่อสั่งครบ 100 บาท',
    discount: 20,
    minOrder: 100,
  },
]

export function CouponWalletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { subtotal, couponCode, applyCoupon, removeCoupon } = useCartStore()
  const { addToast } = useUIStore()
  const [walletVouchers, setWalletVouchers] = useState<RedeemedVoucher[]>([])

  const loadWallet = () => {
    setWalletVouchers(getWalletCoupons())
  }

  useEffect(() => {
    loadWallet()
    window.addEventListener('wallet_coupons_updated', loadWallet)
    return () => window.removeEventListener('wallet_coupons_updated', loadWallet)
  }, [isOpen])

  if (!isOpen) return null

  const handleApply = (code: string, discount: number, name: string, minOrder: number) => {
    if (subtotal < minOrder) {
      addToast({
        type: 'error',
        title: 'ยอดสั่งซื้อไม่ถึงขั้นต่ำ',
        message: `คูปองนี้ใช้ได้เมื่อสั่งครบ ${minOrder} บาท (ปัจจุบัน ${subtotal} บาท)`,
      })
      return
    }

    hapticHeavy()
    applyCoupon(code, discount)
    addToast({
      type: 'success',
      title: 'ใช้คูปองสำเร็จ!',
      message: `${name} (ประหยัด ${discount} บาท)`,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60"
          style={{ backdropFilter: 'blur(16px)' }}
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-5 pb-8 relative z-10 max-h-[85vh] flex flex-col shadow-2xl"
          style={{ background: 'var(--bg-base)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-[14px] bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">กระเป๋าคูปอง</h3>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  COUPON WALLET
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                hapticLight()
                onClose()
              }}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Coupons */}
          <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-1">
            {/* Redeemed E-Vouchers Section */}
            {walletVouchers.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1">
                  คูปองที่แลกไว้ ({walletVouchers.length})
                </p>
                {walletVouchers.map((voucher) => {
                  const isApplied = couponCode === voucher.code
                  return (
                    <div
                      key={voucher.id}
                      className={cn(
                        'p-4 rounded-[22px] border flex items-center justify-between gap-3 transition-all',
                        isApplied
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {voucher.code}
                          </span>
                          <h4 className="font-black text-xs text-slate-900 truncate">
                            {voucher.title}
                          </h4>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">
                          ลดทันที {formatPrice(voucher.discount)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isApplied
                            ? removeCoupon()
                            : handleApply(voucher.code, voucher.discount, voucher.title, 0)
                        }
                        className={cn(
                          'px-4 py-2 rounded-full font-black text-xs flex-shrink-0 cursor-pointer transition-all',
                          isApplied
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                        )}
                      >
                        {isApplied ? 'กำลังใช้' : 'ใช้คูปอง'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Public Coupons Section */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1">
                คูปองโปรโมชั่นทั่วไป
              </p>
              {PUBLIC_COUPONS.map((coupon) => {
                const isApplied = couponCode === coupon.code
                const isEligible = subtotal >= coupon.minOrder

                return (
                  <div
                    key={coupon.code}
                    className={cn(
                      'p-4 rounded-[22px] border flex items-center justify-between gap-3 transition-all',
                      isApplied
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : isEligible
                        ? 'bg-white border-slate-200 hover:border-emerald-300'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                          {coupon.code}
                        </span>
                        <h4 className="font-black text-xs text-slate-900 truncate">
                          {coupon.name}
                        </h4>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">
                        {coupon.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!isEligible}
                      onClick={() =>
                        isApplied
                          ? removeCoupon()
                          : handleApply(
                              coupon.code,
                              coupon.discount,
                              coupon.name,
                              coupon.minOrder
                            )
                      }
                      className={cn(
                        'px-4 py-2 rounded-full font-black text-xs flex-shrink-0 cursor-pointer transition-all',
                        isApplied
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isEligible
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm hover:shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      {isApplied ? 'กำลังใช้' : 'ใช้คูปอง'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
