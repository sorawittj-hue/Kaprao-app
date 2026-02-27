import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUIStore, useAuthStore } from '@/store'
import confetti from 'canvas-confetti'
import { cn } from '@/utils/cn'

interface Prize {
  label: string
  code: string | null
  value: number
  color: string
  textColor?: string
}

const PRIZES: Prize[] = [
  { label: 'ลด 5 บาท', code: 'WHEEL5', value: 5, color: '#EF4444' },
  { label: 'ลด 10 บาท', code: 'WHEEL10', value: 10, color: '#F59E0B' },
  { label: 'ลด 20 บาท', code: 'WHEEL20', value: 20, color: '#10B981' },
  { label: 'ลองใหม่', code: null, value: 0, color: '#6B7280' },
  { label: 'ลด 15 บาท', code: 'WHEEL15', value: 15, color: '#10B981' },
  { label: 'ลองใหม่', code: null, value: 0, color: '#3B82F6' },
  { label: 'ลด 30 บาท', code: 'WHEEL30', value: 30, color: '#EC4899' },
  { label: 'ลองใหม่', code: null, value: 0, color: '#14B8A6' },
]

const MAX_SPINS_PER_DAY = 3
const WHEEL_STORAGE_KEY = 'kaprao52_wheel_spins'

interface WheelOfFortuneProps {
  isOpen: boolean
  onClose: () => void
  onWin?: (code: string, value: number) => void
}

export function WheelOfFortune({ isOpen, onClose, onWin }: WheelOfFortuneProps) {
  const { user } = useAuthStore()
  const { addToast } = useUIStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentAngle, setCurrentAngle] = useState(0)
  const [spinsLeft, setSpinsLeft] = useState(MAX_SPINS_PER_DAY)
  const [lastWin, setLastWin] = useState<{ code: string; value: number; label: string } | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Calculate spins left for today
  useEffect(() => {
    if (!user) return
    const today = new Date().toDateString()
    const storageKey = `${WHEEL_STORAGE_KEY}_${user.id}_${today}`
    const spinsUsed = parseInt(localStorage.getItem(storageKey) || '0')
    setSpinsLeft(Math.max(0, MAX_SPINS_PER_DAY - spinsUsed))
  }, [user, isOpen])

  // Draw wheel
  const drawWheel = useCallback((angle: number = 0) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2 - 5
    const sliceAngle = (2 * Math.PI) / PRIZES.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    PRIZES.forEach((prize, i) => {
      const startAngle = i * sliceAngle + angle
      const endAngle = startAngle + sliceAngle

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = prize.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = prize.textColor || '#fff'
      ctx.font = 'bold 12px Kanit, sans-serif'
      ctx.fillText(prize.label, radius - 15, 5)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 3
    ctx.stroke()

    // Center emoji
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '20px sans-serif'
    ctx.fillText('🎰', 0, 0)
    ctx.restore()
  }, [])

  // Initial draw
  useEffect(() => {
    if (isOpen) {
      drawWheel(currentAngle)
    }
  }, [isOpen, drawWheel, currentAngle])

  const spin = () => {
    if (isSpinning || spinsLeft <= 0) return

    setIsSpinning(true)
    setShowResult(false)
    setLastWin(null)

    // Weighted random - "ลองใหม่" is more likely
    const weights = [10, 15, 5, 30, 8, 25, 3, 30]
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = Math.random() * totalWeight
    let winIndex = 0
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i]
      if (rand <= 0) {
        winIndex = i
        break
      }
    }

    const sliceAngle = (2 * Math.PI) / PRIZES.length
    const targetAngle = -(winIndex * sliceAngle + sliceAngle / 2)
    const spinAmount = Math.PI * 2 * (5 + Math.random() * 3) // 5-8 full rotations
    const finalAngle = spinAmount + targetAngle

    const duration = 4000
    const startTime = performance.now()
    const startAngle = currentAngle

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const newAngle = startAngle + finalAngle * eased

      setCurrentAngle(newAngle)
      drawWheel(newAngle)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Spin complete
        setIsSpinning(false)
        const prize = PRIZES[winIndex]
        
        // Save spin count
        if (user) {
          const today = new Date().toDateString()
          const storageKey = `${WHEEL_STORAGE_KEY}_${user.id}_${today}`
          const spinsUsed = parseInt(localStorage.getItem(storageKey) || '0')
          localStorage.setItem(storageKey, (spinsUsed + 1).toString())
          setSpinsLeft(Math.max(0, MAX_SPINS_PER_DAY - spinsUsed - 1))
        }

        if (prize.code) {
          // Winner!
          setLastWin({ code: prize.code, value: prize.value, label: prize.label })
          setShowResult(true)
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [prize.color, '#FFD700', '#FFF'],
          })

          addToast({
            type: 'success',
            title: '🎉 ยินดีด้วย!',
            message: `คุณได้รับ ${prize.label}!`,
          })

          onWin?.(prize.code, prize.value)
        } else {
          // Try again
          addToast({
            type: 'info',
            title: '😅 เสียใจด้วย',
            message: 'ลองใหม่อีกครั้ง!',
          })
        }
      }
    }

    requestAnimationFrame(animate)
  }

  const handleUsePrize = () => {
    if (lastWin?.code) {
      onWin?.(lastWin.code, lastWin.value)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center z-10 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-emerald-600 rounded-2xl mb-3">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">วงล้อเสี่ยงโชค</h2>
            <p className="text-sm text-gray-500 mt-1">
              หมุนเพื่อลุ้นรับส่วนลดพิเศษ!
            </p>
          </div>

          {/* Spins left indicator */}
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: MAX_SPINS_PER_DAY }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-8 h-2 rounded-full transition-colors',
                  i < spinsLeft ? 'bg-gradient-to-r from-pink-500 to-emerald-500' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mb-6">
            เหลือ {spinsLeft} ครั้ง/วัน
          </p>

          {/* Wheel */}
          <div className="relative mx-auto mb-6" style={{ width: 280, height: 280 }}>
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg" />
            </div>
            
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="rounded-full shadow-xl"
              style={{ transform: 'rotate(-90deg)' }}
            />
          </div>

          {/* Result */}
          <AnimatePresence>
            {showResult && lastWin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-700">คุณได้รับ</p>
                    <p className="text-lg font-black text-green-800">{lastWin.label}</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">โค้ดส่วนลด</p>
                  <p className="text-xl font-black text-gray-800 tracking-wider">{lastWin.code}</p>
                </div>
                <Button
                  onClick={handleUsePrize}
                  className="w-full mt-3 bg-green-500 hover:bg-green-600"
                >
                  ใช้โค้ดนี้เลย
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spin button */}
          {!showResult && (
            <Button
              onClick={spin}
              disabled={isSpinning || spinsLeft <= 0}
              isLoading={isSpinning}
              size="lg"
              fullWidth
              className={cn(
                'bg-gradient-to-r from-pink-500 to-emerald-600 hover:from-pink-600 hover:to-emerald-700',
                (spinsLeft <= 0 || isSpinning) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSpinning ? (
                'กำลังหมุน...'
              ) : spinsLeft <= 0 ? (
                'หมดสิทธิ์วันนี้'
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  หมุนเลย!
                </>
              )}
            </Button>
          )}

          {/* Guest notice */}
          {!user && (
            <p className="text-center text-xs text-gray-400 mt-4">
              เข้าสู่ระบบเพื่อเก็บสะสมสิทธิ์หมุน
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WheelOfFortune
