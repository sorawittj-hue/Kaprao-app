import { useRef, useState, useCallback, useMemo } from 'react'

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    
    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)
    
    // Magnetic strength (lower is stronger)
    const strength = 0.35
    setPosition({ x: x * strength, y: y * strength })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  const magneticProps = useMemo(() => ({
    ref,
    onMouseMove: (e: React.MouseEvent) => handleMouseMove(e.nativeEvent),
    onMouseLeave: handleMouseLeave,
    animate: { x: position.x, y: position.y },
    transition: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }
  }), [handleMouseMove, handleMouseLeave, position])

  return magneticProps
}
