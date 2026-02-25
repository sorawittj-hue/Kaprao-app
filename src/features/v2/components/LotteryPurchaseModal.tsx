import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNumberGenerator, useTicketPrices } from '../hooks/useLotteryV2'
import type { LottoTicketPrice } from '@/types/v2'
import { cn } from '@/utils/cn'

interface LotteryPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  userPoints: number
  onPurchase: (number: string, price: number) => Promise<boolean>
  isGuest?: boolean
  guestId?: string
}

export function LotteryPurchaseModal({
  isOpen,
  onClose,
  userPoints,
  onPurchase,
  isGuest,
}: LotteryPurchaseModalProps) {
  const prices = useTicketPrices()
  const [selectedPrice, setSelectedPrice] = useState<LottoTicketPrice>(prices[0])
  const { number, setNumber, generate, isValid } = useNumberGenerator(selectedPrice.numberLength)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Guests cannot purchase tickets with points - they only get free tickets from orders
  const canPurchase = !isGuest && isValid && userPoints >= selectedPrice.points

  const handlePurchase = async () => {
    if (!canPurchase) return

    setIsPurchasing(true)
    try {
      const success = await onPurchase(number, selectedPrice.points)
      if (success) {
        onClose()
      }
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-3xl z-50 overflow-hidden"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">ซื้อตั๋วหวย</h2>
                  <p className="text-purple-200 text-sm">ใช้พอยต์แลกตั๋วลุ้นโชค</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 120px)' }}>
              {/* Price Selection */}
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-3 block">
                  เลือกแบบตั๋ว
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {prices.map((price) => (
                    <button
                      key={price.type}
                      onClick={() => setSelectedPrice(price)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-center",
                        selectedPrice.type === price.type
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      )}
                    >
                      <p className="font-black text-lg text-purple-600">
                        {price.numberLength} ตัว
                      </p>
                      <p className="text-xs text-gray-500">{price.points} pts</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Input */}
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-3 block">
                  เลขที่ต้องการ
                </label>

                <div className="flex items-center gap-2 mb-3">
                  {Array.from({ length: selectedPrice.numberLength }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 aspect-square bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                      <span className="text-2xl font-black text-gray-800">
                        {number[i] || '?'}
                      </span>
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  value={number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, selectedPrice.numberLength)
                    setNumber(val)
                  }}
                  placeholder={`กรอกเลข ${selectedPrice.numberLength} ตัว`}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-center text-2xl font-bold tracking-widest"
                  maxLength={selectedPrice.numberLength}
                />

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={generate}
                    className="flex-1 py-2 rounded-lg bg-purple-100 text-purple-600 font-bold text-sm flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    สุ่มเลข
                  </button>
                </div>

                {!isValid && number.length > 0 && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    กรุณากรอกเลขให้ครบ {selectedPrice.numberLength} ตัว
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">ราคา</span>
                  <span className="font-bold">{selectedPrice.points} พอยต์</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">พอยต์คงเหลือ</span>
                  <span className={cn(
                    "font-bold",
                    userPoints < selectedPrice.points ? "text-red-500" : "text-green-600"
                  )}>
                    {userPoints} พอยต์
                  </span>
                </div>
              </div>

              {/* Purchase Button */}
              {isGuest ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                  <p className="font-bold text-amber-800 mb-2">🎟️ สำหรับสมาชิกเท่านั้น</p>
                  <p className="text-sm text-amber-700">
                    กรุณา login ด้วย LINE เพื่อซื้อตั๋วหวยด้วยพอยต์
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    คุณยังสามารถรับตั๋วหวยฟรีได้จากการสั่งซื้อครบ 100 บาท
                  </p>
                </div>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  isLoading={isPurchasing}
                  disabled={!canPurchase}
                  onClick={handlePurchase}
                  className={cn(
                    "bg-gradient-to-r from-purple-600 to-indigo-600",
                    !canPurchase && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {userPoints < selectedPrice.points
                    ? 'พอยต์ไม่พอ'
                    : 'ซื้อตั๋วเลย'
                  }
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
