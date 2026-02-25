import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    console.error('💥 ErrorBoundary caught error:', error)
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 Error details:', error)
    console.error('💥 Component stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  private handleReset = () => {
    console.log('🔄 Resetting error boundary...')
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💥</span>
            </div>
            
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              เกิดข้อผิดพลาด
            </h1>
            
            <p className="text-gray-500 mb-6">
              ขออภัย แอพพลิเคชันเกิดข้อผิดพลาด unexpectedly
            </p>

            {this.state.error && (
              <div className="bg-gray-100 rounded-xl p-4 mb-6 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <Button 
              onClick={this.handleReset}
              fullWidth
            >
              โหลดใหม่
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
