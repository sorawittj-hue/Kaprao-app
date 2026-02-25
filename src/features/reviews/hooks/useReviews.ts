import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import * as reviewApi from '../api/reviewApi'

export function useReviews(menuItemId?: number) {
  return useQuery({
    queryKey: queryKeys.reviews.list(menuItemId),
    queryFn: () => reviewApi.getReviews(menuItemId),
  })
}

export function useReviewByOrder(orderId?: number) {
  return useQuery({
    queryKey: queryKeys.reviews.byOrder(orderId || 0),
    queryFn: () => reviewApi.getReviewByOrderId(orderId!),
    enabled: !!orderId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() })
    },
  })
}

export function useMenuItemRating(menuItemId?: number) {
  return useQuery({
    queryKey: queryKeys.reviews.stats(menuItemId || 0),
    queryFn: () => reviewApi.getMenuItemRating(menuItemId!),
    enabled: !!menuItemId,
  })
}
