import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartDrawer } from '@/features/cart/components/CartDrawer'
import { GlobalLoadingBar } from '@/components/ui/GlobalLoadingBar'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Skip to content for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-brand-500 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      {/* Global Loading Bar */}
      <GlobalLoadingBar />

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-[#FAFAF9]" aria-hidden="true" />

      {/* Main content */}
      <main id="main-content" className="pb-24 safe-area-x" tabIndex={-1}>
        <Outlet />
      </main>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
