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
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSearch}
            aria-label="เปิดช่องค้นหาเมนู"
            aria-expanded={isSearchOpen}
            className="w-10 h-10 rounded-[16px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              color: 'var(--text-secondary)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            <Search aria-hidden="true" style={{ width: 18, height: 18 }} />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 44, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
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
              className="w-full pl-9 pr-9 py-2.5 rounded-[16px] text-sm font-medium focus:outline-none"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: `1.5px solid ${query ? '#FF5E00' : 'var(--border-soft)'}`,
                boxShadow: query
                  ? '0 0 16px rgba(255, 94, 0, 0.25)'
                  : '0 4px 14px rgba(0,0,0,0.5)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: query ? '#FF5E00' : 'var(--text-muted)' }}
            />
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => handleSearch('')}
                aria-label="ล้างคำค้นหา"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
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
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
