import { useState, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AnimatePresence, motion } from 'framer-motion'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { GlobalErrorBoundary } from '@/components/feedback/GlobalErrorBoundary'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Brief brand splash; skip for users who prefer reduced motion.
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const delay = reduce ? 0 : 800
    const timer = setTimeout(() => setIsInitializing(false), delay)
    return () => clearTimeout(timer)
  }, [])

  return (
    <GlobalErrorBoundary>
      <OfflineIndicator />
      <AnimatePresence mode="wait">
        {isInitializing ? (
          <LoadingScreen key="loader" />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <RouterProvider router={router} />
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalErrorBoundary>
  )
}

export default App
