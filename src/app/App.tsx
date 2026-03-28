import { useState, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AnimatePresence, motion } from 'framer-motion'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Artificial delay to show beauty of the brand splash
    const timer = setTimeout(() => setIsInitializing(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isInitializing ? (
        <LoadingScreen key="loader" />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full"
        >
          <RouterProvider router={router} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
