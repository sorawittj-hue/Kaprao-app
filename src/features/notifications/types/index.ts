export type NotificationType = 
  | 'order_status'
  | 'payment_received'
  | 'payment_verified'
  | 'order_ready'
  | 'promotion'
  | 'reminder'
  | 'system'

export interface Notification {
  id: number
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: {
    orderId?: number
    status?: string
    [key: string]: unknown
  }
  is_read: boolean
  read_at?: string
  sent_via: string[]
  created_at: string
}

export interface PushToken {
  id: number
  user_id: string
  token: string
  platform: 'web' | 'ios' | 'android'
  is_active: boolean
  last_used: string
  created_at: string
}
