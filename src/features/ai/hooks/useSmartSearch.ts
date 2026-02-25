/**
 * ============================================================================
 * Kaprao52 - Fast Smart Search
 * ============================================================================
 * Locally filters menu items based on Regex and keyword matching.
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { logger } from '@/utils/logger'
import type { MenuItem } from '@/types'

// ============================================
// Search Intent Types
// ============================================
export type SearchIntent =
  | 'find_by_name'
  | 'find_by_category'
  | 'find_by_price'
  | 'find_by_spiciness'
  | 'find_by_ingredient'
  | 'recommendation'
  | 'comparison'

export interface SearchQuery {
  intent: SearchIntent
  keywords: string[]
  filters: {
    maxPrice?: number
    minPrice?: number
    category?: string
    spicyLevel?: number
    ingredients?: string[]
    excludeIngredients?: string[]
  }
  sortBy?: 'price' | 'popularity' | 'relevance'
}

export interface SearchResult {
  item: MenuItem
  relevanceScore: number
  matchedTerms: string[]
  reason: string
}

// ============================================
// Local Search Engine
// ============================================
class SmartSearchEngine {
  private priceRegex = /(under|below|less than|cheaper than|within|ไม่เกิน|ต่ำกว่า)\s*(\d+)/i
  private spicyRegex = /(spicy|hot|เผ็ด|เผ็ดมาก|เผ็ดน้อย)/i
  private categoryKeywords: Record<string, string[]> = {
    kaprao: ['kaprao', 'กะเพรา', 'basil'],
    curry: ['curry', 'แกง', 'gaeng'],
    noodle: ['noodle', 'เส้น', 'mama', 'ramen'],
    bamboo: ['bamboo', 'หน่อไม้', 'nor mai'],
    garlic: ['garlic', 'กระเทียม', 'krathiam'],
  }

  parseQuery(query: string): SearchQuery {
    const searchQuery: SearchQuery = {
      intent: 'find_by_name',
      keywords: [],
      filters: {},
    }

    // Extract price filters
    const priceMatch = query.match(this.priceRegex)
    if (priceMatch) {
      searchQuery.filters.maxPrice = parseInt(priceMatch[2])
      searchQuery.intent = 'find_by_price'
    }

    // Extract spiciness
    const spicyMatch = query.match(this.spicyRegex)
    if (spicyMatch) {
      const spicyText = spicyMatch[1].toLowerCase()
      if (spicyText.includes('มาก') || spicyText.includes('very')) {
        searchQuery.filters.spicyLevel = 3
      } else if (spicyText.includes('น้อย') || spicyText.includes('little')) {
        searchQuery.filters.spicyLevel = 1
      } else {
        searchQuery.filters.spicyLevel = 2
      }
    }

    // Detect category
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(k => query.toLowerCase().includes(k))) {
        searchQuery.filters.category = category
        searchQuery.intent = 'find_by_category'
        break
      }
    }

    const words = query.toLowerCase().split(/\s+/)
    searchQuery.keywords = words.filter(w => w.length > 1)

    // Detect recommendation intent
    if (query.match(/(recommend|suggest|best|good|อร่อย|แนะนำ)/i)) {
      searchQuery.intent = 'recommendation'
    }

    // Detect comparison intent
    if (query.match(/(compare|vs|versus|or|หรือ|กับ)/i)) {
      searchQuery.intent = 'comparison'
    }

    return searchQuery
  }

  search(menuItems: MenuItem[], query: string): SearchResult[] {
    const searchQuery = this.parseQuery(query)
    const results: SearchResult[] = []

    menuItems.forEach(item => {
      const score = this.calculateRelevance(item, searchQuery)
      if (score.score > 0) {
        results.push({
          item,
          relevanceScore: score.score,
          matchedTerms: score.matchedTerms,
          reason: score.reason,
        })
      }
    })

    // Sort by relevance
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  private calculateRelevance(
    item: MenuItem,
    query: SearchQuery
  ): { score: number; matchedTerms: string[]; reason: string } {
    let score = 0
    const matchedTerms: string[] = []
    const reasons: string[] = []

    // Name matching
    query.keywords.forEach(keyword => {
      if (item.name.toLowerCase().includes(keyword)) {
        score += 0.4
        matchedTerms.push(keyword)
        reasons.push(`ชื่อตรงกับ "${keyword}"`)
      }
      if (item.category.includes(keyword)) {
        score += 0.2
        matchedTerms.push(keyword)
      }
    })

    // Substring fallback if keywords array has multiple items that didn't match perfectly
    const queryTerm = query.keywords.join(' ')
    if (queryTerm && item.name.toLowerCase().includes(queryTerm)) {
      score += 0.5
      matchedTerms.push(queryTerm)
    }

    // Price filter
    if (query.filters.maxPrice && item.price <= query.filters.maxPrice) {
      score += 0.2
      reasons.push(`ราคาไม่เกิน ${query.filters.maxPrice} บาท`)
    }

    // Category filter
    if (query.filters.category && item.category === query.filters.category) {
      score += 0.3
      reasons.push(`อยู่ในหมวด ${query.filters.category}`)
    }

    // Recommendation boost
    if (query.intent === 'recommendation' && item.isRecommended) {
      score += 0.15
      reasons.push('เมนูแนะนำ')
    }

    // Availability
    if (item.isAvailable) {
      score += 0.05
    } else {
      score -= 0.3 // Penalty for unavailable items
    }

    // Minimum match threshold
    if (matchedTerms.length === 0 && !query.filters.category && !query.filters.maxPrice && query.intent !== 'recommendation') {
      score = 0
    }

    return {
      score: Math.max(0, score),
      matchedTerms,
      reason: reasons.join(', '),
    }
  }

  // Get search suggestions based on partial query
  getSuggestions(query: string, menuItems: MenuItem[]): string[] {
    if (query.length < 2) return []

    const suggestions: string[] = []
    const lowerQuery = query.toLowerCase()

    // Category suggestions
    Object.entries(this.categoryKeywords).forEach(([_category, keywords]) => {
      if (keywords.some(k => k.includes(lowerQuery))) {
        suggestions.push(`${keywords[0]} ทั้งหมด`)
      }
    })

    // Item name suggestions
    menuItems.forEach(item => {
      if (item.name.toLowerCase().includes(lowerQuery)) {
        suggestions.push(item.name)
      }
    })

    // Intent-based suggestions
    if (lowerQuery.includes('ราคา') || lowerQuery.includes('price')) {
      suggestions.push('เมนูราคาไม่เกิน 100 บาท')
      suggestions.push('เมนูราคาประหยัด')
    }

    return [...new Set(suggestions)].slice(0, 5)
  }
}

export const searchEngine = new SmartSearchEngine()

// ============================================
// React Hook
// ============================================
export function useSmartSearch(menuItems: MenuItem[]) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [parsedQuery, setParsedQuery] = useState<SearchQuery | null>(null)
  const engineRef = useRef(searchEngine)

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery)

    if (searchQuery.length < 2) {
      setResults([])
      setSuggestions([])
      setParsedQuery(null)
      return
    }

    // Parse query for display
    const parsed = engineRef.current.parseQuery(searchQuery)
    setParsedQuery(parsed)

    // Get results
    const searchResults = engineRef.current.search(menuItems, searchQuery)
    setResults(searchResults)

    // Get suggestions
    const searchSuggestions = engineRef.current.getSuggestions(searchQuery, menuItems)
    setSuggestions(searchSuggestions)

    logger.debug('Local search:', { query: searchQuery, results: searchResults.length })
  }, [menuItems])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setSuggestions([])
    setParsedQuery(null)
  }, [])

  const topResults = useMemo(() => {
    return results.slice(0, 10)
  }, [results])

  return {
    query,
    results: topResults,
    suggestions,
    parsedQuery,
    search,
    clearSearch,
    hasResults: results.length > 0,
  }
}
