import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

const slides = [
  {
    id: 1,
    theme: 'lottery',
    title: 'กินฟรี',
    titleAccent: 'ทุกงวด!',
    subtitle: 'ลุ้นกินฟรีจากเลขท้าย Order ID\nตรงหวยรัฐบาล',
    action: 'ดูตั๋วของฉัน',
    icon: '🎟️',
    emoji: '🍀',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    accentColor: '#A78BFA',
    particles: ['✨', '🎯', '🏆', '💫'],
  },
  {
    id: 2,
    theme: 'new',
    title: 'กะเพราหมูกรอบ',
    badge: 'NEW ARRIVAL',
    subtitle: 'หมูกรอบชิ้นใหญ่ ผัดแห้งๆ\nกรอบนอกนุ่มใน เพียง 65.-',
    action: 'สั่งเลย',
    icon: '🌶️',
    emoji: '🔥',
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    accentColor: '#FB923C',
    particles: ['🔥', '🌶️', '💥', '⚡'],
  },
  {
    id: 3,
    theme: 'promo',
    title: 'VIP ONLY',
    highlight: 'ส่วนลดพิเศษ',
    subtitle: 'สะสมแต้มแลกกินฟรี\nสิทธิพิเศษมากมาย',
    action: 'ดูสิทธิพิเศษ',
    icon: '👑',
    emoji: '💎',
    gradient: 'from-amber-500 via-orange-500 to-brand-600',
    accentColor: '#FBBF24',
    particles: ['👑', '💎', '⭐', '🥇'],
  },
]

// Particle fixed in top-right area — never overlaps content on the left
function FloatingParticle({
  emoji,
  delay,
  style,
}: {
  emoji: string
  delay: number
  style: React.CSSProperties
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.85, 0.85, 0],
        scale: [0.6, 1.1, 1, 0.7],
        y: [0, -18, -30, -42],
      }}
      transition={{
        duration: 2.8,
        delay,
        repeat: Infinity,
        repeatDelay: 3.5,
        ease: 'easeOut',
      }}
      className="absolute text-xl pointer-events-none select-none"
      style={style}
    >
      {emoji}
    </motion.span>
  )
}

// Particle positions anchored to the RIGHT half only
const PARTICLE_POSITIONS = [
  { right: '18%', top: '12%' },
  { right: '8%', top: '32%' },
  { right: '28%', top: '22%' },
  { right: '12%', top: '55%' },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const [progress, setProgress] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setProgress(0)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = 5000
    const step = 100 / (interval / 50)

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide()
          return 0
        }
        return prev + step
      })
    }, 50)

    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [isAutoPlaying, nextSlide, currentSlide])

  const slide = slides[currentSlide]

  return (
    <div
      className="relative rounded-[1.75rem] overflow-hidden shadow-2xl"
      style={{ boxShadow: '0 20px 60px -12px rgba(0,0,0,0.28)' }}
      onPointerDown={(e) => {
        dragStartX.current = e.clientX
        setIsDragging(true)
      }}
      onPointerUp={(e) => {
        if (!isDragging) return
        const diff = dragStartX.current - e.clientX
        if (Math.abs(diff) > 40) diff > 0 ? nextSlide() : prevSlide()
        setIsDragging(false)
      }}
    >
      {/* Slide area */}
      <div className="relative" style={{ paddingBottom: '54%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              slide.gradient
            )}
          >
            {/* Background blobs */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 12, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, -18, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute -left-10 -bottom-20 w-44 h-44 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            />

            {/* Large ghost icon — right side decoration */}
            <motion.span
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-2 bottom-0 text-[8rem] leading-none select-none"
              style={{ opacity: 0.13 }}
            >
              {slide.icon}
            </motion.span>

            {/* Floating particles — right half only, staggered */}
            {slide.particles.map((emoji, i) => (
              <FloatingParticle
                key={i}
                emoji={emoji}
                delay={i * 0.75}
                style={PARTICLE_POSITIONS[i]}
              />
            ))}

            {/* ── Content block ───────────────────────────────
                pl-14 keeps text away from left arrow (36px btn + 8px gap ≈ 44px)
                pr-14 keeps text away from right arrow
            ─────────────────────────────────────────────────── */}
            <div className="absolute inset-0 flex flex-col justify-center pl-14 pr-14 pb-8 pt-4">
              {/* Badge */}
              {slide.badge && (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="mb-2"
                >
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[11px] font-black px-3 py-1 rounded-full border border-white/30 tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    {slide.badge}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
              >
                <h2 className="text-[1.6rem] font-black text-white leading-tight drop-shadow-lg">
                  {slide.title}
                  {slide.titleAccent && (
                    <span
                      className="block"
                      style={{
                        color: slide.accentColor,
                        textShadow: `0 0 24px ${slide.accentColor}`,
                      }}
                    >
                      {slide.titleAccent}
                    </span>
                  )}
                  {slide.highlight && (
                    <span className="inline-block bg-white/20 px-2 py-0.5 rounded-lg text-xl ml-2 align-middle">
                      {slide.highlight}
                    </span>
                  )}
                </h2>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.27, duration: 0.38 }}
                className="text-white/80 text-xs mt-1.5 mb-3.5 leading-relaxed"
              >
                {slide.subtitle.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </motion.p>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.38, type: 'spring', stiffness: 280 }}
                whileHover={{ scale: 1.06, boxShadow: '0 8px 28px -4px rgba(0,0,0,0.35)' }}
                whileTap={{ scale: 0.94 }}
                className="bg-white text-gray-900 font-black py-2 px-5 rounded-2xl shadow-lg text-sm inline-flex items-center gap-2 self-start"
              >
                {slide.action}
                <span className="text-base">{slide.emoji}</span>
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Nav arrows — outside content padding ── */}
        <button
          onClick={prevSlide}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/25 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all hover:scale-110"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative overflow-hidden rounded-full transition-all duration-500"
              style={{
                width: index === currentSlide ? 22 : 6,
                height: 6,
                background: index === currentSlide
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.4)',
              }}
            >
              {index === currentSlide && (
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'rgba(255,255,255,0.35)',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
