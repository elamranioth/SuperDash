import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

interface Props {
  appName?: string
  onClose?: () => void
  children: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
}

// Global in-memory diagnostic log for recent application errors
export interface DiagnosticError {
  appName: string
  message: string
  time: string
}

export const DIAGNOSTIC_ERRORS: DiagnosticError[] = []

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred'
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorRecord: DiagnosticError = {
      appName: this.props.appName || 'Unknown App',
      message: error.message || 'Unknown error',
      time: new Date().toLocaleTimeString()
    }
    DIAGNOSTIC_ERRORS.unshift(errorRecord)
    if (DIAGNOSTIC_ERRORS.length > 20) {
      DIAGNOSTIC_ERRORS.pop()
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(`[AppErrorBoundary] Error in ${this.props.appName}:`, error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  public render() {
    if (this.state.hasError) {
      const name = this.props.appName || 'Application'

      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center bg-slate-950/90 text-white select-none">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
            {name} Could Not Open
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
            Something went wrong while displaying {name}. Your data is safely stored and has not been affected.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg transition active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
