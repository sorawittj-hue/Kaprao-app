import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, History, TrendingUp, X, Sparkles } from 'lucide-react'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { cn } from '@/utils/cn'

interface SearchSuggestion {
  type: 'recent' | 'popular' | 'suggestion'
  text: string
  menuItemId?: number
}

interface SearchBarWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export function SearchBarWithSuggestions({
  value,
  onChange,
  onClear,
  placeholder = 'ค้นหาเมนูอาหาร...',
}: SearchBarWithSuggestionsProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const { data: menuItems } = useMenuItems()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kaprao_recent_searches')
    if (saved) {
      try {
        const searches = JSON.parse(saved) as SearchSuggestion[]
        setRecentSearches(searches.slice(0, 5))
      } catch (e) {
        console.error('Error loading recent searches:', e)
      }
    }

    // Popular searches (hardcoded for now)
    setPopularSearches([
      { type: 'popular', text: 'กะเพราหมูสับ', menuItemId: 1 },
      { type: 'popular', text: 'กะเพราไก่', menuItemId: 2 },
      { type: 'popular', text: 'ไข่เจียว', menuItemId: 5 },
      { type: 'popular', text: 'ต้มยำ', menuItemId: 10 },
    ])
  }, [])

  // Generate suggestions based on input
  useEffect(() => {
    if (!value.trim() || !menuItems) {
      setSuggestions([])
      return
    }

    const filtered = menuItems
      .filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description?.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5)
      .map(item => ({
        type: 'suggestion' as const,
        text: item.name,
        menuItemId: item.id,
      }))

    setSuggestions(filtered)
  }, [value, menuItems])

  // Save to recent searches
  const saveToRecent = useCallback((text: string, menuItemId?: number) => {
    const newSearch: SearchSuggestion = {
      type: 'recent',
      text,
      menuItemId,
    }

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.text !== text)
      const updated = [newSearch, ...filtered].slice(0, 5)
      localStorage.setItem('kaprao_recent_searches', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Clear recent search
  const clearRecentSearch = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRecentSearches(prev => {
      const updated = prev.filter(s => s.text !== text)
      localStorage.setItem('kaprao_recent_searches', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Clear all recent searches
  const clearAllRecent = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem('kaprao_recent_searches')
  }, [])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    onChange(suggestion.text)
    saveToRecent(suggestion.text, suggestion.menuItemId)
    inputRef.current?.blur()
  }, [onChange, saveToRecent])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showDropdown = isFocused && (recentSearches.length > 0 || popularSearches.length > 0 || suggestions.length > 0 || !value.trim())

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className={cn(
        'relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-300',
        isFocused
          ? 'border-brand-500 bg-white shadow-lg shadow-brand-500/10'
          : 'border-gray-200 bg-gray-50'
      )}>
        <Search className={cn(
          'w-5 h-5 flex-shrink-0 transition-colors',
          isFocused ? 'text-brand-500' : 'text-gray-400'
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
        />

        {value && (
          <button
            onClick={onClear}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && !value.trim() && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <History className="w-3.5 h-3.5" />
                    ค้นหาเร็วๆ นี้
                  </div>
                  <button
                    onClick={clearAllRecent}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ลบทั้งหมด
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={search.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer group"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <History className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-gray-700">{search.text}</span>
                    <button
                      onClick={(e) => clearRecentSearch(search.text, e)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-all"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && !value.trim() && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  ยอดนิยม
                </div>
                {popularSearches.map((search, index) => (
                  <motion.div
                    key={search.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                    <span className="flex-1 text-gray-700">{search.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  แนะนำ
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="w-4 h-4 text-brand-500" />
                    <span className="flex-1 text-gray-700">{suggestion.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {value.trim() && suggestions.length === 0 && menuItems && menuItems.length > 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                ไม่พบผลลัพธ์สำหรับ "{value}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
