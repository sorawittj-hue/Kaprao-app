import { motion } from 'framer-motion'
import { Clock, Moon } from 'lucide-react'
import { useIsShopOpen, useNextOpeningTime } from '../hooks/useShopConfig'
import { cn } from '@/utils/cn'

interface ShopClosedBannerProps {
  className?: string
}

export function ShopClosedBanner({ className }: ShopClosedBannerProps) {
  const { data: isOpen, isLoading } = useIsShopOpen()
  const { data: nextOpening } = useNextOpeningTime()

  if (isLoading || isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-[18px] px-3.5 py-2.5 flex items-center justify-between gap-3 border shadow-xs',
        className
      )}
      style={{
        background: 'rgba(254, 243, 199, 0.6)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
          <Moon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs text-amber-950 truncate">
            ร้านอยู่นอกเวลาทำการ
            <span className="font-normal text-amber-800 text-[11px] ml-1">
              (สั่งอาหารล่วงหน้าได้)
            </span>
          </p>
        </div>
      </div>

      {nextOpening && (
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 flex-shrink-0 bg-white/80 px-2 py-0.5 rounded-full border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>เปิด {nextOpening}</span>
        </div>
      )}
    </motion.div>
  )
}
