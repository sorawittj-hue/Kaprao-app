/**
 * ============================================================================
 * Kaprao52 - Offline Indicator
 * ============================================================================
 * Shows when the app is offline
 */

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/usePWA'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-red-500 text-white"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              คุณอยู่ในโหมดออฟไลน์ ข้อมูลบางส่วนอาจไม่เป็นปัจจุบัน
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function OnlineIndicator() {
  const isOnline = useOnlineStatus()
  const [showOnline, setShowOnline] = useState(false)

  useEffect(() => {
    if (isOnline) {
      setShowOnline(true)
      const timer = setTimeout(() => setShowOnline(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  return (
    <AnimatePresence>
      {showOnline && isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-green-500 text-white"
        >
          <div className="flex items-center justify-center gap-2 py-2 px-4">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">
              ออนไลน์แล้ว
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useEffect, useState } from 'react'
