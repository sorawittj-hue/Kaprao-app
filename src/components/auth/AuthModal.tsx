import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, User, Zap } from 'lucide-react'
import { useUIStore } from '@/store'
import { loginWithLine, loginWithPhone, loginWithDemoAccount, enterGuestMode } from '@/lib/auth'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { hapticHeavy, hapticLight, hapticMedium } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import confetti from 'canvas-confetti'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { addToast } = useUIStore()

  const [authMode, setAuthMode] = useState<'line' | 'phone' | 'demo'>('line')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleLine = async () => {
    hapticHeavy()
    setIsLoading(true)
    try {
      await loginWithLine()
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ',
        message: err.message || 'กรุณาลองเข้าสู่ระบบด้วยเบอร์โทรศัพท์หรือโหมดผู้เยี่ยมชม',
      })
      // Switch to phone tab smoothly if LINE is not configured in current environment
      setAuthMode('phone')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.trim().length < 9) {
      addToast({ type: 'error', title: 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก' })
      return
    }

    hapticHeavy()
    setIsLoading(true)
    try {
      const loggedInUser = await loginWithPhone(phoneNumber, displayName)
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF5500', '#FBBF24', '#10B981'],
      })
      addToast({
        type: 'success',
        title: 'เข้าสู่ระบบสำเร็จ!',
        message: `ยินดีต้อนรับคุณ ${loggedInUser.displayName}`,
      })
      onSuccess?.()
      onClose()
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    hapticHeavy()
    loginWithDemoAccount()
    confetti({
      particleCount: 160,
      spread: 85,
      origin: { y: 0.55 },
      colors: ['#FF5500', '#FBBF24', '#10B981'],
    })
    addToast({
      type: 'success',
      title: 'เข้าสู่ระบบบัญชีทดสอบ VIP!',
      message: 'คุณได้รับ 150 พอยต์ และสถานะระดับ GOLD เพื่อทดลองทุกฟีเจอร์',
    })
    onSuccess?.()
    onClose()
  }

  const handleGuestContinue = () => {
    hapticMedium()
    enterGuestMode()
    addToast({
      type: 'info',
      title: 'เข้าใช้งานโหมดผู้เยี่ยมชม',
      message: 'สามารถสั่งอาหารได้ทันที และผูก LINE เพื่อรับแต้มย้อนหลังได้ตลอดเวลา',
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/65"
          style={{ backdropFilter: 'blur(16px)' }}
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="w-full max-w-md bg-white rounded-t-[36px] sm:rounded-[36px] p-6 pb-9 relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5"
          style={{ background: 'var(--bg-base)' }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              hapticLight()
              onClose()
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 3D Brand Logo Header */}
          <div className="text-center pt-2">
            <div className="flex justify-center mb-3">
              <BrandLogo size="lg" />
            </div>
            <p className="text-xs font-bold text-slate-500 max-w-xs mx-auto">
              เข้าสู่ระบบเพื่อรับสิทธิพิเศษสมาชิก หรือสั่งทันทีในโหมดผู้เยี่ยมชม
            </p>
          </div>

          {/* Membership Benefits Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '⭐', label: 'สะสมแต้ม', desc: '10.- = 1 pt' },
              { icon: '🎟️', label: 'สลากกินฟรี', desc: 'ทุกออเดอร์' },
              { icon: '⚡', label: 'สูตรโปรด', desc: 'สั่งไว 1 คลิก' },
            ].map((b, i) => (
              <div
                key={i}
                className="p-2.5 rounded-[18px] text-center border border-amber-200/60 bg-gradient-to-b from-amber-50/80 to-orange-50/40"
              >
                <span className="text-xl">{b.icon}</span>
                <p className="font-black text-[11px] text-slate-900 mt-0.5">{b.label}</p>
                <p className="text-[9px] font-bold text-amber-800">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Tabs Switcher */}
          <div className="flex p-1 rounded-[18px] bg-slate-100 border border-slate-200">
            {[
              { id: 'line', label: 'LINE Login' },
              { id: 'phone', label: 'เบอร์โทร' },
              { id: 'demo', label: 'ทดลองบัญชี' },
            ].map((tab) => {
              const isActive = authMode === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    hapticLight()
                    setAuthMode(tab.id as any)
                  }}
                  className={cn(
                    'flex-1 py-2 rounded-[14px] font-black text-xs transition-all cursor-pointer text-center',
                    isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content: LINE */}
          {authMode === 'line' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                disabled={isLoading}
                onClick={handleLine}
                className="w-full h-13 rounded-[20px] text-white font-black text-sm flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-emerald-500/25 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00C300, #00A000)',
                }}
              >
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.086.532c0 .225-.177.405-.399.405h-.001c-.221 0-.399-.18-.399-.405v-.164h.8v.164zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
                </svg>
                <span>{isLoading ? 'กำลังเชื่อมต่อ LINE...' : 'เข้าสู่ระบบด้วย LINE (1-Tap)'}</span>
              </motion.button>
              <p className="text-center text-[10px] font-medium text-slate-400">
                เข้าสู่ระบบปลอดภัยผ่าน LINE Official Account โดยตรง
              </p>
            </motion.div>
          )}

          {/* Tab Content: Phone Login */}
          {authMode === 'phone' && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePhoneLogin}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1 mb-1">
                  เบอร์โทรศัพท์ (10 หลัก)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="เช่น 0812345678"
                  className="w-full h-12 px-4 rounded-[16px] text-sm font-bold border border-slate-200 outline-none focus:border-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider pl-1 mb-1">
                  ชื่อเล่น / นามเรียก (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น คุณกอล์ฟ"
                  className="w-full h-12 px-4 rounded-[16px] text-sm font-bold border border-slate-200 outline-none focus:border-orange-500 bg-white"
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                disabled={isLoading}
                className="w-full h-12 rounded-[18px] text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #FF5500, #E03E00)',
                  boxShadow: '0 4px 16px rgba(255,85,0,0.35)',
                }}
              >
                <Smartphone className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วยเบอร์โทร</span>
              </motion.button>
            </motion.form>
          )}

          {/* Tab Content: Demo Account */}
          {authMode === 'demo' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-[22px] border border-amber-300 bg-amber-50/60 space-y-3 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900">ทดลองใช้งานสมาชิก VIP ทันที</h4>
                <p className="text-[11px] font-medium text-slate-600 mt-1">
                  รับ 150 พอยต์ + ระดับ GOLD ฟรี สำหรับทดสอบระบบแลกของรางวัล สลากกินฟรี และพอยต์ลดเงินสด
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleDemoLogin}
                className="w-full py-3 rounded-[16px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs cursor-pointer shadow-md shadow-amber-500/25"
              >
                เข้าสู่ระบบบัญชีทดสอบทันที
              </motion.button>
            </motion.div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
              หรือ
            </span>
          </div>

          {/* Guest Mode Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleGuestContinue}
            className="w-full py-3.5 rounded-[20px] border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-center gap-2 font-black text-xs text-slate-700 cursor-pointer transition-all"
          >
            <User className="w-4 h-4 text-slate-500" />
            <span>สั่งอาหารในโหมดผู้เยี่ยมชม (ไม่ต้อง Login)</span>
          </motion.button>

          <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
            🛡️ ระบบจดจำประวัติและแต้มสะสมไว้ให้ และสามารถผูก LINE เพื่อรับสิทธิ์ย้อนหลังได้ตลอดเวลา
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
