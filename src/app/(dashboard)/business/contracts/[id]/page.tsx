'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import StripePaymentForm from '@/components/payments/StripePaymentForm'
import { DeliverableManagement } from '@/components/milestones/deliverable-management'
import { TimesheetView } from '@/components/time-tracking/timesheet-view'
import { BiweeklyPaymentModal } from '@/components/payments/biweekly-payment-modal'
import { LocationUpdateModal } from '@/components/profile/location-update-modal'

interface Contract {
  id: string
  title: string
  description: string
  terms: string
  scopeOfWork?: string
  deliverables?: string
  paymentSchedule?: string
  duration?: string
  cancellationPolicy?: string
  intellectualPropertyRights?: string
  status: string
  type?: string
  totalAmount: number
  hourlyRate?: number
  estimatedHours?: number
  startDate?: string
  endDate?: string
  createdAt: string
  businessSignedAt?: string
  talentSignedAt?: string
  project: {
    id: string
    title: string
    description: string
    type?: 'HOURLY' | 'FIXED_PRICE'
    business?: {
      profile?: {
        companyName?: string
      }
    }
  }
  talent: {
    id: string
    profile: {
      firstName: string
      lastName: string
      displayName: string
      avatar?: string
      title?: string
    }
  }
  business: {
    id: string
    profile: {
      firstName: string
      lastName: string
      displayName: string
      companyName?: string
      avatar?: string
    }
  }
  application: {
    id: string
    proposedRate: number
    estimatedHours?: number
  }
  milestones: Array<{
    id: string
    title: string
    description: string
    amount: number
    status: string
    dueDate?: string
    order: number
  }>
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string
  
  console.log('Contract Detail Page - params:', params)
  console.log('Contract Detail Page - contractId:', contractId)
  
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [escrowStatus, setEscrowStatus] = useState<any>(null)
  const [isFundingEscrow, setIsFundingEscrow] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [paymentBreakdown, setPaymentBreakdown] = useState<any>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showBiweeklyPayment, setShowBiweeklyPayment] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  useEffect(() => {
    if (contractId) {
      fetchContract()
    } else {
      console.error('No contractId found in params')
      setError('Invalid contract ID')
      setIsLoading(false)
    }
  }, [contractId])

  const fetchContract = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import('@/lib/api/client')
      const response = await apiClient.get(`/contracts/${contractId}`) as Contract
      
      setContract(response)
      
      // Fetch escrow status for all contracts (escrow can be funded before contract becomes ACTIVE)
      try {
        const escrowResponse = await apiClient.get(`/contracts/${contractId}/escrow/status`) as any
        console.log('Escrow status loaded:', escrowResponse)
        setEscrowStatus(escrowResponse)
        setPaymentBreakdown((escrowResponse as any).breakdown)
      } catch (escrowError) {
        console.error('Failed to fetch escrow status:', escrowError)
        // Don't set error state for escrow, just log it
        // Escrow might not exist yet, which is fine
      }
    } catch (error) {
      console.error('Failed to fetch contract:', error)
      setError('Failed to load contract details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending_signatures': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'disputed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCompleteMilestone = async (milestoneId: string, milestoneTitle: string, amount: number) => {
    const confirmed = confirm(
      `Release payment for milestone "${milestoneTitle}" ($${amount})?\n\n` +
      `This will:\n` +
      `• Transfer funds from escrow to talent's payout account\n` +
      `• Mark milestone as approved and paid\n` +
      `• Enable talent to withdraw funds\n\n` +
      `Ensure deliverables have been reviewed and approved before proceeding.`
    )
    
    if (!confirmed) return
    
    try {
      const { apiClient } = await import('@/lib/api/client')
      // Call correct endpoint: POST /api/payments/milestone/release
      const response = await apiClient.post('/payments/milestone/release', {
        milestoneId
      })
      
      console.log('✅ Milestone payment released:', response)
      
      // Refresh contract data to show updated milestone status
      await fetchContract()
      
      alert(`Payment of $${amount} has been released to the talent's payout account!\n\nThey can now withdraw these funds.`)
    } catch (error: any) {
      console.error('Error releasing milestone payment:', error)
      const errorMessage = error.response?.data?.error || 'Failed to release payment'
      alert(`${errorMessage}\n\nPlease ensure:\n• Milestone has been submitted by talent\n• Talent has set up their payout account`)
    }
  }

  const handleSendMessage = () => {
    // Navigate to messages with this talent
    router.push(`/business/messages?talentId=${contract?.talent.id}`)
  }

  const handleDownloadContract = () => {
    // TODO: Implement contract PDF download
    console.log('Download contract:', contract?.id)
    // For now, show a placeholder
    alert('Contract download feature coming soon!')
  }

  const handleSignContract = () => {
    // TODO: Implement contract signing
    console.log('Sign contract:', contract?.id)
    alert('Contract signing feature coming soon!')
  }

  const handleModifyContract = () => {
    // Navigate to contract edit page
    router.push(`/business/contracts/${contract?.id}/edit`)
  }

  const handleFundEscrow = async () => {
    if (!contract) return
    
    try {
      setIsFundingEscrow(true)
      const { apiClient } = await import('@/lib/api/client')
      
      // Create Stripe Payment Intent for escrow funding
      const response = await apiClient.post(`/contracts/${contract.id}/escrow/fund`, {}) as any
      console.log('Stripe Payment Intent created:', response)
      
      if (response.clientSecret && response.paymentIntentId) {
        // Store payment intent details for the payment form
        setPaymentIntent({
          id: response.paymentIntentId,
          clientSecret: response.clientSecret,
          amount: response.amount,
          currency: 'cad' // All payments are in CAD
        })
        setPaymentBreakdown(response.breakdown)
        setShowPaymentForm(true)
      } else {
        console.error('Invalid response structure:', response)
        throw new Error('No payment intent received from server')
      }
      
    } catch (error: any) {
      console.error('Failed to create payment intent:', error)
      
      // Check if error is due to missing location
      if (error.response?.data?.error === 'LOCATION_REQUIRED' || error.response?.data?.requiresLocationUpdate) {
        setShowLocationModal(true)
      } 
      // Check if escrow already funded
      else if (error.response?.data?.error === 'ESCROW_ALREADY_FUNDED') {
        alert('This contract\'s escrow has already been funded.')
      }
      // Check if error is due to talent not having Stripe Connect setup
      else if (
        error.response?.data?.error === 'TALENT_PAYOUT_NOT_SETUP' || 
        error.response?.data?.error === 'TALENT_PAYOUT_NOT_ACTIVE' ||
        error.response?.data?.requiresTalentStripeSetup
      ) {
        const talentName = contract?.talent?.profile?.displayName || 'the talent'
        alert(
          `⚠️ Payout Account Required\n\n` +
          `${error.response?.data?.message}\n\n` +
          `${talentName} needs to set up their payout account:\n` +
          `1. Go to their Payments page\n` +
          `2. Complete Stripe Connect setup\n` +
          `3. Connect their bank account\n\n` +
          `They will receive an email notification with instructions.\n` +
          `Once they complete setup, you can fund the escrow.`
        )
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate escrow funding'
        alert(errorMessage)
      }
    } finally {
      setIsFundingEscrow(false)
    }
  }
  
  const handleLocationUpdated = async () => {
    // After location is updated, refresh contract data to get updated business profile
    setShowLocationModal(false)
    
    try {
      console.log('📍 Location updated, refreshing contract data...')
      
      // Refresh contract data to get updated business profile with location
      await fetchContract()
      
      console.log('✅ Contract refreshed, retrying escrow funding...')
      
      // Retry funding escrow with fresh data that now includes the location
      await handleFundEscrow()
    } catch (error) {
      console.error('Failed to refresh contract or fund escrow after location update:', error)
      alert('Location updated successfully. Please click "Fund Escrow" again to proceed.')
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      // Refresh contract and escrow status after successful payment
      setShowPaymentForm(false)
      setPaymentIntent(null)
      setPaymentBreakdown(null)
      
      // Refresh all contract data
      await fetchContract()
      
      alert('🎉 Escrow funded successfully! The talent has been notified and can now start working.')
    } catch (error) {
      console.error('Failed to refresh contract data:', error)
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error)
    alert(`Payment failed: ${error}`)
    setShowPaymentForm(false)
    setPaymentIntent(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Contract not found'}</p>
          <p className="text-sm text-gray-600 mb-4">
            Contract ID: {contractId || 'undefined'}<br/>
            URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
          </p>
          <div className="space-x-2">
            <Button onClick={() => router.back()}>Go Back</Button>
            <Button variant="outline" onClick={() => router.push('/business/contracts')}>
              View All Contracts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-gray-600">Contract Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(contract.status)}>
            {contract.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleSendMessage}>
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            Messages
          </Button>
          {contract.status === 'pending_signatures' && (
            <Button size="sm" onClick={handleSignContract}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Sign Contract
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{contract.description}</p>
              </div>
              
              {contract.scopeOfWork && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Scope of Work</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{contract.scopeOfWork}</p>
                </div>
              )}

              {contract.deliverables && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Deliverables Summary</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{contract.deliverables}</p>
                </div>
              )}

              {contract.paymentSchedule && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Payment Schedule</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{contract.paymentSchedule}</p>
                </div>
              )}

              {contract.duration && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Project Duration</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{contract.duration}</p>
                </div>
              )}

              {/* Contract Terms Section */}
              {contract.terms && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Contract Terms</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
                  </div>
                </div>
              )}

              {/* Contract Parties */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contract Parties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Business (Client)</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {(contract as any).businessName || 
                          (contract as any).business?.profile?.companyName || 
                          contract.project?.business?.profile?.companyName || 
                          'Business Name'}
                      </p>
                      {(contract as any).businessAddress && (
                        <p className="text-sm text-gray-600">
                          <strong>Address:</strong> {(contract as any).businessAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Talent (Contractor)</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {(contract as any).talentName || 
                          (contract.talent?.profile ? 
                            `${contract.talent.profile.firstName || ''} ${contract.talent.profile.lastName || ''}`.trim() || 
                            contract.talent.profile.displayName || 
                            'Talent Name' 
                            : 'Talent Name')}
                      </p>
                      {(contract as any).talentAddress && (
                        <p className="text-sm text-gray-600">
                          <strong>Address:</strong> {(contract as any).talentAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Terms Section */}
              {(contract.cancellationPolicy || contract.intellectualPropertyRights || contract.terms) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Legal Terms & Policies</h3>
                  <div className="space-y-3">
                    {contract.cancellationPolicy && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Cancellation Policy</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{contract.cancellationPolicy}</p>
                      </div>
                    )}
                    
                    {contract.intellectualPropertyRights && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Intellectual Property Rights</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{contract.intellectualPropertyRights}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Financial Details</h3>
                  <div className="space-y-2">
                    {contract.project?.type === 'HOURLY' ? (
                      <>
                        {contract.hourlyRate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hourly Rate:</span>
                            <span className="font-medium">{formatCurrency(contract.hourlyRate)}/hr</span>
                          </div>
                        )}
                        {(contract as any).estimatedHours && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Hours:</span>
                            <span className="font-medium">{(contract as any).estimatedHours} hours</span>
                          </div>
                        )}
                        {contract.hourlyRate && (contract as any).estimatedHours && (
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Estimated Total:</span>
                            <span className="font-medium">{formatCurrency(contract.hourlyRate * (contract as any).estimatedHours)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium">{formatCurrency(contract.totalAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Type:</span>
                      <span className="font-medium capitalize">{contract.project?.type === 'HOURLY' ? 'Hourly' : 'Fixed Price'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                  <div className="space-y-2">
                    {contract.startDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{formatDate(new Date(contract.startDate))}</span>
                      </div>
                    )}
                    {(contract as any).completionDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Date:</span>
                        <span className="font-medium">{formatDate(new Date((contract as any).completionDate))}</span>
                      </div>
                    )}
                    {contract.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{formatDate(new Date(contract.endDate))}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(new Date(contract.createdAt))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          {contract.milestones && contract.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getMilestoneStatusColor(milestone.status)} variant="secondary">
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                          <span className="font-medium">{formatCurrency(milestone.amount)}</span>
                        </div>
                      </div>
                      
                      {(milestone as any).deliverables && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Deliverables:</h5>
                          <p className="text-sm text-gray-600">{(milestone as any).deliverables}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {milestone.dueDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Due: {formatDate(new Date(milestone.dueDate))}</span>
                          </div>
                        )}
                        {(milestone as any).percentage && (
                          <span>{(milestone as any).percentage}% of total</span>
                        )}
                      </div>
                      
                      {/* Deliverable Management for Business Users */}
                      {(contract.status === 'ACTIVE' || contract.status === 'IN_PROGRESS') && (
                        <div className="mt-4 pt-4 border-t">
                          <DeliverableManagement
                            milestoneId={milestone.id}
                            userRole="business"
                            canEdit={false}
                            onUpdate={() => {
                              // Refresh contract data when deliverables are updated
                              console.log('🔄 Refreshing contract after deliverable update...')
                              fetchContract()
                            }}
                          />
                          
                          {/* Complete Milestone & Release Payment Button */}
                          {(() => {
                            const hasPayment = (milestone as any).payments && (milestone as any).payments.length > 0
                            const isPaid = hasPayment && (milestone as any).payments[0].status === 'COMPLETED'
                            
                            // Check if all deliverables are approved
                            const deliverables = (milestone as any).deliverables || []
                            const allDeliverablesApproved = deliverables.length > 0 && deliverables.every((d: any) => d.status === 'APPROVED')
                            const hasDeliverables = deliverables.length > 0
                            
                            console.log(`Milestone ${index + 1} status:`, milestone.status, 'Has payment:', hasPayment, 'Is paid:', isPaid, 'Deliverables:', deliverables.length, 'All approved:', allDeliverablesApproved)
                            
                            // Button should be enabled when:
                            // 1. Milestone is SUBMITTED (ready for approval)
                            // 2. All deliverables are approved (if there are deliverables)
                            const canRelease = milestone.status === 'SUBMITTED' && (!hasDeliverables || allDeliverablesApproved)
                            
                            return canRelease || isPaid ? (
                              <div className="mt-4 flex justify-end">
                                {isPaid ? (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span className="font-medium">
                                      Payment Released (${(milestone as any).payments[0].amount})
                                    </span>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => handleCompleteMilestone(milestone.id, milestone.title, milestone.amount)}
                                    disabled={!canRelease}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!canRelease ? (hasDeliverables && !allDeliverablesApproved ? 'All deliverables must be approved' : 'Milestone must be submitted') : ''}
                                  >
                                    Complete Milestone & Release Payment (${milestone.amount})
                                  </Button>
                                )}
                              </div>
                            ) : null
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Tracking for Hourly Contracts */}
          {contract.project?.type === 'HOURLY' && (contract.status === 'ACTIVE' || contract.status === 'IN_PROGRESS') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Time Tracking & Payments</CardTitle>
                  <Button 
                    onClick={() => setShowBiweeklyPayment(true)}
                    disabled={!contract.hourlyRate}
                  >
                    Process Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TimesheetView
                  contractId={contractId}
                  userRole="business"
                  canEdit={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Signature Status */}
          <Card>
            <CardHeader>
              <CardTitle>Signature Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${contract.businessSignedAt ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-medium">Business Signature</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {contract.businessSignedAt ? (
                      <span className="text-green-600">
                        Signed {formatRelativeTime(new Date(contract.businessSignedAt))}
                      </span>
                    ) : (
                      <span>Pending</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${contract.talentSignedAt ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-medium">Talent Signature</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {contract.talentSignedAt ? (
                      <span className="text-green-600">
                        Signed {formatRelativeTime(new Date(contract.talentSignedAt))}
                      </span>
                    ) : (
                      <span>Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Funding - Show when contract is fully signed */}
          {contract.status === 'ACTIVE' && contract.businessSignedAt && contract.talentSignedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Escrow Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {escrowStatus?.needsFunding ? (
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Escrow Funding Required</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              To activate this project, you must fund the escrow account with the full contract amount. 
                              This ensures secure payment to the talent upon milestone completion.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-900">
                            {contract.project?.type === 'HOURLY' ? 'Estimated Total Amount:' : 'Total Contract Amount:'}
                          </span>
                          <span className="text-xl font-bold text-gray-900">
                            {(() => {
                              const estimatedHrs = contract.estimatedHours || contract.application?.estimatedHours
                              return contract.project?.type === 'HOURLY' && contract.hourlyRate && estimatedHrs
                                ? formatCurrency(contract.hourlyRate * estimatedHrs)
                                : formatCurrency(contract.totalAmount)
                            })()}
                          </span>
                        </div>
                        {(() => {
                          const estimatedHrs = contract.estimatedHours || contract.application?.estimatedHours
                          return contract.project?.type === 'HOURLY' && contract.hourlyRate && estimatedHrs && (
                            <p className="text-sm text-gray-500 mb-2">
                              Based on {estimatedHrs} hours × {formatCurrency(contract.hourlyRate)}/hr
                            </p>
                          )
                        })()}
                        <p className="text-sm text-gray-600 mb-4">
                          This amount will be held in escrow and released to the talent as {contract.project?.type === 'HOURLY' ? 'time is tracked and approved' : 'milestones are completed and approved'}.
                        </p>
                        <Button 
                          onClick={handleFundEscrow}
                          disabled={isFundingEscrow}
                          className="w-full"
                          size="lg"
                        >
                          {isFundingEscrow ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                              Fund Escrow - {(() => {
                                const estimatedHrs = contract.estimatedHours || contract.application?.estimatedHours
                                return contract.project?.type === 'HOURLY' && contract.hourlyRate && estimatedHrs
                                  ? formatCurrency(contract.hourlyRate * estimatedHrs)
                                  : formatCurrency(contract.totalAmount)
                              })()}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Stripe Payment Form */}
                      {showPaymentForm && paymentIntent && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Payment</h3>
                          
                          {/* Payment Breakdown */}
                          {paymentBreakdown && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Project Amount:</span>
                                  <span className="font-medium">{formatCurrency(paymentBreakdown.escrowAmount)}</span>
                                </div>
                                {paymentBreakdown.platformFee && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Platform Fee:</span>
                                      <span className="font-medium">{formatCurrency(paymentBreakdown.platformFee.baseFee)}</span>
                                    </div>
                                    {paymentBreakdown.platformFee.taxAmount > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium">{formatCurrency(paymentBreakdown.platformFee.taxAmount)}</span>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                      {paymentBreakdown.platformFee.description}
                                    </div>
                                  </>
                                )}
                                <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between font-semibold text-base">
                                  <span className="text-gray-900">Total Amount:</span>
                                  <span className="text-blue-600">{formatCurrency(paymentBreakdown.totalAmount)}</span>
                                </div>
                              </div>
                              {paymentBreakdown.chargeDescription && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                  <p className="text-xs text-gray-600">{paymentBreakdown.chargeDescription}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <StripePaymentForm
                            paymentIntentId={paymentIntent.id}
                            clientSecret={paymentIntent.clientSecret}
                            amount={paymentIntent.amount}
                            currency={paymentIntent.currency}
                            contractId={contract.id}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                          <div className="mt-4 text-center">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPaymentForm(false)
                                setPaymentIntent(null)
                                setPaymentBreakdown(null)
                              }}
                            >
                              Cancel Payment
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : escrowStatus?.canStartProject ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-green-800">Escrow Funded Successfully</h4>
                          <p className="text-sm text-green-700 mt-1">
                            The escrow account has been funded with {formatCurrency(
                              escrowStatus.escrowAccount?.totalAmount 
                                ? Number(escrowStatus.escrowAccount.totalAmount) 
                                : Number(contract.totalAmount)
                            )}. 
                            The talent has been notified and can now start working on the project.
                          </p>
                          {escrowStatus.escrowAccount?.fundedAt && (
                            <p className="text-xs text-green-600 mt-2">
                              Funded: {formatRelativeTime(new Date(escrowStatus.escrowAccount.fundedAt))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-800">Escrow Processing</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Escrow funding is being processed. This may take a few minutes to complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{contract.project.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{contract.project.description}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/business/projects/${contract.project.id}`}>
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    View Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Talent Info */}
          <Card>
            <CardHeader>
              <CardTitle>Talent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {contract.talent.profile.avatar ? (
                    <img 
                      src={contract.talent.profile.avatar} 
                      alt={contract.talent.profile.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{contract.talent.profile.displayName}</h4>
                    {contract.talent.profile.title && (
                      <p className="text-sm text-gray-600">{contract.talent.profile.title}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/business/talent/${contract.talent.id}`}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={handleSendMessage}>
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={handleDownloadContract}>
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Download Contract
                </Button>
                {contract.status === 'active' && (
                  <Button variant="outline" size="sm" className="w-full" onClick={handleModifyContract}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modify Contract
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Biweekly Payment Modal */}
      <BiweeklyPaymentModal
        contractId={contractId}
        isOpen={showBiweeklyPayment}
        onClose={() => setShowBiweeklyPayment(false)}
        onSuccess={() => {
          setShowBiweeklyPayment(false)
          fetchContract() // Refresh contract data
        }}
      />

      {/* Location Update Modal */}
      <LocationUpdateModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationUpdated={handleLocationUpdated}
      />
    </div>
  )
}
