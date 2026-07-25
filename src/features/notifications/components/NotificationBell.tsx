import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, Package, CreditCard, Gift, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks/useNotifications'
import { useAuthStore } from '@/store'
import { formatRelativeTime } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import type { Notification, NotificationType } from '../types'

const iconMap: Record<NotificationType, typeof Package> = {
  order_status: Package,
  payment_received: CreditCard,
  payment_verified: Check,
  order_ready: Package,
  promotion: Gift,
  reminder: Info,
  system: Info,
}

const colorMap: Record<NotificationType, string> = {
  order_status: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  payment_received: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  payment_verified: 'bg-green-500/20 text-green-400 border-green-500/30',
  order_ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  promotion: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  reminder: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  system: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: notifications } = useNotifications(user?.id)
  const { data: unreadCount } = useUnreadCount(user?.id)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id)
    }
    if (notification.data?.orderId) {
      navigate(`/orders/${notification.data.orderId}`)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="การแจ้งเตือน"
        className="relative w-10 h-10 rounded-[16px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          color: 'var(--text-secondary)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
        }}
      >
        <Bell className="w-4.5 h-4.5" />
        {(unreadCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4.5 h-4.5 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0D0D0F]"
            style={{
              background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
              boxShadow: '0 2px 8px rgba(255,58,0,0.5)',
            }}
          >
            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-[24px] overflow-hidden z-50"
            style={{
              background: 'rgba(20, 20, 24, 0.96)',
              backdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,94,0,0.1)',
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="font-black text-sm text-white">การแจ้งเตือน</h3>
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate(user!.id)}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto hide-scrollbar">
              {notifications?.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                notifications?.map((notification) => {
                  const Icon = iconMap[notification.type]
                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'p-3.5 border-b border-white/5 cursor-pointer transition-colors flex items-start gap-3',
                        !notification.is_read ? 'bg-orange-500/10' : 'hover:bg-white/5'
                      )}
                    >
                      <div className={cn('p-2 rounded-xl border flex-shrink-0', colorMap[notification.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{notification.title}</p>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{notification.message}</p>
                        <p className="text-[9px] text-gray-500 font-medium mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification.mutate(notification.id)
                        }}
                        className="text-gray-600 hover:text-gray-400 p-1"
                        aria-label="ลบการแจ้งเตือน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
