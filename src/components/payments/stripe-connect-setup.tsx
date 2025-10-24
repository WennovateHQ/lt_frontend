'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { ConnectedAccount } from '@/lib/payments/stripe-connect'

interface StripeConnectSetupProps {
  userId: string
  userEmail: string
  connectedAccount?: ConnectedAccount
  onAccountConnected: (account: ConnectedAccount) => void
  onAccountUpdated: (account: ConnectedAccount) => void
}

export function StripeConnectSetup({
  userId,
  userEmail,
  connectedAccount,
  onAccountConnected,
  onAccountUpdated
}: StripeConnectSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleConnectAccount = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/payments/connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userEmail,
          returnUrl: `${window.location.origin}/talent/payments/connected`,
          refreshUrl: `${window.location.origin}/talent/payments/setup`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment account')
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshAccount = async () => {
    if (!connectedAccount) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/payments/account/${connectedAccount.stripeAccountId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh account')
      }

      onAccountUpdated(data.account)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOnboarding = async () => {
    if (!connectedAccount) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/payments/account-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: connectedAccount.stripeAccountId,
          returnUrl: `${window.location.origin}/talent/payments/connected`,
          refreshUrl: `${window.location.origin}/talent/payments/setup`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create onboarding link')
      }

      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getAccountStatusInfo = () => {
    if (!connectedAccount) return null

    const { accountStatus, chargesEnabled, payoutsEnabled, detailsSubmitted, requirements } = connectedAccount

    if (chargesEnabled && payoutsEnabled) {
      return {
        status: 'active',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
        title: 'Account Active',
        description: 'Your payment account is fully set up and ready to receive payments.'
      }
    }

    if (detailsSubmitted && requirements.currently_due.length === 0) {
      return {
        status: 'pending',
        color: 'bg-blue-100 text-blue-800',
        icon: ClockIcon,
        title: 'Under Review',
        description: 'Your account is being reviewed by Stripe. This usually takes 1-2 business days.'
      }
    }

    if (requirements.currently_due.length > 0) {
      return {
        status: 'incomplete',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ExclamationTriangleIcon,
        title: 'Action Required',
        description: `Please complete ${requirements.currently_due.length} required step${requirements.currently_due.length > 1 ? 's' : ''} to activate your account.`
      }
    }

    return {
      status: 'setup',
      color: 'bg-gray-100 text-gray-800',
      icon: ClockIcon,
      title: 'Setup in Progress',
      description: 'Complete your account setup to start receiving payments.'
    }
  }

  const statusInfo = getAccountStatusInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup</h2>
        <p className="text-gray-600">
          Set up your payment account to receive payments for completed projects.
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Account Status */}
      {connectedAccount ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment Account Status
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAccount}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusInfo && (
              <div className="flex items-start space-x-3">
                <statusInfo.icon className="h-6 w-6 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{statusInfo.title}</h3>
                    <Badge className={statusInfo.color}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{statusInfo.description}</p>

                  {/* Action Buttons */}
                  {statusInfo.status === 'incomplete' && (
                    <Button
                      onClick={handleCompleteOnboarding}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Loading...' : 'Complete Setup'}
                    </Button>
                  )}

                  {statusInfo.status === 'active' && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Ready to receive payments</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requirements */}
            {connectedAccount.requirements.currently_due.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Required Information</h4>
                <ul className="space-y-1">
                  {connectedAccount.requirements.currently_due.map((requirement) => (
                    <li key={requirement} className="text-sm text-gray-600 flex items-center">
                      <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500 mr-2" />
                      {requirement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Account Details */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showDetails ? 'Hide' : 'Show'} Account Details
              </button>

              {showDetails && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Account ID:</span>
                      <p className="font-mono text-xs">{connectedAccount.stripeAccountId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Country:</span>
                      <p>{connectedAccount.country.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Currency:</span>
                      <p>{connectedAccount.currency.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Business Type:</span>
                      <p className="capitalize">{connectedAccount.business_type}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <div className={`flex items-center space-x-1 ${connectedAccount.chargesEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Charges {connectedAccount.chargesEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${connectedAccount.payoutsEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                      <BanknotesIcon className="h-3 w-3" />
                      <span>Payouts {connectedAccount.payoutsEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Initial Setup */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Connect Your Payment Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Set up payments to get paid
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect your bank account through Stripe to receive payments securely. 
                This process takes just a few minutes.
              </p>
              
              <Button
                onClick={handleConnectAccount}
                disabled={isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Setting up...' : 'Connect Payment Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Connect Your Payment Account?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Secure Payments</h4>
                <p className="text-sm text-gray-600">
                  All payments are processed securely through Stripe with bank-level encryption.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <BanknotesIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Fast Payouts</h4>
                <p className="text-sm text-gray-600">
                  Receive payments directly to your bank account within 2-3 business days.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <DocumentTextIcon className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Tax Documentation</h4>
                <p className="text-sm text-gray-600">
                  Automatic T4A generation and tax reporting for Canadian compliance.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Milestone Protection</h4>
                <p className="text-sm text-gray-600">
                  Funds are held in escrow until project milestones are completed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">8%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Payment Processing</span>
              <span className="font-medium">2.9% + $0.30 CAD</span>
            </div>
            <div className="flex justify-between items-center py-2 font-medium">
              <span>You Keep</span>
              <span className="text-green-600">~89% of project value</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Example:</strong> For a $1,000 project, you'll receive approximately $890 
              after platform and processing fees.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
