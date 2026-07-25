import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Ticket, User, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store'
import { hapticLight } from '@/utils/haptics'

const navItems = [
  { path: '/', icon: Home, label: 'หน้าหลัก', activeColor: '#FF5E00', activeBg: 'rgba(255, 94, 0, 0.08)' },
  { path: '/orders', icon: ClipboardList, label: 'ออเดอร์', activeColor: '#3B82F6', activeBg: 'rgba(59, 130, 246, 0.08)' },
  { path: '/lottery', icon: Ticket, label: 'หวยหรรษา', activeColor: '#10B981', activeBg: 'rgba(16, 185, 129, 0.08)' },
  { path: '/cart', icon: ShoppingCart, label: 'ตะกร้า', showBadge: true, activeColor: '#10B981', activeBg: 'rgba(16, 185, 129, 0.08)' },
  { path: '/profile', icon: User, label: 'โปรไฟล์', activeColor: '#8B5CF6', activeBg: 'rgba(139, 92, 246, 0.08)' },
]

export function BottomNav() {
  const location = useLocation()
  const { totalItems } = useCartStore()

  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/cart')
  ) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none" role="navigation" aria-label="เมนูหลัก">
      <div className="max-w-md mx-auto px-3.5 pb-3 pt-5 pointer-events-auto">
        <div
          className="h-[68px] rounded-[28px] flex justify-around items-center px-1.5 relative overflow-hidden"
          style={{
            background: 'rgba(255, 252, 249, 0.92)',
            backdropFilter: 'blur(40px) saturate(220%) brightness(1.02)',
            WebkitBackdropFilter: 'blur(40px) saturate(220%) brightness(1.02)',
            boxShadow: '0 -1px 0 rgba(255,120,40,0.06), 0 20px 60px -12px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(255,120,40,0.07)'
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => hapticLight()}
              aria-label={item.label}
              end={item.path === '/'}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] tap-highlight-transparent group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 rounded-[22px]"
            >
              {({ isActive }) => (
                <>
                  {/* Active pill background */}
                  <AnimatedPill isActive={isActive} activeBg={item.activeBg} />

                  <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
                    <motion.div
                      animate={{
                        y: isActive ? -2 : 0,
                        scale: isActive ? 1.12 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <item.icon
                        className="w-[22px] h-[22px] transition-colors duration-300"
                        style={{ color: isActive ? item.activeColor : '#A0A0A0' }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>

                    {item.showBadge && totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        role="status"
                        aria-label={`${totalItems} รายการในตะกร้า`}
                        className="absolute -top-2 -right-2.5 text-white text-[9px] font-black min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 border-2 border-white"
                        style={{ background: 'linear-gradient(135deg, #FF5E00, #FF2D00)', boxShadow: '0 2px 6px rgba(255,45,0,0.4)' }}
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </motion.span>
                    )}

                    <span
                      className="text-[9px] font-black mt-1 transition-all duration-300 tracking-wide"
                      style={{ color: isActive ? item.activeColor : '#BCBCBC' }}
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

function AnimatedPill({ isActive, activeBg }: { isActive: boolean; activeBg: string }) {
  return (
    <motion.div
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute inset-y-2 inset-x-0.5 rounded-[20px] z-0"
      style={{ background: activeBg }}
    />
  )
}

export default BottomNav
