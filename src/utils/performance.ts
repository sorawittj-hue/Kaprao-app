/**
 * ============================================================================
 * Kaprao52 - Performance Utilities
 * ============================================================================
 * Memoization, virtualization, and optimization helpers
 */

import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { logger } from './logger'

// ============================================
// Memoization Helpers
// ============================================
export function useDeepMemo<T>(factory: () => T, deps: unknown[]): T {
  const ref = useRef<{ deps: unknown[]; value: T } | null>(null)
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }
  
  return ref.current.value
}

function deepEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}

// ============================================
// Virtual List Hook
// ============================================
interface UseVirtualListOptions {
  itemHeight: number
  overscan?: number
  containerHeight: number
}

interface VirtualItem<T> {
  data: T
  index: number
  style: React.CSSProperties
}

export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
): {
  virtualItems: VirtualItem<T>[]
  totalHeight: number
  startIndex: number
  endIndex: number
  scrollToIndex: (index: number) => void
} {
  const { itemHeight, overscan = 5, containerHeight } = options
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * itemHeight
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((data, i) => ({
      data,
      index: startIndex + i,
      style: {
        position: 'absolute' as const,
        top: (startIndex + i) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }))
  }, [items, startIndex, endIndex, itemHeight])

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight
    }
  }, [itemHeight])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollToIndex,
  }
}

// ============================================
// Intersection Observer Hook (Lazy Loading)
// ============================================
interface UseIntersectionOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersection<T extends HTMLElement>(
  options: UseIntersectionOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options
  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  return [ref, isIntersecting]
}

// ============================================
// Debounce & Throttle
// ============================================
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  )
}

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(0)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun.current >= limit) {
        lastRun.current = now
        callback(...args)
      }
    },
    [callback, limit]
  )
}

// ============================================
// Performance Measurement
// ============================================
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  logger.perf(name, end - start)
  
  return result
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  logger.perf(name, end - start)
  
  return result
}

// ============================================
// Web Vitals Monitoring
// ============================================
interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function observeWebVitals(callback: (metric: WebVitalsMetric) => void) {
  // CLS (Cumulative Layout Shift)
  if ('web-vitals' in window) {
    // Use web-vitals library if available
    return
  }

  // Fallback: Basic performance observer
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            const value = entry.startTime
            callback({
              name: 'LCP',
              value,
              rating: value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor',
            })
          }
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      
      return () => observer.disconnect()
    } catch {
      // Ignore if not supported
    }
  }
}

// ============================================
// Image Preloading
// ============================================
const imageCache = new Set<string>()

export function preloadImage(src: string): Promise<void> {
  if (imageCache.has(src)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.add(src)
      resolve()
    }
    img.onerror = reject
    img.src = src
  })
}

export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.all(srcs.map(preloadImage)).then(() => undefined)
}

// ============================================
// Resource Hints
// ============================================
export function addPreconnectHint(href: string) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = href
  document.head.appendChild(link)
}

export function addDnsPrefetchHint(href: string) {
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = href
  document.head.appendChild(link)
}

// ============================================
// Memory Management
// ============================================
export function useMemoryCleanup(cleanup: () => void) {
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])
}

// Clear large arrays/objects when component unmounts
export function clearLargeData(data: unknown): void {
  if (Array.isArray(data)) {
    data.length = 0
  } else if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
       
      delete (data as any)[key]
    })
  }
}

// ============================================
// Bundle Splitting Helper
// ============================================
export function lazyLoadComponent<T>(
  importFn: () => Promise<{ default: T }>,
  timeout: number = 10000
): Promise<T> {
  return Promise.race([
    importFn().then(m => m.default),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Component load timeout')), timeout)
    ),
  ])
}
