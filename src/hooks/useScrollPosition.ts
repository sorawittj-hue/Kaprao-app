import { useState, useEffect, useRef } from 'react'

interface ScrollPosition {
  x: number
  y: number
  direction: 'up' | 'down' | null
}

export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
  })
  
  const lastY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const direction = currentY > lastY.current ? 'down' : 'up'
      
      setPosition({
        x: window.scrollX,
        y: currentY,
        direction: currentY === lastY.current ? null : direction,
      })
      
      lastY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return position
}

export function useScrollSpy(
  sectionIds: string[],
  options: { offset?: number; rootMargin?: string } = {}
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { offset: _ = 0, rootMargin = '0px 0px -80% 0px' } = options

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id)
          }
        },
        {
          rootMargin,
          threshold: 0,
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sectionIds, rootMargin])

  return activeId
}
