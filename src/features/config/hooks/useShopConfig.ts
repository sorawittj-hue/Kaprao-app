import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import * as configApi from '../api/configApi'

export function useShopConfig<T>(key: string) {
  return useQuery({
    queryKey: queryKeys.config.byKey(key),
    queryFn: () => configApi.getShopConfig<T>(key),
    staleTime: 5 * 60 * 1000,
  })
}

export function useContactInfo() {
  return useQuery({
    queryKey: queryKeys.config.contact(),
    queryFn: configApi.getContactInfo,
    staleTime: 5 * 60 * 1000,
  })
}

export function useShopHours() {
  return useQuery({
    queryKey: queryKeys.config.hours(),
    queryFn: configApi.getShopHours,
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrderLimits() {
  return useQuery({
    queryKey: queryKeys.config.limits(),
    queryFn: configApi.getOrderLimits,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePaymentConfig() {
  return useQuery({
    queryKey: queryKeys.config.payment(),
    queryFn: configApi.getPaymentConfig,
    staleTime: 5 * 60 * 1000,
  })
}

export function useIsShopOpen() {
  return useQuery({
    queryKey: queryKeys.config.isOpen(),
    queryFn: configApi.isShopOpen,
    refetchInterval: 60 * 1000, // Check every minute
  })
}

export function useNextOpeningTime() {
  return useQuery({
    queryKey: queryKeys.config.nextOpening(),
    queryFn: configApi.getNextOpeningTime,
  })
}

export function useUpdateShopConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      configApi.updateShopConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.config.all() })
    },
  })
}
