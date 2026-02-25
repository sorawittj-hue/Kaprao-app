import type { Spring } from 'framer-motion'

// ============================================
// Spring Configurations
// ============================================

export const springs = {
  // Snappy spring for buttons
  snappy: {
    stiffness: 500,
    damping: 25,
  } as Spring,
  
  // Smooth spring for page transitions
  smooth: {
    stiffness: 300,
    damping: 30,
  } as Spring,
  
  // Bouncy spring for badges/notifications
  bouncy: {
    stiffness: 400,
    damping: 15,
  } as Spring,
  
  // Gentle spring for modals
  gentle: {
    stiffness: 200,
    damping: 25,
  } as Spring,
  
  // Wobbly spring for playful elements
  wobbly: {
    stiffness: 300,
    damping: 10,
  } as Spring,
  
  // Stiff spring for precise movements
  stiff: {
    stiffness: 600,
    damping: 35,
  } as Spring,
}

export const easings = {
  // Custom easing curves
  easeOut: [0.19, 1, 0.22, 1],
  easeIn: [0.7, 0, 0.84, 0],
  easeInOut: [0.87, 0, 0.13, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
}
