import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { GlobalLoadingBar } from '@/components/ui/GlobalLoadingBar'
import { pageTransition } from '@/animations/variants'

export function RootLayout() {
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  return (
    <div className="min-h-screen bg-surface">
      {/* Global Loading Bar */}
      <GlobalLoadingBar />

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#FDFBF7] via-[#FFFBF2] to-[#FFF0E6]" />
      <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Main content */}
      <main className="pb-24 safe-area-x">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            exit="exit"
            variants={pageTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
