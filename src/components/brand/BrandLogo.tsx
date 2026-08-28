import { motion } from 'framer-motion'
import { hapticMedium } from '@/utils/haptics'
import { cn } from '@/utils/cn'

interface BrandLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTagline?: boolean
  onClick?: () => void
}

export function BrandLogo({
  className,
  size = 'md',
  showTagline = true,
  onClick
}: BrandLogoProps) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'
  const isXl = size === 'xl'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        hapticMedium()
        onClick?.()
      }}
      className={cn('flex items-center gap-2.5 cursor-pointer select-none', className)}
    >
      {/* ─── 3D CRAFT WOK & FLAME EMBLEM ─── */}
      <div className="relative flex-shrink-0">
        {/* Outer Container */}
        <div
          className={cn(
            'relative rounded-[15px] p-[1px] overflow-hidden flex items-center justify-center transition-all',
            isSm ? 'w-9 h-9' : isXl ? 'w-14 h-14' : isLg ? 'w-12 h-12' : 'w-10 h-10'
          )}
          style={{
            background: 'linear-gradient(145deg, rgba(255,100,0,0.6) 0%, rgba(200,30,0,0.8) 100%)',
            boxShadow: '0 2px 8px rgba(255, 68, 0, 0.25)',
          }}
        >
          {/* Inner Surface */}
          <div
            className="w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(150deg, #180600 0%, #2A0D02 60%, #120400 100%)',
            }}
          >
            {/* Top Flare */}
            <div
              className="absolute -top-4 -left-4 right-0 h-7 rounded-full opacity-40 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9), transparent)',
                transform: 'rotate(-25deg)',
              }}
            />

            {/* Custom SVG Flame & Wok */}
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn(isSm ? 'w-5 h-5' : isXl ? 'w-9 h-9' : isLg ? 'w-8 h-8' : 'w-6 h-6')}
            >
              <defs>
                <linearGradient id="fireGradFinal" x1="24" y1="4" x2="24" y2="34" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF570" />
                  <stop offset="30%" stopColor="#FFA01C" />
                  <stop offset="75%" stopColor="#FF3B00" />
                  <stop offset="100%" stopColor="#B80000" />
                </linearGradient>
                <linearGradient id="wokGradFinal" x1="10" y1="26" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="50%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="basilGradFinal" x1="32" y1="8" x2="42" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="70%" stopColor="#15803D" />
                </linearGradient>
              </defs>

              {/* Sparks */}
              <circle cx="16" cy="12" r="1.5" fill="#FFE248" opacity="0.9" />
              <circle cx="30" cy="10" r="1.2" fill="#FF8811" opacity="0.9" />

              {/* Flame */}
              <path
                d="M24 5C24 5 28.5 11 28.5 16C28.5 18.2 27.5 20 25.8 21.2C28.8 19.8 30.5 16.5 30.5 16.5C30.5 16.5 33 21 31.5 25.5C30.2 29.2 26.5 31 24 31C21.5 31 17.8 29.2 16.5 25.5C15 21 17.5 16.5 17.5 16.5C17.5 16.5 19.2 19.8 22.2 21.2C20.5 20 19.5 18.2 19.5 16C19.5 11 24 5 24 5Z"
                fill="url(#fireGradFinal)"
              />

              {/* Inner Flame Core */}
              <path
                d="M24 13C24 13 26.2 16.5 26.2 19.5C26.2 21 25.5 22.2 24.5 23C26 22 27 20 27 20C27 20 28 22.5 27.2 25C26.5 27.2 24.8 28 24 28C23.2 28 21.5 27.2 20.8 25C20 22.5 21 20 21 20C21 20 22 22 23.5 23C22.5 22.2 21.8 21 21.8 19.5C21.8 16.5 24 13 24 13Z"
                fill="#FFFDEB"
              />

              {/* Basil Leaf */}
              <path
                d="M32 9C32 9 39 9.5 40 16C40 21 34 22 34 22C34 22 35 17 32 14C30.5 12.5 32 9 32 9Z"
                fill="url(#basilGradFinal)"
              />

              {/* Wok Bowl */}
              <path
                d="M10 26C10 26 13 38 24 38C35 38 38 26 38 26C35 27.5 30 28.5 24 28.5C18 28.5 13 27.5 10 26Z"
                fill="url(#wokGradFinal)"
              />
              <path
                d="M9 25.5C12.5 27.2 18 28.2 24 28.2C30 28.2 35.5 27.2 39 25.5"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.95"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── TYPOGRAPHY BRAND MARK ─── */}
      <div className="flex flex-col min-w-0">
        {/* Main Title Row */}
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={cn(
              'font-black tracking-tight font-sans text-slate-900',
              isSm ? 'text-base' : isXl ? 'text-2xl' : isLg ? 'text-xl' : 'text-lg'
            )}
            style={{
              letterSpacing: '-0.03em',
            }}
          >
            KAPRAO
          </span>

          {/* Glowing 52 Accent Badge */}
          <span
            className={cn(
              'font-black italic px-1.5 py-0.5 rounded-[6px] text-white shadow-sm leading-none bg-gradient-to-br from-orange-500 to-red-600',
              isSm ? 'text-[10px]' : 'text-xs'
            )}
          >
            52
          </span>
        </div>

        {/* Tagline: Single clean line */}
        {showTagline && (
          <p className="text-[9.5px] font-bold text-slate-500 tracking-wider uppercase mt-1 truncate">
            CRAFT WOK • BANGKOK
          </p>
        )}
      </div>
    </motion.div>
  )
}
