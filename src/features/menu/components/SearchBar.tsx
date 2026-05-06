import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useMenuStore } from '@/store'

export function SearchBar() {
  const { isSearchOpen, toggleSearch, setSearchQuery, closeSearch } = useMenuStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  const handleSearch = (value: string) => {
    setQuery(value)
    setSearchQuery(value)
  }

  const handleClose = () => {
    setQuery('')
    closeSearch()
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isSearchOpen ? (
          <motion.button
            key="search-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSearch}
            aria-label="เปิดช่องค้นหาเมนู"
            aria-expanded={isSearchOpen}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            style={{
              background: 'white',
              boxShadow: '0 2px 10px -2px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Search aria-hidden="true" style={{ width: 18, height: 18 }} />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 44, opacity: 0 }}
            animate={{ width: 210, opacity: 1 }}
            exit={{ width: 44, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative"
          >
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') handleClose() }}
              placeholder="ค้นหาเมนู..."
              aria-label="ค้นหาเมนู"
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none"
              style={{
                background: 'white',
                border: `2px solid ${query ? '#FF6B00' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: query
                  ? '0 0 0 3px rgba(255, 107, 0, 0.12)'
                  : '0 2px 10px -2px rgba(0,0,0,0.08)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: query ? '#FF6B00' : '#9CA3AF' }}
            />
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => handleSearch('')}
                aria-label="ล้างคำค้นหา"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </motion.button>
            )}
            {!query && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="ปิดช่องค้นหา"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
