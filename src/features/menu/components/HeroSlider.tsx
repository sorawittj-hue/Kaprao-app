import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, Ticket, Zap, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { hapticLight } from '@/utils/haptics'

interface Slide {
  id: number
  theme: string
  badge?: string
  title: string
  titleAccent?: string
  highlight?: string
  subtitle: string
  action: string
  route: string
  bgFrom: string
  bgTo: string
  accentColor: string
  glowColor: string
  Icon: React.ElementType
  chipText: string
}

const slides: Slide[] = [
  {
    id: 1,
    theme: 'lottery',
    badge: 'EXCLUSIVE',
    title: 'ลุ้นกินฟรี',
    titleAccent: 'ทุกงวด!',
    subtitle: 'สั่งออเดอร์ = ได้ตั๋วลุ้นหวยรัฐบาลฟรี',
    action: 'ดูตั๋วของฉัน',
    route: '/lottery',
    bgFrom: '#064E3B',
    bgTo: '#022C22',
    accentColor: '#34D399',
    glowColor: 'rgba(52,211,153,0.35)',
    Icon: Ticket,
    chipText: '1 ออเดอร์ = 1 ตั๋ว',
  },
  {
    id: 2,
    theme: 'new',
    badge: 'SIGNATURE',
    title: 'กะเพราหมูกรอบ',
    titleAccent: 'คั่วพริกแห้ง',
    subtitle: 'หมูกรอบชิ้นใหญ่ ผัดแห้งรสจัดจ้าน 70.-',
    action: 'สั่งเลย',
    route: '/',
    bgFrom: '#7C2D12',
    bgTo: '#431407',
    accentColor: '#FB923C',
    glowColor: 'rgba(251,146,60,0.35)',
    Icon: Zap,
    chipText: 'เมนูยอดนิยม 🔥',
  },
  {
    id: 3,
    theme: 'vip',
    badge: 'MEMBER REWARDS',
    title: 'สะสมพอยต์',
    titleAccent: 'แลกส่วนลด',
    subtitle: 'ทุก 10 บาท = 1 พอยต์ ใช้แทนเงินสด',
    action: 'ดูคะแนนสะสม',
    route: '/profile',
    bgFrom: '#1E1B4B',
    bgTo: '#0F172A',
    accentColor: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.35)',
    Icon: Crown,
    chipText: 'รับพอยต์ทันที',
  },
]

export function HeroSlider() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const dragStartX = useRef(0)
  const isDragging = useRef(false)

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
    hapticLight()
  }, [])

  const next = useCallback(() => {
    setCurrent(p => (p + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent(p => (p - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return
    timerRef.current = setInterval(() => {
      next()
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isAutoPlaying, next])

  const slide = slides[current]

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX
    isDragging.current = true
    setIsAutoPlaying(false)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const diff = dragStartX.current - e.clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    isDragging.current = false
    setTimeout(() => setIsAutoPlaying(true), 6000)
  }

  return (
    <div
      className="relative overflow-hidden select-none touch-pan-y rounded-[26px] shadow-sm"
      style={{
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="relative min-h-[160px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 p-5 flex flex-col justify-between"
            style={{
              background: `linear-gradient(135deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`,
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -right-8 -top-8 w-44 h-44 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${slide.glowColor} 0%, transparent 70%)`,
                filter: 'blur(28px)',
              }}
            />

            {/* Background Icon Watermark */}
            <div className="absolute right-4 bottom-2 pointer-events-none opacity-15">
              <slide.Icon className="w-24 h-24" style={{ color: slide.accentColor }} />
            </div>

            {/* Header / Badge */}
            <div className="relative z-10 flex items-center justify-between">
              {slide.badge && (
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: slide.accentColor,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {slide.badge}
                </span>
              )}
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/30 text-white/70">
                {current + 1} / {slides.length}
              </span>
            </div>

            {/* Center Content */}
            <div className="relative z-10 my-1">
              <h2 className="text-xl font-black text-white leading-tight flex items-center gap-1.5">
                <span>{slide.title}</span>
                {slide.titleAccent && (
                  <span style={{ color: slide.accentColor }}>{slide.titleAccent}</span>
                )}
              </h2>
              <p className="text-white/80 text-xs font-medium mt-1">
                {slide.subtitle}
              </p>
            </div>

            {/* Action Row */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full text-white/80"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                {slide.chipText}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  hapticLight()
                  navigate(slide.route)
                }}
                className="inline-flex items-center gap-1 text-xs font-black px-3.5 py-1.5 rounded-full cursor-pointer text-slate-950 shadow-md"
                style={{
                  background: slide.accentColor,
                }}
              >
                <span>{slide.action}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`ไปสไลด์ที่ ${i + 1}`}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === current ? 18 : 5,
              height: 4,
              background: i === current ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
