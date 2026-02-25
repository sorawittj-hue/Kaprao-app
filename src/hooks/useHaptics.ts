import { useCallback } from 'react'
import { hapticLight, hapticMedium, hapticHeavy, hapticSuccess, hapticError, hapticAddToCart } from '@/utils/haptics'

export function useHaptics() {
  const light = useCallback(() => hapticLight(), [])
  const medium = useCallback(() => hapticMedium(), [])
  const heavy = useCallback(() => hapticHeavy(), [])
  const success = useCallback(() => hapticSuccess(), [])
  const error = useCallback(() => hapticError(), [])
  const addToCart = useCallback(() => hapticAddToCart(), [])

  return {
    light,
    medium,
    heavy,
    success,
    error,
    addToCart,
  }
}
