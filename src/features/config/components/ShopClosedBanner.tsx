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
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn('rounded-[18px] p-4 relative overflow-hidden', className)}
      style={{
        background: 'linear-gradient(135deg, rgba(180,83,9,0.15) 0%, rgba(120,53,15,0.10) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        boxShadow: '0 4px 16px rgba(180,83,9,0.15)'
      }}
    >
      {/* Subtle amber glow */}
      <div
        className="absolute inset-0 rounded-[18px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(251,191,36,0.08) 0%, transparent 70%)' }}
      />
      <div className="relative z-10 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <Store className="w-4.5 h-4.5" style={{ color: '#FBBF24' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm" style={{ color: '#FDE68A' }}>ร้านปิดอยู่</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: 'rgba(253,230,138,0.6)' }}>
            {nextOpening ? `เปิดอีกครั้ง: ${nextOpening}` : 'ขออภัย ร้านปิดให้บริการ'}
          </p>
        </div>
        <Clock className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(251,191,36,0.4)' }} />
      </div>
    </motion.div>
  )
}
