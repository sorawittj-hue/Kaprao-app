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
  order_status: 'bg-blue-100 text-blue-600',
  payment_received: 'bg-amber-100 text-amber-600',
  payment_verified: 'bg-green-100 text-green-600',
  order_ready: 'bg-emerald-100 text-emerald-600',
  promotion: 'bg-pink-100 text-pink-600',
  reminder: 'bg-gray-100 text-gray-600',
  system: 'bg-gray-100 text-gray-600',
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

  // Close dropdown when clicking outside
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

    // Navigate based on notification type
    if (notification.data?.orderId) {
      navigate(`/orders/${notification.data.orderId}`)
    }

    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {(unreadCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount !== undefined && unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">การแจ้งเตือน</h3>
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate(user!.id)}
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications?.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ไม่มีการแจ้งเตือน</p>
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
                      className={cn(
                        'p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group',
                        !notification.is_read && 'bg-blue-50/30'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                          colorMap[notification.type]
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <p className={cn(
                            'text-sm text-gray-800 line-clamp-2',
                            !notification.is_read && 'font-medium'
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead.mutate(notification.id)
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification.mutate(notification.id)
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
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
