import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CartItem, CartState, SelectedOption } from '@/types'
import { generateId } from '@/utils/generateId'

interface CartStore extends CartState {
  // Computed
  totalItems: number
  subtotal: number
  finalTotal: number

  // Actions
  addItem: (
    menuItem: CartItem['menuItem'],
    quantity: number,
    selectedOptions: SelectedOption[],
    note?: string
  ) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateNote: (itemId: string, note: string) => void
  clearCart: () => void

  // Coupon
  applyCoupon: (code: string, discountAmount: number) => void
  removeCoupon: () => void

  // Points
  setPointsUsed: (points: number) => void

  // Delivery
  setDeliveryMethod: (method: 'workplace' | 'village') => void
  setSpecialInstructions: (instructions: string) => void

  // Rehydration
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

const calculateItemSubtotal = (
  menuItem: CartItem['menuItem'],
  quantity: number,
  options: SelectedOption[]
): number => {
  const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0)
  return (menuItem.price + optionsTotal) * quantity
}

const computeTotals = (items: CartState['items'], discountAmount: number, pointsUsed: number) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const pointsDiscount = pointsUsed / 10
  const finalTotal = Math.max(0, subtotal - discountAmount - pointsDiscount)
  return { totalItems, subtotal, finalTotal }
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        couponCode: null,
        discountAmount: 0,
        pointsUsed: 0,
        deliveryMethod: 'workplace',
        specialInstructions: '',

        // Computed state - initialized to 0
        totalItems: 0,
        subtotal: 0,
        finalTotal: 0,

        // Hydration state
        _hasHydrated: false,
        setHasHydrated: (state) => set({ _hasHydrated: state }),

        // Actions
        addItem: (menuItem, quantity, selectedOptions, note = '') => {
          console.log('🛒 Adding to cart:', menuItem.name, 'x', quantity)

          set((state) => {
            // Check for existing item with same menuItem ID and same options
            const optionKey = selectedOptions
              .map(o => o.optionId)
              .sort()
              .join(',')
            const existingIndex = state.items.findIndex((item) => {
              const existingKey = item.selectedOptions
                .map(o => o.optionId)
                .sort()
                .join(',')
              return item.menuItem.id === menuItem.id && existingKey === optionKey
            })

            let items: CartItem[]

            if (existingIndex >= 0) {
              // Merge: increment quantity on existing item
              const existing = state.items[existingIndex]
              const newQuantity = existing.quantity + quantity
              const newSubtotal = calculateItemSubtotal(menuItem, newQuantity, selectedOptions)
              const updatedItem = { ...existing, quantity: newQuantity, subtotal: newSubtotal, note: note || existing.note }
              items = [...state.items]
              items[existingIndex] = updatedItem
              console.log('🔄 Merged with existing item, new qty:', newQuantity)
            } else {
              // New item
              const id = generateId()
              const itemSubtotal = calculateItemSubtotal(menuItem, quantity, selectedOptions)
              const newItem: CartItem = {
                id,
                menuItem,
                quantity,
                selectedOptions,
                note,
                subtotal: itemSubtotal,
              }
              items = [...state.items, newItem]
            }

            const totals = computeTotals(items, state.discountAmount, state.pointsUsed)
            console.log('✅ Cart updated:', totals.totalItems, 'items, ฿', totals.finalTotal)
            return {
              items,
              ...totals
            }
          })
        },

        removeItem: (itemId) => {
          console.log('🗑️ Removing item:', itemId)
          set((state) => {
            const items = state.items.filter((item) => item.id !== itemId)
            const totals = computeTotals(items, state.discountAmount, state.pointsUsed)
            console.log('✅ Item removed:', totals.totalItems, 'items remaining')
            return {
              items,
              ...totals
            }
          })
        },

        updateQuantity: (itemId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemId)
            return
          }

          console.log('📝 Updating quantity:', itemId, '→', quantity)
          set((state) => {
            const items = state.items.map((item) => {
              if (item.id === itemId) {
                const newSubtotal = calculateItemSubtotal(
                  item.menuItem,
                  quantity,
                  item.selectedOptions
                )
                return { ...item, quantity, subtotal: newSubtotal }
              }
              return item
            })
            const totals = computeTotals(items, state.discountAmount, state.pointsUsed)
            return {
              items,
              ...totals
            }
          })
        },

        updateNote: (itemId, note) => {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, note } : item
            ),
          }))
        },

        clearCart: () => {
          console.log('🧹 Clearing cart')
          set({
            items: [],
            couponCode: null,
            discountAmount: 0,
            pointsUsed: 0,
            totalItems: 0,
            subtotal: 0,
            finalTotal: 0
          })
        },

        applyCoupon: (code, discountAmount) => {
          console.log('🏷️ Applying coupon:', code, '-฿', discountAmount)
          set((state) => {
            const totals = computeTotals(state.items, discountAmount, state.pointsUsed)
            return {
              couponCode: code,
              discountAmount,
              ...totals
            }
          })
        },

        removeCoupon: () => {
          console.log('❌ Removing coupon')
          set((state) => {
            const totals = computeTotals(state.items, 0, state.pointsUsed)
            return {
              couponCode: null,
              discountAmount: 0,
              ...totals
            }
          })
        },

        setPointsUsed: (points) => {
          console.log('⭐ Using points:', points)
          set((state) => {
            const totals = computeTotals(state.items, state.discountAmount, points)
            return {
              pointsUsed: points,
              ...totals
            }
          })
        },

        setDeliveryMethod: (method) => {
          set({ deliveryMethod: method })
        },

        setSpecialInstructions: (instructions) => {
          set({ specialInstructions: instructions })
        },
      }),
      {
        name: 'kaprao52-cart-storage',
        partialize: (state) => ({
          items: state.items,
          deliveryMethod: state.deliveryMethod,
          couponCode: state.couponCode,
          discountAmount: state.discountAmount,
          pointsUsed: state.pointsUsed,
          specialInstructions: state.specialInstructions,
        }),
        onRehydrateStorage: () => (state) => {
          // Properly recalculate totals after rehydration using set
          if (state) {
            console.log('💧 Cart rehydrating...')
            const totals = computeTotals(state.items, state.discountAmount, state.pointsUsed)
            // Use setTimeout to ensure we're outside the current render cycle
            setTimeout(() => {
              useCartStore.setState({
                ...totals,
                _hasHydrated: true
              })
              console.log('✅ Cart rehydrated:', totals.totalItems, 'items, ฿', totals.finalTotal)
            }, 0)
          }
        },
      }
    ),
    { name: 'CartStore' }
  )
)
