import { useQuery } from '@tanstack/react-query'
import { estimateDeliveryTime } from '@/lib/ai'

export function useDeliveryEstimate(activeOrdersCount: number) {
  const timeOfDay = new Date().getHours() + new Date().getMinutes() / 60

  return useQuery({
    queryKey: ['delivery-estimate', activeOrdersCount, timeOfDay],
    queryFn: () => estimateDeliveryTime(activeOrdersCount, timeOfDay),
    staleTime: 60 * 1000, // 1 minute
  })
}
