import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'กำลังโหลด...' }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-surface flex flex-col items-center justify-center"
    >
      {/* Animated Logo */}
      <div className="relative mb-8">
        <motion.div
          className="text-6xl"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🍳
        </motion.div>
        
        {/* Steam particles */}
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute -top-2 left-1/2 text-xl"
            initial={{ opacity: 0, y: 0, x: -8 + i * 8 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: -20,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          >
            💨
          </motion.span>
        ))}
      </div>
      
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-black text-gray-800 mb-2 tracking-wider"
      >
        KAPRAO<span className="text-brand-500">52</span>
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 font-medium"
      >
        {message}
      </motion.p>
      
      {/* Loading dots */}
      <div className="flex gap-1 mt-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-brand-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )
}
