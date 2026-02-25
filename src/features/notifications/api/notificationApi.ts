import { supabase } from '@/lib/supabase'
import type { Notification, NotificationType } from '../types'

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw new Error(error.message)
  return (data || []) as unknown as Notification[]
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) throw new Error(error.message)
  return count || 0
}

export async function markAsRead(notificationId: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
  
  if (error) throw new Error(error.message)
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) throw new Error(error.message)
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
  
  if (error) throw new Error(error.message)
}

// Push Token Management
export async function savePushToken(
  token: string, 
  platform: 'web' | 'ios' | 'android'
): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('push_tokens')
    .upsert({
      user_id: userId,
      token,
      platform,
      is_active: true,
      last_used: new Date().toISOString()
    }, {
      onConflict: 'token'
    })
  
  if (error) throw new Error(error.message)
}

export async function deactivatePushToken(token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('token', token)
  
  if (error) throw new Error(error.message)
}

// Admin: Send notification
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      sent_via: ['app']
    })
  
  if (error) throw new Error(error.message)
}

// Subscribe to real-time notifications
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Notification)
      }
    )
    .subscribe()
}
