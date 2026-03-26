import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useUIStore } from '@/store'
import type { Order } from '@/types'

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Send browser notification
export function sendBrowserNotification(title: string, options: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    })

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }
}

// Order status messages
const orderStatusMessages: Record<string, { title: string; body: string }> = {
  placed: {
    title: 'ยืนยันการสั่งซื้อ',
    body: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว',
  },
  confirmed: {
    title: 'ร้านอาหารยืนยัน',
    body: 'ร้านอาหารยืนยันออเดอร์ของคุณแล้ว',
  },
  preparing: {
    title: 'กำลังเตรียมอาหาร',
    body: 'พ่อครัวกำลังเตรียมอาหารของคุณ',
  },
  ready: {
    title: 'อาหารพร้อมรับ',
    body: 'อาหารของคุณพร้อมแล้ว!',
  },
  delivered: {
    title: 'ส่งอาหารแล้ว',
    body: 'อาหารของคุณถูกส่งแล้ว',
  },
  cancelled: {
    title: 'ยกเลิกออเดอร์',
    body: 'ออเดอร์ของคุณถูกยกเลิก',
  },
}

// Subscribe to order updates
export function useOrderNotifications() {
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()

  const showOrderNotification = useCallback((order: Order, newStatus: string) => {
    const message = orderStatusMessages[newStatus] || {
      title: 'อัปเดตออเดอร์',
      body: `สถานะออเดอร์เปลี่ยนเป็น ${newStatus}`,
    }

    // Show toast
    addToast({
      type: 'info',
      title: message.title,
      message: message.body,
      duration: 5000,
    })

    // Show browser notification
    sendBrowserNotification(`🍛 ${message.title}`, {
      body: message.body,
      tag: `order-${order.id}`,
      requireInteraction: false,
    })

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }, [addToast])

  useEffect(() => {
    if (!user?.id && !isGuest) return

    // Request notification permission
    requestNotificationPermission()

    // Subscribe to order updates
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `${user?.id ? 'user_id' : 'guest_id'}=eq.${user?.id || (localStorage.getItem('kaprao_guest_identity') ? JSON.parse(localStorage.getItem('kaprao_guest_identity')!).id : null)}`,
        },
        ({ new: newRecord }: { new: any }) => {
          const oldStatus = newRecord.previous_status
          const newStatus = newRecord.status

          if (oldStatus !== newStatus) {
            showOrderNotification(newRecord as Order, newStatus)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, isGuest, showOrderNotification])
}

// Send LINE notification (via LINE OA)
export async function sendLineNotification(
  message: {
    type: 'order_status' | 'lottery_win' | 'promotion'
    title: string
    body: string
    imageUrl?: string
    actionUrl?: string
  }
) {
  try {
    // This would typically call a Cloud Function that sends to LINE Messaging API
    console.log('📱 Sending LINE notification:', message)
    
    // Example implementation (requires backend):
    // await fetch('/api/notify/line', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     userId,
    //     ...message,
    //   }),
    // })
  } catch (error) {
    console.error('Error sending LINE notification:', error)
  }
}

// Push notification for lottery results
export async function scheduleLotteryNotification(drawDate: string) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // Your VAPID public key
          'YOUR_VAPID_PUBLIC_KEY'
        ),
      })

      // Send subscription to backend
      console.log('Push subscription:', subscription)
      
      // Backend would send notification on draw date
      console.log('Scheduled lottery notification for:', drawDate)
    } catch (error) {
      console.error('Error subscribing to push:', error)
    }
  }
}

// Helper function for VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Daily reminder notification
export function scheduleDailyReminder(hour: number = 11) {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hour, 0, 0, 0)

    if (now > reminderTime) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime()

    setTimeout(() => {
      sendBrowserNotification('🍛 ถึงเวลาอาหาร!', {
        body: 'หิวหรือยัง? สั่งกะเพราอร่อยๆ กันเถอะ!',
        icon: '/icons/icon-192x192.png',
        tag: 'daily-reminder',
      })
      
      // Schedule next day
      scheduleDailyReminder(hour)
    }, timeUntilReminder)
  }
}
