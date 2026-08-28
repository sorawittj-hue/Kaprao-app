import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, MapPin } from 'lucide-react'
import { BrandLogo } from './BrandLogo'
import { useAuthStore, useMenuStore } from '@/store'
import { useIsShopOpen, useNextOpeningTime } from '@/features/config/hooks/useShopConfig'
import { hapticMedium } from '@/utils/haptics'
import { SearchBar } from '@/features/menu/components/SearchBar'
import { AuthModal } from '@/components/auth/AuthModal'

export function AppHeader() {
  const { user, isGuest } = useAuthStore()
  const { isSearchOpen } = useMenuStore()
  const { data: isOpen } = useIsShopOpen()
  const { data: nextOpening } = useNextOpeningTime()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <header className="sticky top-0 z-[60] safe-area-pt">
      {/* Frosted Luxury Glass Base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
        }}
      />

      <div className="max-w-md mx-auto px-4 py-2.5 relative z-10 space-y-1.5">
        {/* ─── MAIN ROW ─── */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <BrandLogo size="md" showTagline={true} />

          {/* Right Hub */}
          <div className="flex items-center gap-2">
            {/* Live Search Trigger */}
            <SearchBar />

            {/* Guest Login Button (Sleek Minimalist Dark Glass Pill) */}
            {isGuest && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  hapticMedium()
                  setIsAuthModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs cursor-pointer transition-all border shadow-sm"
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* LINE Official Subtle Green Dot */}
                <span className="w-2 h-2 rounded-full bg-[#06C755] flex-shrink-0 animate-pulse" />
                <span>เข้าสู่ระบบ</span>
              </motion.button>
            )}

            {/* Logged-in User Loyalty Badge */}
            {!isGuest && user && (
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-amber-50 shadow-sm cursor-pointer"
                style={{ borderColor: 'rgba(245, 158, 11, 0.35)' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-black text-xs text-amber-900 num-display">
                  {user.points || 0} <span className="text-[10px] text-amber-700 font-bold">pts</span>
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* ─── SUB-ROW: Location & Status Breadcrumb ─── */}
        {!isSearchOpen && (
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-0.5 border-t border-slate-100">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="truncate font-semibold text-slate-700">ครัวกะเพรา 52 (ผัดกระทะเหล็ก)</span>
            </div>

            {/* Operational Status Indicator */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: isOpen !== false ? '#10B981' : '#F59E0B',
                  boxShadow: isOpen !== false ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
                }}
              />
              <span className="text-[10px] font-bold" style={{ color: isOpen !== false ? '#047857' : '#B45309' }}>
                {isOpen !== false ? 'เปิดบริการ' : (nextOpening ? `เปิด ${nextOpening}` : 'ปิดบริการ')}
              </span>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  )
}
