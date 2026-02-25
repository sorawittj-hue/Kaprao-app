import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import * as paymentApi from '../api/paymentApi'
import type { PaymentSlipData } from '../api/paymentApi'

// Shop Config Queries
export function useContactInfo() {
  return useQuery({
    queryKey: queryKeys.config.contact(),
    queryFn: paymentApi.getContactInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePaymentConfig() {
  return useQuery({
    queryKey: queryKeys.config.payment(),
    queryFn: paymentApi.getPaymentConfig,
    staleTime: 5 * 60 * 1000,
  })
}

// Payment Status
export function usePaymentStatus(orderId: number) {
  return useQuery({
    queryKey: queryKeys.payment.status(orderId),
    queryFn: () => paymentApi.getPaymentStatus(orderId),
    enabled: orderId > 0,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// Upload Slip Mutation
export function useUploadSlip() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, file }: { orderId: number; file: File }) =>
      paymentApi.uploadPaymentSlip(orderId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payment.status(variables.orderId)
      })
    },
  })
}

// Admin: Verify Payment
export function useVerifyPayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, slipData }: { orderId: number; slipData?: PaymentSlipData }) =>
      paymentApi.verifyPayment(orderId, slipData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payment.status(variables.orderId)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.orderId)
      })
    },
  })
}

// Admin: Reject Payment
export function useRejectPayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: number; reason: string }) =>
      paymentApi.rejectPayment(orderId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.payment.status(variables.orderId)
      })
    },
  })
}

// Hook for QR generation
export function usePromptPayQR(amount: number) {
  const { data: config } = usePaymentConfig()
  
  if (!config?.promptpay_number) return null
  
  return paymentApi.generatePromptPayQR(amount, config.promptpay_number)
}
