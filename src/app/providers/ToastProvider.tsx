import { useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store'
import { Toast } from '@/components/ui/Toast'

interface ToastProviderProps {
  children: React.ReactNode
}

// Maximum number of toasts to show at once
const MAX_TOASTS = 3

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, removeToast } = useUIStore()

  // Auto-remove old toasts when exceeding max
  useEffect(() => {
    if (toasts.length > MAX_TOASTS) {
      // Remove oldest toasts
      const toastsToRemove = toasts.slice(0, toasts.length - MAX_TOASTS)
      toastsToRemove.forEach(toast => {
        removeToast(toast.id)
      })
    }
  }, [toasts, removeToast])

  // Handle keyboard shortcut to dismiss all (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        toasts.forEach(toast => removeToast(toast.id))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toasts, removeToast])

  // Get visible toasts (limited to MAX_TOASTS)
  const visibleToasts = toasts.slice(-MAX_TOASTS)

  return (
    <>
      {children}

      {/* Toast Container - Top Right */}
      <div
        className="fixed top-0 right-0 z-[150] flex flex-col items-end gap-2 p-4 pt-safe pointer-events-none max-w-md w-full ml-auto"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {visibleToasts.map((toast, index) => (
            <div
              key={toast.id}
              className="pointer-events-auto"
              style={{
                transform: `scale(${1 - (visibleToasts.length - 1 - index) * 0.05})`,
                opacity: 1 - (visibleToasts.length - 1 - index) * 0.2,
                zIndex: index
              }}
            >
              <Toast toast={toast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

// Hook for easy toast access
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const { addToast, removeToast } = useUIStore()

  const toast = useCallback((
    type: 'success' | 'error' | 'info' | 'cart-add',
    title: string,
    message?: string,
    options?: { duration?: number; imageUrl?: string }
  ) => {
    addToast({
      type,
      title,
      message,
      ...options,
    })
  }, [addToast])

  const showToast = useCallback(({
    type,
    title,
    message,
    duration,
    imageUrl,
  }: {
    type: 'success' | 'error' | 'info' | 'cart-add'
    title: string
    message?: string
    duration?: number
    imageUrl?: string
  }) => {
    addToast({
      type,
      title,
      message,
      duration,
      imageUrl,
    })
  }, [addToast])

  const success = useCallback((title: string, message?: string) => {
    toast('success', title, message)
  }, [toast])

  const error = useCallback((title: string, message?: string) => {
    toast('error', title, message)
  }, [toast])

  const info = useCallback((title: string, message?: string) => {
    toast('info', title, message)
  }, [toast])

  const cartAdd = useCallback((title: string, message?: string, imageUrl?: string) => {
    toast('cart-add', title, message, { imageUrl })
  }, [toast])

  return {
    toast,
    showToast,
    success,
    error,
    info,
    cartAdd,
    remove: removeToast,
  }
}
