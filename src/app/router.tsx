import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { lazyWithRetry } from '@/utils/lazyWithRetry'
import { AppProviders } from './providers/AppProviders'
import { RootLayout } from './layout/RootLayout'
import { AdminLayout } from './layout/AdminLayout'
import { PageTransition } from '@/animations/PageTransition'
import { PageLoader } from './PageLoader'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

// Lazy load pages for code splitting with automatic retry on failure
const HomePage = lazyWithRetry(() => import('@/pages/HomePage'))
const CartPage = lazyWithRetry(() => import('@/pages/CartPage'))
const CheckoutPage = lazyWithRetry(() => import('@/pages/CheckoutPage'))
const OrdersPage = lazyWithRetry(() => import('@/pages/OrdersPage'))
const OrderDetailPage = lazyWithRetry(() => import('@/pages/OrderDetailPage'))
const ProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage'))
const LotteryPage = lazyWithRetry(() => import('@/pages/LotteryPage'))
const AdminDashboard = lazyWithRetry(() => import('@/pages/admin/AdminDashboard'))
const AdminOrdersPage = lazyWithRetry(() => import('@/pages/admin/AdminOrdersPage'))
const AdminMenuPage = lazyWithRetry(() => import('@/pages/admin/AdminMenuPage'))
const AdminCustomersPage = lazyWithRetry(() => import('@/pages/admin/AdminCustomersPage'))
const AdminSettingsPage = lazyWithRetry(() => import('@/pages/admin/AdminSettingsPage'))
const PrivacyPolicyPage = lazyWithRetry(() => import('@/pages/legal/PrivacyPolicyPage'))
const TermsOfServicePage = lazyWithRetry(() => import('@/pages/legal/TermsOfServicePage'))

// Wrap component with Suspense, ErrorBoundary, and PageTransition
function withSuspense(Component: React.ComponentType) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <PageTransition>
          <Component />
        </PageTransition>
      </Suspense>
    </ErrorBoundary>
  )
}

export const router = createBrowserRouter(
  [
    {
      element: <AppProviders><Outlet /></AppProviders>,
      children: [
        {
          element: <RootLayout />,
          children: [
            { path: '/', element: withSuspense(HomePage) },
            { path: '/cart', element: withSuspense(CartPage) },
            { path: '/checkout', element: withSuspense(CheckoutPage) },
            { path: '/orders', element: withSuspense(OrdersPage) },
            { path: '/orders/:id', element: withSuspense(OrderDetailPage) },
            { path: '/profile', element: withSuspense(ProfilePage) },
            { path: '/lottery', element: withSuspense(LotteryPage) },
            { path: '/privacy', element: withSuspense(PrivacyPolicyPage) },
            { path: '/terms', element: withSuspense(TermsOfServicePage) },
          ],
        },
        {
          path: '/admin',
          element: <AdminLayout />,
          children: [
            { index: true, element: withSuspense(AdminDashboard) },
            { path: 'orders', element: withSuspense(AdminOrdersPage) },
            { path: 'menu', element: withSuspense(AdminMenuPage) },
            { path: 'customers', element: withSuspense(AdminCustomersPage) },
            { path: 'settings', element: withSuspense(AdminSettingsPage) },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
)
