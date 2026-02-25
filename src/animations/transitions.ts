import type { Transition } from 'framer-motion'
import { easings } from './springs'

// ============================================
// Page Transition Configurations
// ============================================

export const pageTransitions = {
  // Default fade transition
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  // Slide right (for forward navigation)
  slideRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: easings.easeOut },
  },
  
  // Slide left (for back navigation)
  slideLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3, ease: easings.easeOut },
  },
  
  // Slide up (for modals/sheets)
  slideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 30 
    } as Transition,
  },
  
  // Scale (for popovers)
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  },
}

// Get transition based on navigation direction
export function getPageTransition(direction: 'forward' | 'back' = 'forward') {
  return direction === 'forward' 
    ? pageTransitions.slideRight 
    : pageTransitions.slideLeft
}
