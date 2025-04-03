'use client'

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error 
    }
  }

  componentDidCatch(error, errorInfo) {
    // You can log to your error reporting service here
    console.error('Error caught by boundary:', error)
    console.error('Component stack:', errorInfo.componentStack)
    
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Something went wrong!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 w-full justify-center"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/lobby'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 w-full justify-center"
              >
                Go to Lobby
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left overflow-x-auto text-sm">
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary