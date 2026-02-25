/**
 * ============================================================================
 * Kaprao52 - Edge Computing & Advanced Caching
 * ============================================================================
 * Process data on the edge for maximum performance
 */

import { logger } from '@/utils/logger'

// ============================================
// Edge Cache Manager
// ============================================
class EdgeCache {
  private memoryCache = new Map<string, { data: unknown; expiry: number }>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)

    if (!entry) return null

    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.memoryCache.delete(key)
  }

  clear(): void {
    this.memoryCache.clear()
  }

  // Preload data into cache
  async preload<T>(keys: string[], fetcher: (key: string) => Promise<T>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.get(key)) {
        try {
          const data = await fetcher(key)
          this.set(key, data)
        } catch (error) {
          logger.error('Preload failed:', error)
        }
      }
    })

    await Promise.all(promises)
  }
}

export const edgeCache = new EdgeCache()

// ============================================
// Request Deduplication
// ============================================
class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>()

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>
    }

    const promise = fn().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, promise)
    return promise
  }
}

export const deduplicator = new RequestDeduplicator()

// ============================================
// Background Sync Queue
// ============================================
interface QueuedAction {
  id: string
  type: string
  payload: unknown
  timestamp: number
  retries: number
}

class BackgroundSyncQueue {
  private queue: QueuedAction[] = []
  private readonly MAX_RETRIES = 3
  private readonly STORAGE_KEY = 'kaprao52-sync-queue'

  constructor() {
    this.loadQueue()
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch {
      // Ignore
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue))
    } catch {
      // Ignore
    }
  }

  enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): void {
    const fullAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    }

    this.queue.push(fullAction)
    this.saveQueue()

    logger.debug('Action queued:', action.type)
  }

  async processQueue(processor: (action: QueuedAction) => Promise<boolean>): Promise<void> {
    const failed: QueuedAction[] = []

    for (const action of this.queue) {
      try {
        const success = await processor(action)

        if (!success && action.retries < this.MAX_RETRIES) {
          action.retries++
          failed.push(action)
        }
      } catch (error) {
        logger.error('Queue processing error:', error)
        if (action.retries < this.MAX_RETRIES) {
          action.retries++
          failed.push(action)
        }
      }
    }

    this.queue = failed
    this.saveQueue()
  }

  getQueueLength(): number {
    return this.queue.length
  }
}

export const syncQueue = new BackgroundSyncQueue()

// ============================================
// Predictive Prefetching
// ============================================
class PredictivePrefetch {
  private observer: IntersectionObserver | null = null
  private prefetchQueue = new Set<string>()

  observe(element: Element, url: string): void {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const url = (entry.target as HTMLElement).dataset.prefetch
              if (url && !this.prefetchQueue.has(url)) {
                this.prefetch(url)
              }
            }
          })
        },
        { rootMargin: '200px' }
      )
    }

    (element as HTMLElement).dataset.prefetch = url
    this.observer.observe(element)
  }

  private prefetch(url: string): void {
    this.prefetchQueue.add(url)

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)

    logger.debug('Prefetched:', url)
  }
}

export const predictivePrefetch = new PredictivePrefetch()

// ============================================
// Edge Function Simulation
// ============================================
export async function edgeProcess<T>(
  processor: () => T,
  _context: { userId?: string; ip?: string }
): Promise<T> {
  // Simulate edge processing
  const startTime = performance.now()

  const result = await Promise.resolve(processor())

  const duration = performance.now() - startTime
  logger.perf('Edge process', duration)

  return result
}
