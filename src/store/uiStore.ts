import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ModalState, Toast } from '@/types'

// Maximum number of toasts to show at once
const MAX_TOASTS = 3

interface UIState {
  // Drawer states
  isCartOpen: boolean
  isMenuOpen: boolean
  isProfileOpen: boolean

  // Modal state
  modal: ModalState

  // Toast queue
  toasts: Toast[]

  // Bottom sheet
  activeSheet: string | null
  sheetData: unknown

  // Global loading
  isGlobalLoading: boolean
  loadingMessage: string

  // Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  openModal: (type: ModalState['type'], data?: unknown) => void
  closeModal: () => void

  openSheet: (sheet: string, data?: unknown) => void
  closeSheet: () => void

  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  setGlobalLoading: (loading: boolean, message?: string) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      isCartOpen: false,
      isMenuOpen: false,
      isProfileOpen: false,
      modal: { isOpen: false, type: null },
      toasts: [],
      activeSheet: null,
      sheetData: null,
      isGlobalLoading: false,
      loadingMessage: '',

      // Cart actions
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      // Modal actions
      openModal: (type, data) => set({ modal: { isOpen: true, type, data } }),
      closeModal: () => set({ modal: { isOpen: false, type: null, data: null } }),

      // Sheet actions
      openSheet: (sheet, data) => set({ activeSheet: sheet, sheetData: data }),
      closeSheet: () => set({ activeSheet: null, sheetData: null }),

      // Toast actions
      addToast: (toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        const duration = toast.duration || 4000
        const newToast: Toast = { ...toast, id, duration }

        set((state) => ({
          toasts: state.toasts.length >= MAX_TOASTS
            ? [...state.toasts.slice(1), newToast]
            : [...state.toasts, newToast]
        }))

        // Auto-remove toast with cleanup
        setTimeout(() => {
          const currentToasts = useUIStore.getState().toasts
          if (currentToasts.find(t => t.id === id)) {
            useUIStore.getState().removeToast(id)
          }
        }, duration)
      },
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      // Loading actions
      setGlobalLoading: (loading, message = '') =>
        set({ isGlobalLoading: loading, loadingMessage: message }),
    }),
    { name: 'UIStore' }
  )
)
