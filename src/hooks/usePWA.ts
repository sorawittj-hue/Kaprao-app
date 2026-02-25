/**
 * ============================================================================
 * Kaprao52 - PWA Hook
 * ============================================================================
 * React hook for PWA features
 */

import { useState, useEffect, useCallback } from 'react'
import {
  isOnline,
  isPWA,
  isInstallPromptAvailable,
  showInstallPrompt,
  requestNotificationPermission,
  vibrate,
} from '@/lib/pwa'

// ============================================
// useOnlineStatus Hook
// ============================================
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(isOnline())

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}

// ============================================
// usePWAStatus Hook
// ============================================
interface PWAStatus {
  isPWA: boolean
  canInstall: boolean
  isIOS: boolean
  isAndroid: boolean
}

export function usePWAStatus(): PWAStatus {
  const [status, setStatus] = useState<PWAStatus>({
    isPWA: isPWA(),
    canInstall: isInstallPromptAvailable(),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
  })

  useEffect(() => {
    const handleInstallAvailable = () => {
      setStatus(prev => ({ ...prev, canInstall: true }))
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable)

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
    }
  }, [])

  return status
}

// ============================================
// useInstallPrompt Hook
// ============================================
interface InstallPromptReturn {
  canInstall: boolean
  install: () => Promise<boolean>
}

export function useInstallPrompt(): InstallPromptReturn {
  const [canInstall, setCanInstall] = useState(isInstallPromptAvailable())

  useEffect(() => {
    const handleInstallAvailable = () => setCanInstall(true)
    const handleInstalled = () => setCanInstall(false)

    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-installed', handleInstalled)

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
      window.removeEventListener('pwa-installed', handleInstalled)
    }
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    return showInstallPrompt()
  }, [])

  return { canInstall, install }
}

// ============================================
// useSWUpdate Hook
// ============================================
interface SWUpdateReturn {
  updateAvailable: boolean
  update: () => void
}

export function useSWUpdate(): SWUpdateReturn {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true)
    window.addEventListener('sw-update-available', handleUpdate)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate)
    }
  }, [])

  const update = useCallback(() => {
    window.location.reload()
  }, [])

  return { updateAvailable, update }
}

// ============================================
// useNotifications Hook
// ============================================
interface NotificationsReturn {
  permission: NotificationPermission
  requestPermission: () => Promise<boolean>
}

export function useNotifications(): NotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  )

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestNotificationPermission()
    setPermission(granted ? 'granted' : 'denied')
    return granted
  }, [])

  return { permission, requestPermission }
}

// ============================================
// useVibration Hook
// ============================================
export function useVibration(): {
  vibrate: (pattern?: number | number[]) => void
  light: () => void
  medium: () => void
  heavy: () => void
  success: () => void
  error: () => void
} {
  return {
    vibrate,
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate(50),
    success: () => vibrate([10, 50, 10]),
    error: () => vibrate([50, 100, 50]),
  }
}

// ============================================
// useWakeLock Hook
// ============================================
import { useRef } from 'react'
import { requestWakeLock, releaseWakeLock } from '@/lib/pwa'

export function useWakeLock(): {
  acquire: () => Promise<boolean>
  release: () => Promise<void>
} {
  const activeRef = useRef(false)

  const acquire = useCallback(async (): Promise<boolean> => {
    const success = await requestWakeLock()
    activeRef.current = success
    return success
  }, [])

  const release = useCallback(async (): Promise<void> => {
    if (activeRef.current) {
      await releaseWakeLock()
      activeRef.current = false
    }
  }, [])

  return { acquire, release }
}
