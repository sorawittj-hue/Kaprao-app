/**
 * ============================================================================
 * Kaprao52 - Security Utilities
 * ============================================================================
 * Rate limiting, input sanitization, and CSRF protection
 */

import { RATE_LIMITS } from './constants'
import { logger } from './logger'

// ============================================
// Rate Limiting
// ============================================
interface RateLimitEntry {
  count: number
  firstAttempt: number
  blocked: boolean
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry>
  private cleanupInterval: ReturnType<typeof setInterval> | null

  constructor() {
    this.storage = new Map()
    this.cleanupInterval = null
    this.startCleanup()
  }

  private startCleanup() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.storage.entries()) {
        if (now - entry.firstAttempt > 3600000) { // 1 hour
          this.storage.delete(key)
        }
      }
    }, 300000)
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }

  check(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.storage.get(key)

    if (!entry) {
      // First attempt
      this.storage.set(key, {
        count: 1,
        firstAttempt: now,
        blocked: false,
      })
      return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > windowMs) {
      entry.count = 1
      entry.firstAttempt = now
      entry.blocked = false
      return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
    }

    // Check if blocked
    if (entry.blocked) {
      return { allowed: false, remaining: 0, resetTime: entry.firstAttempt + windowMs }
    }

    // Increment count
    entry.count++

    if (entry.count > maxAttempts) {
      entry.blocked = true
      logger.warn('Rate limit exceeded', { key, attempts: entry.count })
      return { allowed: false, remaining: 0, resetTime: entry.firstAttempt + windowMs }
    }

    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: entry.firstAttempt + windowMs
    }
  }

  reset(key: string) {
    this.storage.delete(key)
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// ============================================
// Rate Limit Checkers
// ============================================
export function checkOrderRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const key = `order:${userId}`
  const result = rateLimiter.check(key, RATE_LIMITS.ORDERS.MAX, RATE_LIMITS.ORDERS.WINDOW_MS)

  return {
    allowed: result.allowed,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
  }
}

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const key = `login:${identifier}`
  const result = rateLimiter.check(key, RATE_LIMITS.LOGIN.MAX, RATE_LIMITS.LOGIN.WINDOW_MS)

  return {
    allowed: result.allowed,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
  }
}

export function checkCouponRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const key = `coupon:${userId}`
  const result = rateLimiter.check(key, RATE_LIMITS.COUPON_CHECK.MAX, RATE_LIMITS.COUPON_CHECK.WINDOW_MS)

  return {
    allowed: result.allowed,
    retryAfter: result.allowed ? undefined : Math.ceil((result.resetTime - Date.now()) / 1000),
  }
}

// ============================================
// Input Sanitization
// ============================================
import DOMPurify from 'dompurify'

// For Node.js environments where DOMPurify might not be available
const createDOMPurify = () => {
  if (DOMPurify) {
    return DOMPurify
  }
  if (typeof window !== 'undefined' && window.DOMPurify) {
    return window.DOMPurify
  }
  // Fallback sanitization
  return {
    sanitize: (input: string) => sanitizeBasic(input),
  }
}

function sanitizeBasic(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export function sanitizeHTML(input: string): string {
  const purifier = createDOMPurify()
  return purifier.sanitize(input)
}

export function sanitizeText(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
}

// ============================================
// CSRF Protection
// ============================================
const CSRF_TOKEN_KEY = 'kaprao52-csrf-token'

export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')

  // Store in sessionStorage (not localStorage for security)
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token)
  } catch {
    // Ignore storage errors
  }

  return token
}

export function getCSRFToken(): string | null {
  try {
    return sessionStorage.getItem(CSRF_TOKEN_KEY)
  } catch {
    return null
  }
}

export function validateCSRFToken(token: string): boolean {
  const stored = getCSRFToken()
  if (!stored) return false

  // Constant time comparison to prevent timing attacks
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ stored.charCodeAt(i)
  }
  return result === 0
}

// ============================================
// Request Signing (for API calls)
// ============================================
export async function signRequest(payload: Record<string, unknown>): Promise<string> {
  const timestamp = Date.now()
  const data = JSON.stringify({ ...payload, timestamp })

  // Simple hash for integrity check (not cryptographic security)
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return `${timestamp}:${hash.slice(0, 16)}`
}

// ============================================
// Content Security Policy Helpers
// ============================================
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "https://*.supabase.co"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'img-src': ["'self'", "data:", "blob:", "https://*"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'connect-src': ["'self'", "https://*.supabase.co", "https://api.qrserver.com"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
} as const

export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// ============================================
// Safe JSON Parsing
// ============================================
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    logger.warn('JSON parse failed', { json: json.slice(0, 100) })
    return defaultValue
  }
}

export function safeJSONStringify(data: unknown): string | null {
  try {
    return JSON.stringify(data)
  } catch {
    logger.error('JSON stringify failed', data)
    return null
  }
}

// ============================================
// Secure Storage
// ============================================
export const secureStorage = {
  set(key: string, value: string) {
    try {
      // In production, consider encrypting sensitive data
      sessionStorage.setItem(key, value)
    } catch (e) {
      logger.error('Storage set failed', e)
    }
  },

  get(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },

  remove(key: string) {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Ignore
    }
  },

  clear() {
    try {
      sessionStorage.clear()
    } catch {
      // Ignore
    }
  },
}

// ============================================
// Type Augmentation
// ============================================
declare global {
  interface Window {
    DOMPurify?: {
      sanitize: (input: string) => string
    }
  }
}
