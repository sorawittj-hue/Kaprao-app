import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Ticket, User, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store'
import { cn } from '@/utils/cn'
import { hapticLight } from '@/utils/haptics'

const navItems = [
  { path: '/', icon: Home, label: 'หน้าหลัก', activeColor: 'text-[#FF6B00]' },
  { path: '/orders', icon: ClipboardList, label: 'ออเดอร์', activeColor: 'text-blue-500' },
  { path: '/lottery', icon: Ticket, label: 'หวยหรรษา', activeColor: 'text-emerald-500' },
  { path: '/cart', icon: ShoppingCart, label: 'ตะกร้า', showBadge: true, activeColor: 'text-green-500' },
  { path: '/profile', icon: User, label: 'โปรไฟล์', activeColor: 'text-gray-900' },
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
      <div className="max-w-md mx-auto px-4 pb-4 pt-6 pointer-events-auto">
        <div 
           className="h-[72px] rounded-[36px] flex justify-around items-center px-2 relative overflow-hidden"
           style={{
             background: 'rgba(255, 255, 255, 0.75)',
             backdropFilter: 'blur(30px) saturate(200%)',
             WebkitBackdropFilter: 'blur(30px) saturate(200%)',
             boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset'
           }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => hapticLight()}
              className="relative flex flex-col items-center justify-center flex-1 h-full tap-highlight-transparent group"
            >
              {({ isActive }) => (
                <>
                  <motion.div 
                     layoutId="nav-pill"
                     className={cn("absolute inset-y-2 inset-x-1 rounded-[28px] z-0 transition-opacity", isActive ? "bg-white shadow-sm opacity-100" : "opacity-0")}
                     transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />

                  <div className="relative z-10 flex flex-col items-center justify-center pt-1">
                    <motion.div
                      animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <item.icon
                        className={cn(
                          'w-6 h-6 transition-colors duration-300',
                          isActive ? item.activeColor : 'text-gray-400 group-hover:text-gray-500'
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>

                    {item.showBadge && totalItems > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm"
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </motion.span>
                    )}

                    <span
                      className={cn(
                        'text-[9px] font-black mt-1 transition-all duration-300 tracking-wide',
                        isActive ? cn(item.activeColor, 'opacity-100') : 'text-gray-400 opacity-80 group-hover:opacity-100'
                      )}
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
