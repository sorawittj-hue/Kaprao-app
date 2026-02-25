import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean  // true = logged in with LINE (has lineUserId)
  isGuest: boolean          // true = explicitly in guest mode (no login)
  error: string | null
  _hasHydrated: boolean

  // Actions
  setUser: (user: User | null) => void
  setGuest: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  updatePoints: (points: number) => void
  incrementOrderCount: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isLoading: true,
        isAuthenticated: false,
        isGuest: false,
        error: null,
        _hasHydrated: false,

        // Actions

        // setUser: called when we have a real user object (LINE or anonymous)
        // isAuthenticated = true only if they have a LINE ID
        // isGuest = false always when setUser is called (they have some identity)
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!(user && user.lineUserId),
            isGuest: false, // Having any user object = NOT in pure guest mode
            isLoading: false,
            error: null,
          }),

        // setGuest: called when user explicitly chose guest or has no session
        setGuest: () =>
          set({
            user: null,
            isAuthenticated: false,
            isGuest: true,
            isLoading: false,
            error: null,
          }),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error, isLoading: false }),

        logout: () => {
          try {
            sessionStorage.removeItem('kaprao_guest_mode')
            sessionStorage.removeItem('pending_guest_order_id')
            sessionStorage.removeItem('pending_guest_tracking_token')
          } catch (_) { /* noop */ }
          set({
            user: null,
            isAuthenticated: false,
            isGuest: false,
            isLoading: false,
            error: null,
          })
        },

        updatePoints: (points) =>
          set((state) => ({
            user: state.user ? { ...state.user, points } : null,
          })),

        incrementOrderCount: () =>
          set((state) => ({
            user: state.user
              ? {
                ...state.user,
                totalOrders: (state.user.totalOrders || 0) + 1,
              }
              : null,
          })),

        setHasHydrated: (state) => set({ _hasHydrated: state }),
      }),
      {
        name: 'kaprao52-auth-storage',
        partialize: (state) => ({
          user: state.user,
          isGuest: state.isGuest,
        }),
        onRehydrateStorage: () => (state) => {
          console.log('💧 Auth store rehydrated')
          if (state) {
            state.setHasHydrated(true)
          }
        },
      }
    ),
    { name: 'AuthStore' }
  )
)
