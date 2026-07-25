import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react'
import { showInstallPrompt, isPWA } from '@/lib/pwa'
import { hapticLight, hapticHeavy } from '@/utils/haptics'

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  useEffect(() => {
    // If already running in standalone PWA mode, don't show prompt
    if (isPWA()) return

    // Check if dismissed recently (within 24h)
    const dismissed = localStorage.getItem('kaprao_pwa_dismissed')
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 24 * 60 * 60 * 1000) {
      return
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOSDevice(isIOS)

    // Listen for install available event
    const handleAvailable = () => {
      setShowBanner(true)
    }

    window.addEventListener('pwa-install-available', handleAvailable)

    // Show for iOS after 2 seconds
    if (isIOS) {
      const timer = setTimeout(() => setShowBanner(true), 2000)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener('pwa-install-available', handleAvailable)
  }, [])

  const handleInstallClick = async () => {
    hapticHeavy()
    if (isIOSDevice) {
      setShowIOSModal(true)
    } else {
      const installed = await showInstallPrompt()
      if (installed) {
        setShowBanner(false)
      }
    }
  }

  const handleDismiss = () => {
    hapticLight()
    setShowBanner(false)
    localStorage.setItem('kaprao_pwa_dismissed', Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-20 left-4 right-4 z-[90] max-w-md mx-auto"
          >
            <div
              className="relative overflow-hidden rounded-3xl p-4 text-white flex items-center justify-between shadow-2xl border border-white/20"
              style={{
                background: 'linear-gradient(135deg, #1C1917 0%, #292524 60%, #FF6B00 100%)',
                boxShadow: '0 20px 40px -10px rgba(255, 107, 0, 0.35)',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="ปิดการแจ้งเตือนติดตั้งแอป"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pr-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] flex items-center justify-center font-black text-2xl shadow-lg border border-white/20 flex-shrink-0">
                  K
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">ติดตั้งแอป Kaprao52</span>
                    <span className="inline-flex items-center gap-0.5 bg-brand-500/30 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-brand-400/40">
                      <Sparkles className="w-2.5 h-2.5" />
                      เร็วขึ้น 3 เท่า
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    เปิดใช้งานบนมือถือ/แท็บเล็ตได้เต็มจอ ไม่ต้องผ่านเบราว์เซอร์
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/20"
              >
                <Download className="w-3.5 h-3.5" />
                ติดตั้ง
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Installation Instruction Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl border border-gray-100"
            >
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                📲
              </div>

              <h3 className="font-black text-xl text-gray-900 mb-2">
                วิธีติดตั้งบน iPhone / iPad
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                ทำตาม 2 ขั้นตอนง่ายๆ เพื่อเพิ่มแอปไปยังหน้าจอโฮมของคุณ:
              </p>

              <div className="space-y-4 text-left mb-6">
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-800 flex items-center gap-1">
                      กดปุ่มแชร์ <Share className="w-3.5 h-3.5 text-blue-500 inline" /> ใน Safari
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      แถบเครื่องมือด้านล่างหรือด้านบนของหน้าจอ
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-800 flex items-center gap-1">
                      เลือก "เพิ่มไปยังหน้าจอโฮม" <PlusSquare className="w-3.5 h-3.5 text-gray-700 inline" />
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      (Add to Home Screen) จากเมนูที่ปรากฏขึ้น
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black py-3 rounded-2xl shadow-lg shadow-orange-500/30 text-sm"
              >
                รับทราบแล้ว 👍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
