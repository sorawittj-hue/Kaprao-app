import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store'
import { logout } from '@/lib/auth'
import { cn } from '@/utils/cn'
import { 
  LayoutDashboard, 
  Utensils, 
  Users, 
  Store, 
  LogOut,
  Menu,
  Loader2,
  Bell,
  BarChart3,
  ChefHat,
  Package,
  Settings
} from 'lucide-react'
import { useAdminStats } from '@/features/admin/hooks/useAdmin'
import { subscribeToOrders } from '@/features/admin/hooks/useAdmin'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryClient'

interface NavItem {
  path: string
  icon: React.ElementType
  label: string
  exact?: boolean
  badge?: number
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [notifications, setNotifications] = useState<{ id: number; message: string; time: string }[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useAuthStore()
  
  const { data: stats } = useAdminStats()

  // Check admin status — require LINE-authenticated user
  useEffect(() => {
    if (!user?.lineUserId) {
      setIsAdmin(false)
      return
    }

    // Check admin via env-based allowlist
    const adminIds = (import.meta.env.VITE_ADMIN_LINE_IDS || '').split(',').filter(Boolean)
    // If no admin IDs configured, allow all LINE-authenticated users (dev mode)
    setIsAdmin(adminIds.length === 0 || adminIds.includes(user.lineUserId))
  }, [user?.lineUserId])

  // Subscribe to realtime orders
  useEffect(() => {
    const subscription = subscribeToOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        const newOrder = payload.new as { id: number; customer_name: string }
        setNotifications(prev => [
          { 
            id: newOrder.id, 
            message: `ออเดอร์ใหม่ #${newOrder.id} จาก ${newOrder.customer_name}`,
            time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          },
          ...prev.slice(0, 9)
        ])
        
        // Play notification sound
        const audio = new Audio('/notification.mp3')
        audio.play().catch(() => {})
        
        // Refresh stats
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() })
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders() })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems: NavItem[] = [
    { path: '/admin', icon: LayoutDashboard, label: 'ภาพรวม', exact: true },
    { 
      path: '/admin/orders', 
      icon: Utensils, 
      label: 'ออเดอร์',
      badge: (stats?.pendingOrders || 0) + (stats?.cookingOrders || 0)
    },
    { path: '/admin/menu', icon: ChefHat, label: 'เมนู' },
    { path: '/admin/customers', icon: Users, label: 'ลูกค้า' },
    { path: '/admin/settings', icon: Settings, label: 'ตั้งค่า' },
  ]

  const secondaryNavItems: NavItem[] = [
    { path: '/', icon: Store, label: 'กลับไปหน้าร้าน' },
  ]

  // Get page title
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/admin') return 'ภาพรวมร้านค้า'
    if (path === '/admin/orders') return 'จัดการออเดอร์'
    if (path === '/admin/menu') return 'จัดการเมนู'
    if (path === '/admin/customers') return 'จัดการลูกค้า'
    if (path === '/admin/settings') return 'ตั้งค่าร้านค้า'
    return 'Admin Panel'
  }

  // Show loading state only briefly
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative inset-y-0 left-0 w-72 bg-gray-900 text-white z-30 transition-transform duration-300 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl mr-3">
            K
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight">KAPRAO52</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">
            เมนูหลัก
          </p>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all relative",
                  isActive
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="absolute right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}

          <div className="mt-8 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            ระบบ
          </div>
          
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-lg font-bold">
              {user?.displayName?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{user?.displayName || 'Admin'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xs text-green-400 font-medium">ออนไลน์</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{getPageTitle()}</h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">การแจ้งเตือน</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            เคลียร์ทั้งหมด
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                navigate('/admin/orders')
                                setShowNotifications(false)
                              }}
                              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Package className="w-4 h-4 text-brand-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                                  <p className="text-xs text-gray-400">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4 text-sm">
              {stats && (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <Package className="w-4 h-4" />
                    <span className="font-bold">{stats.pendingOrders}</span>
                    <span className="text-xs">รอดำเนินการ</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-bold">{formatPrice(stats.todayRevenue)}</span>
                    <span className="text-xs">วันนี้</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function formatPrice(price: number): string {
  return `฿${price.toLocaleString('th-TH')}`
}
