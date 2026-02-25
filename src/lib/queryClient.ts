import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Query keys factory for type-safe queries
export const queryKeys = {
  menu: {
    all: () => ['menu'] as const,
    list: () => [...queryKeys.menu.all(), 'list'] as const,
    byCategory: (category: string) => [...queryKeys.menu.all(), 'category', category] as const,
    detail: (id: number) => [...queryKeys.menu.all(), 'detail', id] as const,
  },
  orders: {
    all: () => ['orders'] as const,
    list: () => [...queryKeys.orders.all(), 'list'] as const,
    byUser: (userId: string) => [...queryKeys.orders.all(), 'user', userId] as const,
    detail: (id: number) => [...queryKeys.orders.all(), 'detail', id] as const,
    active: (userId: string) => [...queryKeys.orders.all(), 'active', userId] as const,
    canCancel: (id: number) => [...queryKeys.orders.all(), 'canCancel', id] as const,
  },
  user: {
    all: () => ['user'] as const,
    profile: (userId: string) => [...queryKeys.user.all(), 'profile', userId] as const,
    points: (userId: string) => [...queryKeys.user.all(), 'points', userId] as const,
    history: (userId: string) => [...queryKeys.user.all(), 'history', userId] as const,
  },
  lottery: {
    all: () => ['lottery'] as const,
    tickets: (userId: string) => [...queryKeys.lottery.all(), 'tickets', userId] as const,
    results: () => [...queryKeys.lottery.all(), 'results'] as const,
  },
  admin: {
    all: () => ['admin'] as const,
    orders: () => [...queryKeys.admin.all(), 'orders'] as const,
    stats: () => [...queryKeys.admin.all(), 'stats'] as const,
    customers: () => [...queryKeys.admin.all(), 'customers'] as const,
  },
  ai: {
    recommendations: (userId: string) => ['ai', 'recommendations', userId] as const,
  },
  shopConfig: {
    all: () => ['shopConfig'] as const,
    config: (key: string) => [...queryKeys.shopConfig.all(), key] as const,
    contact: () => [...queryKeys.shopConfig.all(), 'contact'] as const,
    hours: () => [...queryKeys.shopConfig.all(), 'hours'] as const,
    orderLimits: () => [...queryKeys.shopConfig.all(), 'orderLimits'] as const,
    payment: () => [...queryKeys.shopConfig.all(), 'payment'] as const,
    status: () => [...queryKeys.shopConfig.all(), 'status'] as const,
  },
  coupons: {
    all: () => ['coupons'] as const,
    list: () => [...queryKeys.coupons.all(), 'list'] as const,
    available: () => [...queryKeys.coupons.all(), 'available'] as const,
    history: (userId: string) => [...queryKeys.coupons.all(), 'history', userId] as const,
    detail: (id: number) => [...queryKeys.coupons.all(), 'detail', id] as const,
    stats: (id: number) => [...queryKeys.coupons.all(), 'stats', id] as const,
  },
  payment: {
    all: () => ['payment'] as const,
    status: (orderId: number) => [...queryKeys.payment.all(), 'status', orderId] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all(), 'list', userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.all(), 'unread', userId] as const,
  },
  config: {
    all: () => ['config'] as const,
    byKey: (key: string) => [...queryKeys.config.all(), key] as const,
    contact: () => [...queryKeys.config.all(), 'contact'] as const,
    hours: () => [...queryKeys.config.all(), 'hours'] as const,
    limits: () => [...queryKeys.config.all(), 'limits'] as const,
    payment: () => [...queryKeys.config.all(), 'payment'] as const,
    isOpen: () => [...queryKeys.config.all(), 'isOpen'] as const,
    nextOpening: () => [...queryKeys.config.all(), 'nextOpening'] as const,
  },
  reviews: {
    all: () => ['reviews'] as const,
    list: (menuItemId?: number) => [...queryKeys.reviews.all(), 'list', menuItemId || 'all'] as const,
    byOrder: (orderId: number) => [...queryKeys.reviews.all(), 'order', orderId] as const,
    stats: (menuItemId: number) => [...queryKeys.reviews.all(), 'stats', menuItemId] as const,
    admin: () => [...queryKeys.reviews.all(), 'admin'] as const,
  },
  inventory: {
    all: () => ['inventory'] as const,
    list: () => [...queryKeys.inventory.all(), 'list'] as const,
    lowStock: () => [...queryKeys.inventory.all(), 'lowStock'] as const,
    ingredients: (menuItemId: number) => [...queryKeys.inventory.all(), 'ingredients', menuItemId] as const,
  },
} as const
