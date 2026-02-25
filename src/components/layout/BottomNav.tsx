import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ClipboardList, Ticket, User, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks'

const navItems = [
  { path: '/', icon: Home, label: 'หน้าหลัก', activeGradient: 'from-brand-500 to-orange-400' },
  { path: '/orders', icon: ClipboardList, label: 'ออเดอร์', activeGradient: 'from-blue-500 to-cyan-400' },
  { path: '/lottery', icon: Ticket, label: 'หวย', activeGradient: 'from-purple-500 to-pink-500' },
  { path: '/cart', icon: ShoppingCart, label: 'ตะกร้า', showBadge: true, activeGradient: 'from-green-500 to-emerald-400' },
  { path: '/profile', icon: User, label: 'โปรไฟล์', activeGradient: 'from-gray-600 to-gray-500' },
]

export function BottomNav() {
  const location = useLocation()
  const { totalItems } = useCartStore()
  const reducedMotion = useReducedMotion()

  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/cart')
  ) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div
        className="border-t border-gray-100/80"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 -8px 32px -8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="max-w-md mx-auto flex justify-around items-center h-[62px] safe-area-x px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1"
            >
              {({ isActive }) => (
                <>
                  {/* Active background pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={cn(
                          'absolute top-1 w-12 h-8 rounded-2xl',
                          `bg-gradient-to-br ${item.activeGradient}`,
                          'opacity-15'
                        )}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon container */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={isActive ? { y: -2 } : { y: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      {isActive ? (
                        <div
                          className={cn(
                            'w-6 h-6 flex items-center justify-center',
                          )}
                        >
                          <item.icon
                            className="w-6 h-6"
                            style={{
                              color: 'transparent',
                              stroke: `url(#grad-${item.path.replace('/', 'home')})`,
                            }}
                          />
                          {/* SVG gradient definition */}
                          <svg width="0" height="0" className="absolute">
                            <defs>
                              <linearGradient
                                id={`grad-${item.path.replace('/', 'home')}`}
                                x1="0%" y1="0%" x2="100%" y2="100%"
                              >
                                <stop stopColor={getActiveColor(item.activeGradient, 'start')} />
                                <stop offset="1" stopColor={getActiveColor(item.activeGradient, 'end')} />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      ) : (
                        <item.icon className="w-5.5 h-5.5 text-gray-400 transition-colors duration-200" style={{ width: 22, height: 22 }} />
                      )}
                    </motion.div>

                    {/* Cart Badge */}
                    {item.showBadge && totalItems > 0 && (
                      <motion.span
                        initial={reducedMotion ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                        className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-lg"
                      >
                        {totalItems > 99 ? '99+' : totalItems}
                      </motion.span>
                    )}
                  </div>

                  {/* Label */}
                  <motion.span
                    animate={isActive
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0.5, y: 0 }
                    }
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'text-[10px] font-bold mt-0.5 transition-all duration-200',
                      isActive ? 'text-gray-800' : 'text-gray-400'
                    )}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active dot indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.05 }}
                        className={cn(
                          'absolute bottom-0 w-6 h-0.5 rounded-full',
                          `bg-gradient-to-r ${item.activeGradient}`
                        )}
                      />
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

// Helper to get actual hex colors from gradient class names
function getActiveColor(gradient: string, position: 'start' | 'end'): string {
  const colorMap: Record<string, string> = {
    'from-brand-500': '#FF6B00',
    'to-orange-400': '#FB923C',
    'from-blue-500': '#3B82F6',
    'to-cyan-400': '#22D3EE',
    'from-purple-500': '#A855F7',
    'to-pink-500': '#EC4899',
    'from-green-500': '#22C55E',
    'to-emerald-400': '#34D399',
    'from-gray-600': '#4B5563',
    'to-gray-500': '#6B7280',
  }

  const parts = gradient.split(' ')
  const key = position === 'start' ? parts[0] : parts[1]
  return colorMap[key] || '#FF6B00'
}
