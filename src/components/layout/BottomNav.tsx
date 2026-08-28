import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Ticket, User, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store'
import { hapticLight } from '@/utils/haptics'
import { cn } from '@/utils/cn'

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
          className="h-[58px] rounded-[24px] flex justify-around items-center px-1.5 relative overflow-hidden border shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            borderColor: 'rgba(226, 232, 240, 0.8)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => hapticLight()}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center flex-1 h-full focus-visible:outline-none rounded-[16px] touch-manipulation select-none cursor-pointer"
            >
              {({ isActive }) => (
                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <div className="relative">
                    <motion.div
                      animate={{
                        y: isActive ? -1 : 0,
                        scale: isActive ? 1.12 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <item.icon
                        className="transition-colors duration-200"
                        style={{
                          width: 19,
                          height: 19,
                          color: isActive ? item.activeColor : '#94A3B8',
                        }}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </motion.div>

                    {/* Cart badge */}
                    {item.showBadge && totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-2 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] text-white"
                        style={{
                          background: '#EF4444',
                        }}
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </motion.div>
                    )}
                  </div>

                  <span
                    className={cn(
                      'text-[10px] tracking-tight transition-colors duration-200 leading-none mt-0.5',
                      isActive ? 'font-black' : 'font-semibold text-slate-400'
                    )}
                    style={isActive ? { color: item.activeColor } : undefined}
                  >
                    {item.label}
                  </span>

                  {/* Micro active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="w-1 h-1 rounded-full mt-0.5"
                      style={{ background: item.activeColor }}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
