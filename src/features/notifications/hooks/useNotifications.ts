import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import * as notificationApi from '../api/notificationApi'

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.list(userId || ''),
    queryFn: () => notificationApi.getNotifications(userId!),
    enabled: !!userId,
  })
}

export function useUnreadCount(userId?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.unread(userId || ''),
    queryFn: () => notificationApi.getUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    },
  })
}

export function useSavePushToken() {
  return useMutation({
    mutationFn: ({ token, platform }: { token: string; platform: 'web' | 'ios' | 'android' }) =>
      notificationApi.savePushToken(token, platform),
  })
}
