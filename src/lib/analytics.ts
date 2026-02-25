/**
 * ============================================================================
 * Kaprao52 - Analytics & Tracking
 * ============================================================================
 * Privacy-first analytics with Google Analytics 4 and custom events
 */

import { logger } from '@/utils/logger'

// ============================================
// GA4 Configuration
// ============================================
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// ============================================
// Analytics Types
// ============================================
type AnalyticsEvent =
  | 'page_view'
  | 'user_login'
  | 'user_signup'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'view_item'
  | 'search'
  | 'share'
  | 'exception'
  | 'timing_complete'

type EventParams = Record<string, string | number | boolean | undefined>

// ============================================
// Analytics State
// ============================================
let isInitialized = false
// ============================================
// Initialize Analytics
// ============================================
export function initAnalytics(): void {
  if (isInitialized || !GA_MEASUREMENT_ID) return

  // Load GA4 script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Initialize gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually
    cookie_flags: 'SameSite=None;Secure',
    custom_map: {
      custom_parameter_1: 'app_version',
    },
  })

  isInitialized = true
  logger.info('Analytics initialized')
}

// ============================================
// Set User ID
// ============================================
export function setAnalyticsUser(id: string | null): void {
  if (isInitialized && id) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: id,
    })
  }
}

// ============================================
// Track Events
// ============================================
export function trackEvent(
  eventName: AnalyticsEvent,
  params?: EventParams
): void {
  if (!isInitialized) {
    logger.debug('Analytics not initialized, skipping event:', eventName)
    return
  }

  const eventParams = {
    ...params,
    timestamp: new Date().toISOString(),
  }

  window.gtag('event', eventName, eventParams)
  logger.debug('Analytics event:', { eventName, eventParams })
}

// ============================================
// Page View Tracking
// ============================================
export function trackPageView(path: string, title?: string): void {
  if (!isInitialized) return

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })

  logger.debug('Page view:', path)
}

// ============================================
// E-commerce Events
// ============================================
interface ProductItem {
  id: string
  name: string
  price: number
  quantity?: number
  category?: string
}

export function trackAddToCart(item: ProductItem): void {
  trackEvent('add_to_cart', {
    currency: 'THB',
    value: item.price * (item.quantity || 1),
    items: JSON.stringify([{
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      item_category: item.category,
    }]),
  })
}

export function trackRemoveFromCart(item: ProductItem): void {
  trackEvent('remove_from_cart', {
    currency: 'THB',
    value: item.price * (item.quantity || 1),
    items: JSON.stringify([{
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }]),
  })
}

export function trackBeginCheckout(items: ProductItem[], total: number): void {
  trackEvent('begin_checkout', {
    currency: 'THB',
    value: total,
    items: JSON.stringify(items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }))),
  })
}

export function trackPurchase(
  transactionId: string,
  items: ProductItem[],
  total: number,
  tax: number = 0,
  shipping: number = 0
): void {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: total,
    currency: 'THB',
    tax: tax,
    shipping: shipping,
    items: JSON.stringify(items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }))),
  })
}

// ============================================
// User Events
// ============================================
export function trackLogin(method: 'line' | 'guest'): void {
  trackEvent('user_login', {
    method: method,
  })
}

export function trackSignup(method: string): void {
  trackEvent('user_signup', {
    method: method,
  })
}

export function trackSearch(query: string, resultsCount: number): void {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  })
}

export function trackShare(method: string, contentType: string): void {
  trackEvent('share', {
    method: method,
    content_type: contentType,
  })
}

// ============================================
// Error Tracking
// ============================================
export function trackException(
  description: string,
  fatal: boolean = false
): void {
  trackEvent('exception', {
    description: description.slice(0, 150), // GA4 limit
    fatal: fatal,
  })
}

// ============================================
// Performance Tracking
// ============================================
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  trackEvent('timing_complete', {
    event_category: category,
    name: variable,
    value: Math.round(value),
    event_label: label,
  })
}

// ============================================
// Custom Analytics Store
// ============================================
interface AnalyticsStore {
  sessionId: string
  sessionStart: number
  pageViews: number
  events: Array<{ event: string; time: number }>
}

const analyticsStore: AnalyticsStore = {
  sessionId: generateSessionId(),
  sessionStart: Date.now(),
  pageViews: 0,
  events: [],
}

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getSessionId(): string {
  return analyticsStore.sessionId
}

export function getSessionDuration(): number {
  return Date.now() - analyticsStore.sessionStart
}

// ============================================
// Consent Management
// ============================================
type ConsentType = 'analytics' | 'marketing'

const consent: Record<ConsentType, boolean> = {
  analytics: true,
  marketing: false,
}

export function setConsent(type: ConsentType, granted: boolean): void {
  consent[type] = granted

  if (type === 'analytics' && !granted) {
    // Disable analytics
    isInitialized = false
  }
}

export function hasConsent(type: ConsentType): boolean {
  return consent[type]
}

// ============================================
// Type Augmentation
// ============================================
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}
