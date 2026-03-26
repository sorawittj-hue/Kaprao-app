import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '@/store'

interface OnboardingSlide {
  id: number
  icon: string
  title: string
  description: string
  color: string
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: '🍛',
    title: 'สั่งอาหารง่าย ไม่ต้อง Login',
    description: 'เลือกเมนูที่ชอบ สั่งได้เลยทันที ไม่ต้องสร้างบัญชีให้ยุ่งยาก',
    color: 'linear-gradient(135deg, #FF6B00, #FF8C42)',
  },
  {
    id: 2,
    icon: '⭐',
    title: 'สะสมแต้ม ทุกออเดอร์',
    description: 'ทุกการสั่งซื้อรับแต้มสะสม แลกส่วนลดและของรางวัลพิเศษ',
    color: 'linear-gradient(135deg, #FFD700, #FFB347)',
  },
  {
    id: 3,
    icon: '🎟️',
    title: 'ลุ้นหวยฟรี ทุกออเดอร์',
    description: 'ทุกออเดอร์ 100 บาท รับตั๋วหวยฟรี ลุ้นรางวัลใหญ่ทุกงวด',
    color: 'linear-gradient(135deg, #22C55E, #10B981)',
  },
  {
    id: 4,
    icon: '🎁',
    title: 'หม่วงวงล้อ รับส่วนลด',
    description: 'หม่วงวงล้อเสี่ยงโชคทุกวัน รับส่วนลดและของรางวัลพิเศษ',
    color: 'linear-gradient(135deg, #EC4899, #F472B6)',
  },
]

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { addToast } = useUIStore()

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('kaprao_onboarding_completed')
    if (hasSeenOnboarding) {
      onComplete()
    }
  }, [onComplete])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      // Complete onboarding
      localStorage.setItem('kaprao_onboarding_completed', 'true')
      addToast({
        type: 'success',
        title: 'พร้อมใช้งานแล้ว! 🎉',
        message: 'เริ่มสั่งอาหารอร่อยกันเลย',
      })
      onComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('kaprao_onboarding_completed', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden bg-white shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-300"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Slide content */}
        <div className="p-8 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-5xl shadow-lg"
                style={{ background: slides[currentSlide].color }}
              >
                {slides[currentSlide].icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-black text-gray-900 mb-3"
              >
                {slides[currentSlide].title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 text-base leading-relaxed mb-8"
              >
                {slides[currentSlide].description}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-brand-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* CTA button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg"
            style={{
              background: slides[currentSlide].color,
              boxShadow: '0 8px 24px -4px rgba(255, 107, 0, 0.4)',
            }}
          >
            {currentSlide === slides.length - 1 ? 'เริ่มใช้งานเลย' : 'ถัดไป'}
          </motion.button>

          {/* Skip button */}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full py-3 text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors mt-2"
            >
              ข้าม
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

