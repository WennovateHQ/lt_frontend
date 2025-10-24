'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'

export default function VerifyEmailSentPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')
  const { resendVerification } = useAuth()

  const handleResendEmail = async () => {
    const email = localStorage.getItem('pendingVerificationEmail')
    if (!email) {
      setResendError('No email found. Please register again.')
      return
    }

    setIsResending(true)
    setResendError('')
    setResendMessage('')

    try {
      const result = await resendVerification(email)
      if (result.success) {
        setResendMessage(result.message || 'Verification email sent successfully!')
      } else {
        setResendError(result.message || 'Failed to resend verification email')
      }
    } catch (error) {
      setResendError('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Email Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <svg 
              className="h-8 w-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Don't see the email?</strong> Check your spam folder or try resending the verification email.
                </p>
              </div>
            </div>
          </div>

          {/* Resend Email Section */}
          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </button>

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-700">{resendMessage}</p>
              </div>
            )}

            {resendError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">{resendError}</p>
              </div>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already verified your email?{' '}
              <Link 
                href="/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
