import { useState, useEffect } from 'react'

export function useScrollSpy(
  sectionIds: string[],
  options: { offset?: number; rootMargin?: string } = {}
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const { rootMargin = '0px 0px -80% 0px' } = options

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
