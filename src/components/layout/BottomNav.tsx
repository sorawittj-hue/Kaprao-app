import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Ticket, User, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store'
import { hapticLight } from '@/utils/haptics'

const navItems = [
  { path: '/',        icon: Home,          label: 'หน้าหลัก', activeColor: '#FF5E00', activeBg: 'rgba(255,94,0,0.12)',   activeGlow: 'rgba(255,94,0,0.3)' },
  { path: '/orders',  icon: ClipboardList, label: 'ออเดอร์',  activeColor: '#38BDF8', activeBg: 'rgba(56,189,248,0.10)', activeGlow: 'rgba(56,189,248,0.25)' },
  { path: '/lottery', icon: Ticket,        label: 'หวย',      activeColor: '#4ADE80', activeBg: 'rgba(74,222,128,0.10)', activeGlow: 'rgba(74,222,128,0.25)' },
  { path: '/cart',    icon: ShoppingCart,  label: 'ตะกร้า',   activeColor: '#4ADE80', activeBg: 'rgba(74,222,128,0.10)', activeGlow: 'rgba(74,222,128,0.25)', showBadge: true },
  { path: '/profile', icon: User,          label: 'โปรไฟล์', activeColor: '#C084FC', activeBg: 'rgba(192,132,252,0.10)', activeGlow: 'rgba(192,132,252,0.25)' },
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
      <div className="max-w-md mx-auto px-4 pb-3 pt-6 pointer-events-auto">
        <div
          className="h-[68px] rounded-[28px] flex justify-around items-center px-2 relative overflow-hidden"
          style={{
            background: 'rgba(18, 18, 22, 0.96)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 -1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Subtle inner highlight */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }}
          />

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => hapticLight()}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 rounded-[22px] touch-manipulation select-none"
            >
              {({ isActive }) => (
                <>
                  {/* Active pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-y-2 inset-x-0.5 rounded-[18px]"
                      style={{ background: item.activeBg }}
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}

                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{
                        y: isActive ? -2 : 0,
                        scale: isActive ? 1.15 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      style={isActive ? { filter: `drop-shadow(0 0 6px ${item.activeGlow})` } : undefined}
                    >
                      <item.icon
                        className="w-[21px] h-[21px] transition-colors duration-200"
                        style={{ color: isActive ? item.activeColor : '#505058' }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>

                    {/* Cart badge */}
                    {item.showBadge && totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        role="status"
                        aria-label={`${totalItems} รายการในตะกร้า`}
                        className="absolute -top-2.5 -right-2.5 min-w-[17px] h-[17px] rounded-full text-white text-[9px] font-black flex items-center justify-center px-1 border-2"
                        style={{
                          background: 'linear-gradient(135deg, #FF5E00, #FF2D00)',
                          borderColor: 'var(--bg-base)',
                          boxShadow: '0 2px 8px rgba(255,45,0,0.5)'
                        }}
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </motion.span>
                    )}

                    <span
                      className="text-[9px] font-black mt-0.5 tracking-wide transition-colors duration-200"
                      style={{ color: isActive ? item.activeColor : '#505058' }}
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

export default BottomNav
