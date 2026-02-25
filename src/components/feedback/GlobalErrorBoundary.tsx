/**
 * ============================================================================
 * Kaprao52 - Global Error Boundary
 * ============================================================================
 * Catch and handle React errors gracefully
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { logger } from '@/utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    logger.error('React Error Boundary caught:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)

    // Send to error tracking service if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state
    const subject = encodeURIComponent('Bug Report: Kaprao52 Error')
    const body = encodeURIComponent(`
Error: ${error?.message}

Stack Trace:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}

URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Time: ${new Date().toISOString()}
    `.trim())

    window.open(`mailto:support@kaprao52.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback
        error={this.state.error}
        onReload={this.handleReload}
        onGoHome={this.handleGoHome}
        onReport={this.handleReportError}
      />
    }

    return this.props.children
  }
}

// ============================================
// Error Fallback Component
// ============================================
interface ErrorFallbackProps {
  error: Error | null
  onReload: () => void
  onGoHome: () => void
  onReport: () => void
}

function ErrorFallback({ error, onReload, onGoHome, onReport }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black">อุ๊ปส์!</h1>
              <p className="text-white/80 text-sm">มีบางอย่างผิดพลาด</p>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4 leading-relaxed">
            ขออภัยค่ะ/ครับ เกิดข้อผิดพลาดที่ไม่คาดคิด
            ทีมงานได้รับข้อมูลแล้วและจะแก้ไขโดยเร็ว
          </p>

          {/* Error Details (Collapsible in production) */}
          {import.meta.env.DEV && error && (
            <div className="mb-6 p-4 bg-gray-100 rounded-xl">
              <p className="text-xs font-mono text-red-600 break-all">
                {error.toString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              fullWidth
              onClick={onReload}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              โหลดหน้าใหม่
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onGoHome}
                className="flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                หน้าแรก
              </Button>
              <Button
                variant="outline"
                onClick={onReport}
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                รายงานปัญหา
              </Button>
            </div>
          </div>

          {/* Support Info */}
          <p className="text-center text-xs text-gray-400 mt-6">
            หากปัญหายังไม่หาย กรุณาติดต่อเราที่ LINE @kaprao52
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// Async Error Boundary (for data fetching)
// ============================================
interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface AsyncErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Async Error:', error, { componentStack: errorInfo.componentStack })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">ไม่สามารถโหลดข้อมูลได้</p>
          <Button variant="outline" onClick={this.handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================
// Route Error Boundary (for React Router)
// ============================================
export function RouteErrorBoundary() {
  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบหน้านี้</h1>
          <p className="text-gray-500 mb-4">หน้าที่คุณกำลังหาอาจถูกย้ายหรือลบไปแล้ว</p>
          <Button onClick={() => window.location.href = '/'}>
            กลับหน้าแรก
          </Button>
        </div>
      </div>
    </GlobalErrorBoundary>
  )
}

// Type augmentation for Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: Record<string, unknown>) => void
    }
  }
}
