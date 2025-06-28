'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by ErrorBoundary:', event.error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return fallback || (
      <div className="min-h-[40vh] flex items-center justify-center bg-gray-50 p-8 rounded-lg">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-gray-600 max-w-md">
            We encountered an unexpected error. Please try again or return to the dashboard.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setHasError(false)
                window.location.reload()
              }}
            >
              Try again
            </Button>
            <Button
              onClick={() => {
                setHasError(false)
                router.push('/dashboard')
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
