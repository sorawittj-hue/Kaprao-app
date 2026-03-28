import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function LoadingScreen() {
  const [text] = useState('KAPRAO')
  const [dots, setDots] = useState('')

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)
    return () => clearInterval(dotsInterval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface overflow-hidden"
    >
      {/* Background Glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[300px] h-[300px] bg-brand-500/20 blur-[100px] rounded-full"
      />

      <div className="relative flex flex-col items-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-[24px] flex items-center justify-center shadow-2xl mb-8 relative"
          style={{ boxShadow: '0 20px 40px -10px rgba(255, 107, 0, 0.5)' }}
        >
          <span className="text-white font-black text-4xl">K</span>
          {/* Flame effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-4 text-2xl"
          >
            🔥
          </motion.div>
        </motion.div>

        {/* Text Animation */}
        <div className="flex flex-col items-center gap-1">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black tracking-[0.2em] text-gray-800"
          >
            {text}
            <span className="text-brand-500">52</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400 flex items-center gap-1"
          >
            AUTHENTIC THAI SOUL{dots}
          </motion.p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-20 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="h-full bg-brand-500"
        />
      </div>
    </motion.div>
  )
}
