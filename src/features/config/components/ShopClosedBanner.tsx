import { motion } from 'framer-motion'
import { Clock, Store } from 'lucide-react'
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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold">ร้านปิดอยู่</h3>
          <p className="text-sm text-white/90">
            {nextOpening ? (
              <>เปิดอีกครั้ง: {nextOpening}</>
            ) : (
              <>ขออภัย ร้านปิดให้บริการ</>
            )}
          </p>
        </div>
        <Clock className="w-6 h-6 text-white/60" />
      </div>
    </motion.div>
  )
}
