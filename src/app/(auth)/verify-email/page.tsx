'use client'

import { Suspense } from 'react'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyEmail } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    handleEmailVerification(token)
  }, [searchParams])

  const handleEmailVerification = async (token: string) => {
    try {
      setStatus('loading')
      const result = await verifyEmail(token)
      
      if (result.success) {
        setStatus('success')
        setMessage(result.message || 'Email verified successfully!')
        setUser(result.user)
        
        // Redirect to appropriate dashboard after 3 seconds
        setTimeout(() => {
          if (result.user) {
            const targetUrl = result.user.userType === 'business' ? '/business' : '/talent'
            router.push(targetUrl)
          } else {
            router.push('/login')
          }
        }, 3000)
      } else {
        setStatus('error')
        setMessage(result.message || 'Email verification failed')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Email verification failed')
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'success':
        return (
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...'
      case 'success':
        return 'Email Verified Successfully!'
      case 'error':
        return 'Verification Failed'
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-100'
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Status Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${getBackgroundColor()} mb-6`}>
            {getIcon()}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            {message}
          </p>

          {status === 'success' && user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Welcome, {user.firstName}!</strong> Your account is now active. You'll be redirected to your dashboard shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    The verification link may have expired or is invalid. Please try registering again or contact support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {status === 'success' && (
              <button
                onClick={() => {
                  const targetUrl = user?.userType === 'business' ? '/business' : '/talent'
                  router.push(targetUrl)
                }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go to Dashboard
              </button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Register Again
                </Link>
                <Link
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </Link>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-sm text-gray-500">
                Please wait while we verify your email address...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
