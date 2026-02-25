import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { fetchMenuItems, fetchMenuByCategory, searchMenuItems } from '../api/menuApi'
import type { CategoryType } from '@/types'

export function useMenuItems() {
  return useQuery({
    queryKey: queryKeys.menu.list(),
    queryFn: fetchMenuItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMenuByCategory(category: CategoryType) {
  return useQuery({
    queryKey: queryKeys.menu.byCategory(category),
    queryFn: () => fetchMenuByCategory(category),
    enabled: category !== 'favorites',
    staleTime: 5 * 60 * 1000,
  })
}

export function useSearchMenu(query: string) {
  return useQuery({
    queryKey: [...queryKeys.menu.all(), 'search', query],
    queryFn: () => searchMenuItems(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  })
}
