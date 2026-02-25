import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { CategoryType } from '@/types'

interface MenuState {
  // UI State
  activeCategory: CategoryType
  searchQuery: string
  isSearchOpen: boolean
  viewedItemIds: number[]
  favorites: number[]
  
  // Actions
  setActiveCategory: (category: CategoryType) => void
  setSearchQuery: (query: string) => void
  toggleSearch: () => void
  openSearch: () => void
  closeSearch: () => void
  
  // View tracking (for AI recommendations)
  addViewedItem: (itemId: number) => void
  
  // Favorites
  toggleFavorite: (itemId: number) => void
  isFavorite: (itemId: number) => boolean
}

export const useMenuStore = create<MenuState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        activeCategory: 'kaprao',
        searchQuery: '',
        isSearchOpen: false,
        viewedItemIds: [],
        favorites: [],
        
        // Actions
        setActiveCategory: (category) => set({ activeCategory: category }),
        
        setSearchQuery: (query) => set({ searchQuery: query }),
        
        toggleSearch: () =>
          set((state) => ({ isSearchOpen: !state.isSearchOpen })),
        
        openSearch: () => set({ isSearchOpen: true }),
        
        closeSearch: () => set({ isSearchOpen: false, searchQuery: '' }),
        
        addViewedItem: (itemId) =>
          set((state) => ({
            viewedItemIds: [...new Set([...state.viewedItemIds, itemId])],
          })),
        
        toggleFavorite: (itemId) =>
          set((state) => ({
            favorites: state.favorites.includes(itemId)
              ? state.favorites.filter((id) => id !== itemId)
              : [...state.favorites, itemId],
          })),
        
        isFavorite: (itemId) => get().favorites.includes(itemId),
      }),
      {
        name: 'kaprao52-menu-storage',
        partialize: (state) => ({
          viewedItemIds: state.viewedItemIds.slice(-50), // Keep last 50
          favorites: state.favorites,
        }),
      }
    ),
    { name: 'MenuStore' }
  )
)
