'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function ConnectRefreshPage() {
  const router = useRouter()

  const handleTryAgain = () => {
    // Redirect back to payments page where they can restart setup
    router.push('/talent/payments')
  }

  const handleContactSupport = () => {
    // You can customize this to your support contact method
    window.location.href = 'mailto:support@localtalents.ca?subject=Payout Account Setup Issue'
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-center">
            Payout Account Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100">
              <ExclamationTriangleIcon className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Setup Needs Attention
            </h2>
            <p className="mt-2 text-gray-600">
              There was an issue completing your payout account setup.
            </p>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTitle className="text-orange-900">What happened?</AlertTitle>
            <AlertDescription className="text-orange-800">
              The setup process may have been interrupted or timed out. This can happen if:
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Your session expired during setup</li>
                <li>You closed the browser window</li>
                <li>There was a network connection issue</li>
                <li>Some required information was missing or invalid</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              How to resolve this:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Return to your payments page</li>
              <li>Click "Set Up Payouts" again</li>
              <li>Complete all required fields in the Stripe form</li>
              <li>Make sure you have the required documents ready:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>Government-issued ID</li>
                  <li>Bank account information</li>
                  <li>Social Insurance Number (SIN)</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleTryAgain}
              className="flex-1"
              size="lg"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Try Setup Again
            </Button>
            <Button 
              onClick={handleContactSupport}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Contact Support
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Our support team is available to assist you with account setup.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
