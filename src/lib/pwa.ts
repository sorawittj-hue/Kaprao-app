/**
 * ============================================================================
 * Kaprao52 - PWA Utilities
 * ============================================================================
 * Progressive Web App features and offline support
 */

import { logger } from '@/utils/logger'

// ============================================
// Service Worker Registration
// ============================================
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'imports',
    })

    logger.info('Service Worker registered:', registration.scope)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New update available
          showUpdateNotification()
        }
      })
    })

    return registration
  } catch (error) {
    logger.error('Service Worker registration failed:', error)
    return null
  }
}

// ============================================
// Update Handling
// ============================================
function showUpdateNotification(): void {
  // Dispatch custom event for the app to show update UI
  window.dispatchEvent(new CustomEvent('sw-update-available'))
}

export async function updateServiceWorker(): Promise<void> {
  const registration = await navigator.serviceWorker.ready

  if (registration.waiting) {
    // Send message to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

// ============================================
// Install Prompt (Add to Home Screen)
// ============================================
let deferredPrompt: BeforeInstallPromptEvent | null = null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Store the event for later use
    deferredPrompt = e as BeforeInstallPromptEvent

    // Dispatch event for the app
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  })

  window.addEventListener('appinstalled', () => {
    logger.info('PWA was installed')
    deferredPrompt = null
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  })
}

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) return false

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  deferredPrompt = null
  return outcome === 'accepted'
}

export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null
}

// ============================================
// Offline Detection
// ============================================
export function initOfflineDetection(): void {
  window.addEventListener('online', () => {
    logger.info('App is online')
    window.dispatchEvent(new CustomEvent('app-online'))
  })

  window.addEventListener('offline', () => {
    logger.warn('App is offline')
    window.dispatchEvent(new CustomEvent('app-offline'))
  })
}

export function isOnline(): boolean {
  return navigator.onLine
}

// ============================================
// Background Sync
// ============================================
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  const registration = await navigator.serviceWorker.ready

  if ('sync' in registration) {
    try {
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag)
      logger.info('Background sync registered:', tag)
      return true
    } catch (error) {
      logger.error('Background sync registration failed:', error)
      return false
    }
  }

  return false
}

// ============================================
// Push Notifications
// ============================================
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    logger.warn('Notifications not supported')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  return navigator.serviceWorker.ready.then(async (registration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ) as unknown as ArrayBuffer,
      })

      logger.info('Push subscription created')
      return subscription
    } catch (error) {
      logger.error('Push subscription failed:', error)
      return null
    }
  })
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// ============================================
// Cache Management
// ============================================
export async function clearAppCache(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
    logger.info('All caches cleared')
  }
}

export async function getCacheSize(): Promise<number> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return 0
  }

  const estimate = await navigator.storage.estimate()
  return estimate.usage || 0
}

// ============================================
// App Badge API (for installed PWAs)
// ============================================
export async function setAppBadge(count: number): Promise<void> {
  if ('setAppBadge' in navigator) {
    try {
      if (navigator.setAppBadge) {
        await navigator.setAppBadge(count)
      }
    } catch (error) {
      logger.error('Failed to set app badge:', error)
    }
  }
}

export async function clearAppBadge(): Promise<void> {
  if ('clearAppBadge' in navigator) {
    try {
      if (navigator.clearAppBadge) {
        await navigator.clearAppBadge()
      }
    } catch (error) {
      logger.error('Failed to clear app badge:', error)
    }
  }
}

// ============================================
// Screen Wake Lock (keep screen on during order)
// ============================================
let wakeLock: WakeLockSentinel | null = null

export async function requestWakeLock(): Promise<boolean> {
  if (!('wakeLock' in navigator)) {
    return false
  }

  try {
    wakeLock = await (navigator as any).wakeLock.request('screen')
    logger.info('Wake lock acquired')

    wakeLock?.addEventListener('release', () => {
      logger.info('Wake lock released')
    })

    return true
  } catch (error) {
    logger.error('Wake lock request failed:', error)
    return false
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release()
    wakeLock = null
  }
}

// ============================================
// PWA Status Check
// ============================================
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent)
}

// ============================================
// Share API
// ============================================
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error) {
    // User cancelled or share failed
    return false
  }
}

// ============================================
// Vibration API
// ============================================
export function vibrate(pattern: number | number[] = 200): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// ============================================
// Type Augmentation
// ============================================
declare global {
  interface Navigator {
    setAppBadge?: (contents?: number) => Promise<void>
    clearAppBadge?: () => Promise<void>
  }
}

