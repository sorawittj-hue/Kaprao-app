import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, X } from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { useRedeemPoints } from '../hooks/usePoints'
import { hapticHeavy, hapticLight } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import confetti from 'canvas-confetti'

export interface RewardItem {
  id: string
  code: string
  title: string
  description: string
  pointsRequired: number
  value: number
  type: 'discount' | 'free_item'
  badge?: string
  icon: string
}

export const REWARDS_CATALOG: RewardItem[] = [
  {
    id: 'reward_10',
    code: 'REWARD10',
    title: 'คูปองส่วนลด 10 บาท',
    description: 'ใช้ลดค่าอาหารได้ทันที ไม่มีขั้นต่ำ',
    pointsRequired: 100,
    value: 10,
    type: 'discount',
    badge: 'ยอดฮิต',
    icon: '🎟️',
  },
  {
    id: 'reward_20',
    code: 'REWARD20',
    title: 'คูปองส่วนลด 20 บาท',
    description: 'ใช้ลดค่าอาหารเมื่อสั่งขั้นต่ำ 70 บาท',
    pointsRequired: 180,
    value: 20,
    type: 'discount',
    badge: 'คุ้มค่า',
    icon: '🎫',
  },
  {
    id: 'reward_50',
    code: 'REWARD50',
    title: 'คูปองส่วนลด 50 บาท',
    description: 'ใช้ลดค่าอาหารเมื่อสั่งขั้นต่ำ 150 บาท',
    pointsRequired: 400,
    value: 50,
    type: 'discount',
    badge: 'บิ๊กเซฟ',
    icon: '👑',
  },
  {
    id: 'reward_khaidao',
    code: 'FREEKHAIDAO',
    title: 'ฟรี! ไข่ดาวทรงเครื่องซอสมะขาม',
    description: 'แลกรับฟรีเมนูไข่ดาวทรงเครื่อง มูลค่า 45 บาท',
    pointsRequired: 350,
    value: 45,
    type: 'free_item',
    badge: 'เมนูพิเศษ',
    icon: '🍳',
  },
  {
    id: 'reward_soup',
    code: 'FREESOUPSOUP',
    title: 'ฟรี! ต้มจืดเต้าหู้หมูสับสาหร่าย',
    description: 'แลกรับฟรีเมนูซุปกลมกล่อม มูลค่า 65 บาท',
    pointsRequired: 500,
    value: 65,
    type: 'free_item',
    badge: 'อิ่มฟิน',
    icon: '🍲',
  },
]

export interface RedeemedVoucher {
  id: string
  code: string
  title: string
  discount: number
  redeemedAt: string
  used: boolean
}

const WALLET_KEY = 'kaprao_wallet_coupons'

export function getWalletCoupons(): RedeemedVoucher[] {
  try {
    const raw = localStorage.getItem(WALLET_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRedeemedVoucher(voucher: RedeemedVoucher) {
  const existing = getWalletCoupons()
  const updated = [voucher, ...existing]
  localStorage.setItem(WALLET_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('wallet_coupons_updated'))
}

export function RewardsMarketplace({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const redeemMutation = useRedeemPoints()

  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const userPoints = user?.points || 0

  const handleRedeem = async (reward: RewardItem) => {
    if (userPoints < reward.pointsRequired) {
      addToast({
        type: 'error',
        title: 'พอยต์ไม่เพียงพอ',
        message: `คุณต้องมี ${reward.pointsRequired} pts (ปัจจุบันมี ${userPoints} pts)`,
      })
      return
    }

    hapticHeavy()
    setIsProcessing(true)

    try {
      if (user?.id) {
        await redeemMutation.mutateAsync({
          userId: user.id,
          amount: reward.pointsRequired,
        })
      }

      // Deduct locally in auth store
      useAuthStore.getState().deductPoints(reward.pointsRequired)

      // Save to wallet
      const newVoucher: RedeemedVoucher = {
        id: 'v_' + Date.now(),
        code: reward.code,
        title: reward.title,
        discount: reward.value,
        redeemedAt: new Date().toISOString(),
        used: false,
      }
      saveRedeemedVoucher(newVoucher)

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF5500', '#FBBF24', '#10B981'],
      })

      addToast({
        type: 'success',
        title: 'แลกของรางวัลสำเร็จ!',
        message: `โค้ด ${reward.code} ถูกเพิ่มเข้ากระเป๋าคูปองของคุณแล้ว`,
      })
    } catch {
      addToast({ type: 'error', title: 'เกิดข้อผิดพลาดในการแลก' })
    } finally {
      setIsProcessing(false)
    }
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

        {/* Modal Container */}
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
              <div className="w-10 h-10 rounded-[14px] bg-amber-100 flex items-center justify-center text-amber-600">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">ร้านค้าแลกพอยต์</h3>
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  REWARDS MARKETPLACE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-black text-xs text-amber-900 num-display">
                  {userPoints} <span className="text-[10px] text-amber-700">pts</span>
                </span>
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
          </div>

          {/* List of Rewards */}
          <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-1">
            {REWARDS_CATALOG.map((reward) => {
              const canAfford = userPoints >= reward.pointsRequired
              return (
                <motion.div
                  key={reward.id}
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    'p-4 rounded-[24px] border flex items-center justify-between gap-3 transition-all relative overflow-hidden',
                    canAfford
                      ? 'bg-white border-slate-200 shadow-sm hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-3xl flex-shrink-0">{reward.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-black text-xs text-slate-900 truncate">
                          {reward.title}
                        </h4>
                        {reward.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                            {reward.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {reward.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 mt-1 num-display">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {reward.pointsRequired} pts
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford || isProcessing}
                    onClick={() => handleRedeem(reward)}
                    className={cn(
                      'px-4 py-2.5 rounded-[16px] font-black text-xs flex-shrink-0 cursor-pointer transition-all',
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:shadow-lg'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    แลกรับ
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
