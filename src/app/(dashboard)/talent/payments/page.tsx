'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/contexts/auth-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TaxDocuments } from '@/components/payments/tax-documents'
import { apiClient } from '@/lib/api/client'

interface Earning {
  id: string
  projectTitle: string
  contractTitle: string
  clientName: string
  amount: number
  netAmount: number
  platformFee: number
  status: string
  releaseDate: Date | null
  milestoneTitle: string
  contractId: string
  milestoneId: string | null
}

interface EarningsSummary {
  totalEarnings: number
  totalNetEarnings: number
  totalFees: number
  earningsCount: number
  stripeBalance?: number // Actual available balance in Stripe Connect account
}

export default function TalentPaymentsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    totalNetEarnings: 0,
    totalFees: 0,
    earningsCount: 0,
    stripeBalance: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false)
  const [showConnectSetupModal, setShowConnectSetupModal] = useState(false)
  const [hasConnectAccount, setHasConnectAccount] = useState(false)
  const [isCheckingConnect, setIsCheckingConnect] = useState(false)
  const [isSettingUpConnect, setIsSettingUpConnect] = useState(false)
  
  useEffect(() => {
    fetchEarnings()
    checkConnectStatus()
  }, [])
  
  const fetchEarnings = async () => {
    try {
      setIsLoading(true)
      const response: any = await apiClient.get('/payments/earnings')
      console.log('📊 Earnings data loaded:', response)
      
      setEarnings(response.earnings || [])
      setSummary(response.summary || {
        totalEarnings: 0,
        totalNetEarnings: 0,
        totalFees: 0,
        earningsCount: 0,
        stripeBalance: 0
      })
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
      setError('Failed to load earnings data')
    } finally {
      setIsLoading(false)
    }
  }

  const checkConnectStatus = async () => {
    try {
      setIsCheckingConnect(true)
      const response: any = await apiClient.get('/payments/connect/status')
      setHasConnectAccount(response.payoutsEnabled || false)
    } catch (error) {
      console.log('Connect account not set up yet')
      setHasConnectAccount(false)
    } finally {
      setIsCheckingConnect(false)
    }
  }

  const handleSetupConnect = async () => {
    try {
      setIsSettingUpConnect(true)
      const response: any = await apiClient.post('/payments/connect/account', {
        type: 'express',
        country: 'CA'
      })
      
      // Redirect to Stripe onboarding
      window.location.href = response.onboardingUrl
    } catch (error: any) {
      console.error('Failed to create Connect account:', error)
      alert('Failed to set up payout account. Please try again.')
      setIsSettingUpConnect(false)
    }
  }

  const handleWithdraw = async (amount: number) => {
    try {
      await apiClient.post('/payments/withdraw', { amount })
      setShowWithdrawModal(false)
      fetchEarnings() // Refresh data
      alert('Withdrawal request submitted successfully!')
    } catch (error: any) {
      console.error('Withdrawal failed:', error)
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error'
      const errorCode = error.response?.data?.code
      
      // Handle specific error types
      if (errorCode === 'STRIPE_CONNECT_REQUIRED' || 
          errorMessage.includes('Stripe Connect account required')) {
        // No Connect account - trigger setup
        setShowWithdrawModal(false)
        setShowConnectSetupModal(true)
      } else if (errorCode === 'PAYOUTS_NOT_ENABLED' || 
                 errorCode === 'VERIFICATION_REQUIRED' ||
                 errorCode === 'ACCOUNT_SETUP_INCOMPLETE' ||
                 errorMessage.includes('verification') ||
                 errorMessage.includes('not ready')) {
        // Account exists but needs verification
        setShowWithdrawModal(false)
        alert(errorMessage + '\n\nPlease complete your payout account verification.')
        // Redirect to success page to complete verification
        window.location.href = '/talent/payments/connect/success'
      } else if (errorCode === 'CONNECT_INSUFFICIENT_BALANCE' ||
                 errorMessage.includes('insufficient funds') ||
                 errorMessage.includes('balance is too low')) {
        // Connect account has no funds - payment not released yet
        setShowWithdrawModal(false)
        alert('Your Connect account has insufficient funds.\n\n' +
              'Please ensure the business has released payment for your completed milestones.\n\n' +
              'Payment is released after the business approves your deliverables.')
      } else {
        // Generic error
        setShowWithdrawModal(false)
        alert('Withdrawal failed: ' + errorMessage)
      }
    }
  }

  const handleBankDetailsSubmit = async (data: any) => {
    try {
      await apiClient.post('/payments/setup-bank-account', data)
      setShowBankDetailsModal(false)
      alert('Bank details saved successfully!')
    } catch (error) {
      console.error('Failed to save bank details:', error)
      alert('Failed to save bank details. Please try again.')
    }
  }
  
  const totalEarnings = summary.totalEarnings
  const availableBalance = summary.stripeBalance || 0 // Use actual Stripe account balance

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 mx-auto text-gray-400 animate-spin" />
          <p className="mt-4 text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchEarnings} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
        <p className="text-gray-600">Track your earnings, payments, and withdrawal history</p>
      </div>

      {/* Connect Account Setup Alert */}
      {!hasConnectAccount && !isCheckingConnect && (
        <Alert className={availableBalance > 0 ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
          <ExclamationTriangleIcon className={`h-5 w-5 ${availableBalance > 0 ? 'text-orange-600' : 'text-blue-600'}`} />
          <AlertTitle className={availableBalance > 0 ? "text-orange-900" : "text-blue-900"}>
            Payout Account Setup Required
          </AlertTitle>
          <AlertDescription className={availableBalance > 0 ? "text-orange-800" : "text-blue-800"}>
            {availableBalance > 0 ? (
              <>
                You have <strong>{formatCurrency(availableBalance)}</strong> available to withdraw. Set up your payout account to access your funds.
              </>
            ) : (
              <>
                Set up your payout account now to be ready to receive payments when clients release milestone funds.
              </>
            )}
            <Button 
              onClick={() => setShowConnectSetupModal(true)}
              size="sm"
              className={`mt-3 ${availableBalance > 0 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Set Up Payout Account
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gross Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-sm text-gray-600 mt-1">{summary.earningsCount} payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available to Withdraw</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(availableBalance)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Current Stripe account balance</p>
            {summary.totalNetEarnings !== availableBalance && (
              <p className="text-xs text-gray-500 mt-1">
                Total net earned: {formatCurrency(summary.totalNetEarnings)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalFees)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              8% base fee + GST/HST
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {user?.profile?.gstHstNumber || 'N/A' 
                ? '✓ GST/HST registered - tax exempt' 
                : '⚠️ GST/HST applies - add number to save'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="tax-docs">Tax Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Earnings</h3>
            {availableBalance > 0 && (
              <Button onClick={() => setShowWithdrawModal(true)}>
                <BanknotesIcon className="w-4 h-4 mr-2" />
                Withdraw {formatCurrency(availableBalance)}
              </Button>
            )}
          </div>

          {earnings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BanknotesIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Earnings Yet</h3>
                <p className="text-gray-600 mb-4">
                  Your earnings will appear here once clients release milestone payments.
                </p>
                {!hasConnectAccount && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <CreditCardIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Get Ready for Payments</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Set up your payout account now so you can withdraw funds immediately when you complete milestones.
                        </p>
                        <Button 
                          onClick={() => setShowConnectSetupModal(true)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          Set Up Payout Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {earnings.map(earning => (
                <Card key={earning.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <BanknotesIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{earning.projectTitle}</h4>
                          <p className="text-sm text-gray-600">{earning.clientName}</p>
                          <p className="text-sm text-gray-500">Milestone: {earning.milestoneTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold">{formatCurrency(earning.amount)}</p>
                        <p className="text-sm text-green-600">
                          Net: {formatCurrency(earning.netAmount)}
                        </p>
                        <Badge className={getStatusColor(earning.status)}>
                          {earning.status}
                        </Badge>
                        {earning.releaseDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Released {formatDate(new Date(earning.releaseDate))}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Withdrawal History</h3>
            <Button variant="outline" onClick={() => setShowBankDetailsModal(true)}>
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Manage Bank Details
            </Button>
          </div>

          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircleIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Withdrawals Yet</h3>
              <p className="text-gray-600">
                Your withdrawal history will appear here once you request payouts.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Available balance: {formatCurrency(availableBalance)}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax-docs">
          <TaxDocuments />
        </TabsContent>
      </Tabs>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Available Balance</Label>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(availableBalance)}
              </div>
            </div>
            <div>
              <Label htmlFor="withdraw-amount">Withdrawal Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Enter amount"
                max={availableBalance}
                defaultValue={availableBalance}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-sm">
              <p className="text-blue-800">
                • Funds will be transferred to your registered bank account<br />
                • Processing time: 2-5 business days<br />
                • Minimum withdrawal: $50.00
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const input = document.getElementById('withdraw-amount') as HTMLInputElement
              handleWithdraw(parseFloat(input.value))
            }}>
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Details Modal */}
      <Dialog open={showBankDetailsModal} onOpenChange={setShowBankDetailsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Bank Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input id="account-holder" placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input id="account-number" placeholder="000123456789" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="routing-number">Routing Number</Label>
                <Input id="routing-number" placeholder="000000000" />
              </div>
              <div>
                <Label htmlFor="account-type">Account Type</Label>
                <select
                  id="account-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-sm">
              <p className="text-amber-800">
                🔒 Your banking information is encrypted and securely stored
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBankDetailsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const data = {
                accountHolderName: (document.getElementById('account-holder') as HTMLInputElement).value,
                accountNumber: (document.getElementById('account-number') as HTMLInputElement).value,
                routingNumber: (document.getElementById('routing-number') as HTMLInputElement).value,
                accountType: (document.getElementById('account-type') as HTMLSelectElement).value,
              }
              handleBankDetailsSubmit(data)
            }}>
              Save Bank Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stripe Connect Setup Modal */}
      <Dialog open={showConnectSetupModal} onOpenChange={setShowConnectSetupModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Up Payout Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BanknotesIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Stripe Connect Account Required
                  </h4>
                  <p className="text-sm text-blue-800">
                    To receive payouts, you need to complete a quick setup with Stripe, our secure payment processor.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">What you'll need:</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Personal information (name, date of birth, address)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Bank account details for direct deposits</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Government-issued ID for verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Social Insurance Number (SIN) for tax purposes</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong className="text-gray-900">Setup takes ~5 minutes.</strong> You'll be redirected to Stripe's secure platform to complete the process.
              </p>
              <p>
                Once verified, withdrawals typically arrive in 3-7 business days.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConnectSetupModal(false)}
              disabled={isSettingUpConnect}
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleSetupConnect}
              disabled={isSettingUpConnect}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSettingUpConnect ? (
                <>
                  <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Continue to Stripe
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
