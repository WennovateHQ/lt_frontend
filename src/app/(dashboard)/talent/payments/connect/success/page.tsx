'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

export default function ConnectSuccessPage() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [connectStatus, setConnectStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  useEffect(() => {
    verifyConnectStatus()
  }, [])

  const verifyConnectStatus = async () => {
    try {
      setIsVerifying(true)
      // Give Stripe a moment to process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response: any = await apiClient.get('/payments/connect/status')
      setConnectStatus(response)
    } catch (error) {
      console.error('Failed to verify Connect status:', error)
      setError('Unable to verify your payout account status. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCompleteSetup = async () => {
    try {
      setIsGeneratingLink(true)
      
      // Generate a new account link for the user to complete requirements
      const response: any = await apiClient.post(
        `/payments/connect/account/${connectStatus.accountId}/link`,
        { type: 'account_onboarding' }
      )
      
      // Redirect to Stripe to complete missing information
      window.location.href = response.url
    } catch (error) {
      console.error('Failed to generate account link:', error)
      setError('Unable to generate setup link. Please try again.')
      setIsGeneratingLink(false)
    }
  }

  const handleContinue = () => {
    router.push('/talent/payments')
  }

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <ClockIcon className="h-16 w-16 mx-auto text-blue-600 animate-spin" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Verifying Your Account
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we confirm your payout account setup...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if setup is complete
  const isComplete = connectStatus?.detailsSubmitted
  const payoutsEnabled = connectStatus?.payoutsEnabled
  const hasRequirements = connectStatus?.requirements?.currently_due?.length > 0

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-center">
            Payout Account Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert className="border-red-200 bg-red-50">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-900">Verification Failed</AlertTitle>
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          ) : payoutsEnabled ? (
            // Fully verified and ready
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Payout Account Active!
                </h2>
                <p className="mt-2 text-gray-600">
                  Your payout account has been successfully set up and verified.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>You can now withdraw your earnings at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Withdrawals typically arrive in 3-7 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>You'll receive email notifications for all payouts</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-gray-700">
                  <strong>Account Status:</strong> Active and verified
                </p>
                <p className="text-gray-700 mt-1">
                  <strong>Payout Method:</strong> Direct deposit to your bank account
                </p>
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                Continue to Payments
              </Button>
            </>
          ) : isComplete && hasRequirements ? (
            // Additional information needed
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100">
                  <ExclamationTriangleIcon className="h-10 w-10 text-orange-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Additional Information Required
                </h2>
                <p className="mt-2 text-gray-600">
                  Stripe needs more information to complete your account setup.
                </p>
              </div>

              <Alert className="border-orange-200 bg-orange-50">
                <AlertTitle className="text-orange-900">Action Required</AlertTitle>
                <AlertDescription className="text-orange-800">
                  <p className="mb-2">Please complete the following verification steps:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {connectStatus?.requirements?.currently_due?.map((req: string) => {
                      // Format the requirement text more clearly
                      const formatted = req
                        .replace(/individual\.verification\./g, '')
                        .replace(/_/g, ' ')
                        .replace(/proof of liveness/i, 'Identity verification (selfie)')
                        .replace(/document/i, 'ID document upload');
                      return <li key={req} className="capitalize">{formatted}</li>
                    })}
                  </ul>
                  <p className="mt-3 text-sm">
                    Click "Complete Setup" below to provide this information to Stripe.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="text-blue-900">
                  <strong>What is "proof of liveness"?</strong>
                </p>
                <p className="text-blue-800 mt-1">
                  Stripe will ask you to take a quick selfie to verify your identity. This is a security measure to protect both you and the platform.
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleContinue}
                  variant="outline"
                  className="flex-1"
                  disabled={isGeneratingLink}
                >
                  I'll Do This Later
                </Button>
                <Button 
                  onClick={handleCompleteSetup}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={isGeneratingLink}
                >
                  {isGeneratingLink ? (
                    <>
                      <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </>
          ) : isComplete ? (
            // Under review
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                  <ClockIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Account Under Review
                </h2>
                <p className="mt-2 text-gray-600">
                  Your information has been submitted and is being verified by Stripe.
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTitle className="text-blue-900">Verification in Progress</AlertTitle>
                <AlertDescription className="text-blue-800">
                  This usually takes a few minutes to a few hours. You'll receive an email when your account is ready.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="text-gray-700">
                  <strong>What's being verified:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
                  <li>Identity verification</li>
                  <li>Bank account details</li>
                  <li>Business information (if applicable)</li>
                </ul>
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                Continue to Payments
              </Button>
            </>
          ) : (
            // Something went wrong
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                  <ExclamationTriangleIcon className="h-10 w-10 text-gray-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Setup Incomplete
                </h2>
                <p className="mt-2 text-gray-600">
                  It looks like the setup process wasn't completed.
                </p>
              </div>

              <Alert>
                <AlertTitle>What happened?</AlertTitle>
                <AlertDescription>
                  The Stripe onboarding process may have been interrupted. You can restart the setup from your payments page.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                Return to Payments
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
