'use client'

import { Suspense } from 'react'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired' | 'resend'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }

    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
    }
  }, [token, emailParam])

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('verifying')
      
      // Mock API call - replace with actual API
      // const response = await apiClient.post('/auth/verify-email', { token: verificationToken })
      
      // Mock verification logic
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
      
      if (verificationToken === 'expired') {
        setStatus('expired')
        setMessage('This verification link has expired. Please request a new one.')
      } else if (verificationToken === 'invalid') {
        setStatus('error')
        setMessage('Invalid verification token. Please check your email for the correct link.')
      } else {
        setStatus('success')
        setMessage('Your email has been successfully verified! You can now access all features.')
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/business') // or /talent based on user type
        }, 3000)
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Verification failed. Please try again.')
    }
  }

  const resendVerification = async () => {
    try {
      setIsResending(true)
      
      // Mock API call - replace with actual API
      // await apiClient.post('/auth/resend-verification', { email })
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStatus('resend')
      setMessage('A new verification email has been sent to your email address.')
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <ClockIcon className="mx-auto h-16 w-16 text-blue-600 animate-spin" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Email Verified Successfully!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-3">
              <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
              <div className="flex justify-center">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-3">
              <Link href="/login">
                <Button className="w-full">
                  Go to Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <ClockIcon className="mx-auto h-16 w-16 text-yellow-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Link Expired</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            {email && (
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={resendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? 'Sending...' : 'Send New Verification Email'}
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )

      case 'resend':
        return (
          <div className="text-center">
            <EnvelopeIcon className="mx-auto h-16 w-16 text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verification Email Sent</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-blue-800">Check your email</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    We've sent a new verification link to <strong>{email}</strong>. 
                    Click the link in the email to verify your account.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-xs">1</span>
                </div>
                <p className="text-left">Check your spam/junk folder if you don't see the email</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-xs">2</span>
                </div>
                <p className="text-left">Make sure you're clicking the most recent verification link</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-xs">3</span>
                </div>
                <p className="text-left">Contact support if you continue having issues</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
