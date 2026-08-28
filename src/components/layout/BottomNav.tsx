import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Ticket, User, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store'
import { hapticLight } from '@/utils/haptics'

const navItems = [
  {
    path: '/',
    icon: Home,
    label: 'หน้าหลัก',
    activeColor: '#FF5500',
    activeBg: 'rgba(255,85,0,0.10)',
    activeGlow: 'rgba(255,85,0,0.25)',
    activeGradient: 'linear-gradient(135deg, rgba(255,85,0,0.12), rgba(255,58,0,0.06))',
  },
  {
    path: '/orders',
    icon: ClipboardList,
    label: 'ออเดอร์',
    activeColor: '#0284C7',
    activeBg: 'rgba(2,132,199,0.10)',
    activeGlow: 'rgba(2,132,199,0.25)',
    activeGradient: 'linear-gradient(135deg, rgba(2,132,199,0.12), rgba(14,165,233,0.06))',
  },
  {
    path: '/lottery',
    icon: Ticket,
    label: 'ลุ้นรางวัล',
    activeColor: '#D97706',
    activeBg: 'rgba(217,119,6,0.10)',
    activeGlow: 'rgba(217,119,6,0.25)',
    activeGradient: 'linear-gradient(135deg, rgba(217,119,6,0.12), rgba(245,158,11,0.06))',
  },
  {
    path: '/cart',
    icon: ShoppingCart,
    label: 'ตะกร้า',
    activeColor: '#16A34A',
    activeBg: 'rgba(22,163,74,0.10)',
    activeGlow: 'rgba(22,163,74,0.25)',
    activeGradient: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(34,197,94,0.06))',
    showBadge: true,
  },
  {
    path: '/profile',
    icon: User,
    label: 'โปรไฟล์',
    activeColor: '#9333EA',
    activeBg: 'rgba(147,51,234,0.10)',
    activeGlow: 'rgba(147,51,234,0.25)',
    activeGradient: 'linear-gradient(135deg, rgba(147,51,234,0.12), rgba(168,85,247,0.06))',
  },
]

export function BottomNav() {
  const location = useLocation()
  const { totalItems } = useCartStore()

  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/checkout')
  ) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none"
      role="navigation"
      aria-label="เมนูหลัก"
    >
      <div className="max-w-md mx-auto px-3 pb-2.5 pt-5 pointer-events-auto">
        <div
          className="h-[66px] rounded-[26px] flex justify-around items-center px-1.5 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(36px) saturate(180%)',
            WebkitBackdropFilter: 'blur(36px) saturate(180%)',
            boxShadow: '0 16px 40px -6px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => hapticLight()}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 rounded-[20px] touch-manipulation select-none cursor-pointer"
            >
              {({ isActive }) => (
                <>
                  {/* Animated active pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key="active-pill"
                        layoutId="nav-pill"
                        className="absolute inset-y-1.5 inset-x-0.5 rounded-[18px]"
                        style={{ background: item.activeGradient }}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Glow line under active */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full"
                      style={{ background: item.activeColor }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                    <div className="relative">
                      <motion.div
                        animate={{
                          y: isActive ? -1 : 0,
                          scale: isActive ? 1.15 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      >
                        <item.icon
                          className="transition-colors duration-200"
                          style={{
                            width: 20, height: 20,
                            color: isActive ? item.activeColor : '#94A3B8',
                          }}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </motion.div>

                      {/* Cart badge */}
                      {item.showBadge && totalItems > 0 && (
                        <motion.span
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-[8px] -right-[8px] min-w-[16px] h-[16px] rounded-full text-white text-[8px] font-black flex items-center justify-center px-[3px] border-[2px]"
                          style={{
                            background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                            borderColor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(255,85,0,0.4)',
                          }}
                          role="status"
                          aria-label={`${totalItems} รายการในตะกร้า`}
                        >
                          {totalItems > 99 ? '99+' : totalItems}
                        </motion.span>
                      )}
                    </div>

                    <span
                      className="text-[10px] tracking-tight transition-all duration-200"
                      style={{
                        color: isActive ? item.activeColor : '#64748B',
                        fontWeight: isActive ? 900 : 600,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
