/**
 * ============================================================================
 * Kaprao52 - Advanced Animation Hooks
 * ============================================================================
 * Micro-interactions and physics-based animations
 */

import { useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { useEffect, useCallback, useRef, useState } from 'react'

// ============================================
// Physics-based Spring Configs
// ============================================
export const PHYSICS_SPRINGS = {
  // Gentle bounce
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
  // Smooth slide
  smooth: { type: 'spring', stiffness: 300, damping: 30 },
  // Snappy response
  snappy: { type: 'spring', stiffness: 500, damping: 25 },
  // Elastic wobble
  elastic: { type: 'spring', stiffness: 200, damping: 5, mass: 1 },
  // Heavy impact
  heavy: { type: 'spring', stiffness: 100, damping: 15, mass: 2 },
} as const

// ============================================
// Magnetic Button Effect
// ============================================
export function useMagneticButton(strength: number = 0.3) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }, [strength, x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  return { ref, x, y }
}

// ============================================
// Scroll Parallax
// ============================================
export function useParallax(speed: number = 0.5) {
  const y = useMotionValue(0)
  const parallaxY = useTransform(y, (value) => value * speed)

  useEffect(() => {
    const handleScroll = () => {
      y.set(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [y])

  return parallaxY
}

// ============================================
// Drag with Constraints & Elasticity
// ============================================
export function useElasticDrag(constraints: { left: number; right: number; top: number; bottom: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const controls = useAnimation()

  const handleDragEnd = useCallback(() => {
    controls.start({
      x: 0,
      y: 0,
      transition: PHYSICS_SPRINGS.elastic,
    })
  }, [controls])

  return {
    x,
    y,
    rotateX,
    rotateY,
    controls,
    handleDragEnd,
    dragProps: {
      drag: true,
      dragConstraints: constraints,
      dragElastic: 0.2,
      onDragEnd: handleDragEnd,
    },
  }
}

// ============================================
// Count Up Animation
// ============================================
export function useCountUp(end: number, duration: number = 2) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      // Easing function (ease-out-expo)
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = Math.floor(easeOutExpo * end)

      node.textContent = current.toLocaleString()

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return ref
}

// ============================================
// Stagger Children Animation
// ============================================
export function useStaggerAnimation(_itemCount: number, staggerDelay: number = 0.1) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: PHYSICS_SPRINGS.smooth,
    },
  }

  return { container, item }
}

// ============================================
// Pulse Animation on State Change
// ============================================
export function usePulseAnimation(dependency: unknown) {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 },
    })
  }, [dependency, controls])

  return controls
}

// ============================================
// Page Transition
// ============================================
export function usePageTransition() {
  return {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      y: -20,
      filter: 'blur(10px)',
      transition: { duration: 0.3 },
    },
  }
}

// ============================================
// Text Scramble Effect
// ============================================
export function useTextScramble(text: string, trigger: boolean) {
  const [displayText, setDisplayText] = useState(text)
  const chars = '!<>-_\\/[]{}—=+*^?#________'

  useEffect(() => {
    if (!trigger) return

    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((_char, index) => {
            if (index < iteration) {
              return text[index]
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      )

      if (iteration >= text.length) {
        clearInterval(interval)
      }

      iteration += 1 / 3
    }, 30)

    return () => clearInterval(interval)
  }, [text, trigger])

  return displayText
}

