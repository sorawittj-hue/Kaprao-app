export function vibrate(pattern: number | number[] = 10): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export function hapticLight(): void {
  vibrate(10)
}

export function hapticMedium(): void {
  vibrate(20)
}

export function hapticHeavy(): void {
  vibrate([30, 50, 30])
}

export function hapticSuccess(): void {
  vibrate([10, 50, 10, 50, 20])
}

export function hapticError(): void {
  vibrate([50, 100, 50])
}

export function hapticAddToCart(): void {
  vibrate([5, 30, 10])
}
