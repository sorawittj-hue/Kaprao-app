import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        duration: 0.35 
      }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  )
}
