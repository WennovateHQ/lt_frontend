'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthGuard } from '@/components/auth/auth-guard'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { DeliverableManagement } from '@/components/milestones/deliverable-management'
import { TimesheetView } from '@/components/time-tracking/timesheet-view'

export default function TalentContractDetailPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <TalentContractDetailContent />
    </AuthGuard>
  )
}

function TalentContractDetailContent() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string
  
  const [contract, setContract] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [escrowStatus, setEscrowStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContractData = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('Fetching contract data for:', contractId)
      
      // Fetch contract details
      const contractData = await apiClient.get(`/contracts/${contractId}`)
      console.log('Contract data loaded:', contractData)
      setContract(contractData)
      
      // Fetch milestones only for fixed-price contracts (hourly contracts don't have milestones)
      if ((contractData as any).hourlyRate) {
        console.log('⏰ Hourly contract - skipping milestones fetch')
        setMilestones([])
      } else {
        try {
          const milestonesData: any = await apiClient.get(`/contracts/${contractId}/milestones`)
          console.log('Milestones data loaded:', milestonesData)
          setMilestones(milestonesData.milestones || [])
        } catch (milestonesError) {
          console.error('Failed to fetch milestones:', milestonesError)
          setMilestones([])
        }
      }
      
      // Fetch escrow status for all contracts (escrow can be funded before contract becomes ACTIVE)
      try {
        const escrowData = await apiClient.get(`/contracts/${contractId}/escrow/status`)
        console.log('Escrow status loaded:', escrowData)
        setEscrowStatus(escrowData)
      } catch (escrowError) {
        console.error('Failed to fetch escrow status:', escrowError)
        // Escrow might not exist yet, which is fine
      }
    } catch (error) {
      console.error('Failed to fetch contract data:', error)
      setError('Failed to load contract details')
    } finally {
      setIsLoading(false)
    }
  }, [contractId])

  useEffect(() => {
    if (contractId) {
      fetchContractData()
    }
  }, [contractId, fetchContractData])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending_signatures': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
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

  const handleStartProject = async () => {
    try {
      // Update contract status to IN_PROGRESS
      await apiClient.put(`/contracts/${contractId}/status`, {
        status: 'IN_PROGRESS'
      })
      
      // Refresh contract data to show updated status
      const contractData = await apiClient.get(`/contracts/${contractId}`)
      setContract(contractData)
      
      alert('Project started! You can now begin working on the milestones.')
    } catch (error) {
      console.error('Failed to start project:', error)
      alert('Failed to start project. Please try again.')
    }
  }

  const handleSendMessage = () => {
    router.push(`/talent/messages?businessId=${contract?.business?.id}`)
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
          <div className="space-x-2">
            <Button onClick={() => router.back()}>Go Back</Button>
            <Button variant="outline" onClick={() => router.push('/talent/contracts')}>
              View All Contracts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const canStartProject = escrowStatus?.canStartProject && contract.status === 'ACTIVE'
  const needsEscrowFunding = escrowStatus?.needsFunding && contract.status === 'ACTIVE'

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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Status & Start Button */}
          {contract.status === 'ACTIVE' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Project Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {needsEscrowFunding ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Waiting for Escrow Funding</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            The business needs to fund the escrow account before you can start working on this project. 
                            You'll be notified once the funding is complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : canStartProject ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <h4 className="font-medium text-green-800">Ready to Start!</h4>
                            <p className="text-sm text-green-700 mt-1">
                              The escrow has been funded with {formatCurrency(
                                escrowStatus.escrowAccount?.totalAmount 
                                  ? Number(escrowStatus.escrowAccount.totalAmount) 
                                  : Number(contract.totalAmount)
                              )}. 
                              You can now start working on the project milestones.
                            </p>
                          </div>
                        </div>
                        <Button onClick={handleStartProject} className="ml-4">
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Start Project
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-800">Project Setup in Progress</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            The project setup is being finalized. You'll be able to start once everything is ready.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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

              {/* Additional Terms Section */}
              {(contract.cancellationPolicy || contract.intellectualPropertyRights) && (
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
                        <strong>Name:</strong> {contract.businessName || 
                          contract.business?.profile?.companyName || 
                          contract.project?.business?.profile?.companyName || 
                          'Business Name'}
                      </p>
                      {contract.businessAddress && (
                        <p className="text-sm text-gray-600"><strong>Address:</strong> {contract.businessAddress}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Talent (Contractor)</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {contract.talentName || `${contract.talent?.profile?.firstName || 'First'} ${contract.talent?.profile?.lastName || 'Last'}`}
                      </p>
                      {contract.talentAddress && (
                        <p className="text-sm text-gray-600"><strong>Address:</strong> {contract.talentAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
                        {(contract.estimatedHours || contract.application?.estimatedHours) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Hours:</span>
                            <span className="font-medium">{contract.estimatedHours || contract.application?.estimatedHours} hours</span>
                          </div>
                        )}
                        {contract.hourlyRate && (contract.estimatedHours || contract.application?.estimatedHours) && (
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-600">Estimated Total:</span>
                            <span className="font-medium">
                              {formatCurrency(contract.hourlyRate * (contract.estimatedHours || contract.application?.estimatedHours))}
                            </span>
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
                    {contract.completionDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Date:</span>
                        <span className="font-medium">{formatDate(new Date(contract.completionDate))}</span>
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
          {milestones && milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone: any, index: number) => (
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
                      
                      {milestone.deliverables && typeof milestone.deliverables === 'string' && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Deliverables:</h5>
                          <p className="text-sm text-gray-600">{milestone.deliverables}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {milestone.dueDate && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Due: {formatDate(new Date(milestone.dueDate))}</span>
                          </div>
                        )}
                        {milestone.percentage && (
                          <span>{milestone.percentage}% of total</span>
                        )}
                      </div>
                      
                      {/* Deliverable Management for each milestone */}
                      {(contract.status === 'ACTIVE' || contract.status === 'IN_PROGRESS') && (
                        <div className="mt-4 pt-4 border-t">
                          <DeliverableManagement
                            milestoneId={milestone.id}
                            userRole="talent"
                            canEdit={true}
                            onUpdate={() => {
                              // Refresh contract data when deliverables are updated
                              fetchContractData()
                            }}
                          />
                          
                          {/* Submit Milestone Button */}
                          {(() => {
                            const deliverables = (milestone as any).deliverables || []
                            const allDeliverablesSubmitted = deliverables.length > 0 && deliverables.every((d: any) => d.status === 'SUBMITTED' || d.status === 'APPROVED')
                            const hasDeliverables = deliverables.length > 0
                            const canSubmit = milestone.status === 'PENDING' && (!hasDeliverables || allDeliverablesSubmitted)
                            
                            return canSubmit ? (
                              <div className="mt-4 flex justify-end">
                                <Button
                                  onClick={async () => {
                                    try {
                                      const confirmed = confirm(
                                        `Submit milestone "${milestone.title}" for review?\n\n` +
                                        `This will notify the business that your deliverables are ready for approval.`
                                      )
                                      
                                      if (!confirmed) return
                                      
                                      await apiClient.put(`/milestones/${milestone.id}/submit`, {})
                                      alert('✅ Milestone submitted successfully! The business will review your deliverables.')
                                      await fetchContractData()
                                    } catch (error: any) {
                                      console.error('Error submitting milestone:', error)
                                      const errorMessage = error.response?.data?.error || 'Failed to submit milestone'
                                      alert(`❌ ${errorMessage}`)
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Submit Milestone for Review
                                </Button>
                              </div>
                            ) : milestone.status === 'SUBMITTED' ? (
                              <div className="mt-4 flex justify-end">
                                <div className="flex items-center gap-2 text-blue-600">
                                  <ClockIcon className="h-5 w-5" />
                                  <span className="font-medium">Awaiting Business Review</span>
                                </div>
                              </div>
                            ) : milestone.status === 'APPROVED' ? (
                              <div className="mt-4 flex justify-end">
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircleIcon className="h-5 w-5" />
                                  <span className="font-medium">Approved by Business</span>
                                </div>
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
                <CardTitle>Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <TimesheetView
                  contractId={contractId}
                  userRole="talent"
                  canEdit={true}
                />
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
                  <h4 className="font-medium text-gray-900">{contract.project?.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{contract.project?.description}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/talent/projects/${contract.project?.id}`}>
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    View Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {contract.business?.profile?.avatar ? (
                    <img 
                      src={contract.business.profile.avatar} 
                      alt={contract.business.profile.companyName || 'Client'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {contract.business?.profile?.companyName || 'Client'}
                    </h4>
                    {contract.business?.profile?.industry && (
                      <p className="text-sm text-gray-600">{contract.business.profile.industry}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/talent/clients/${contract.business?.id}`}>
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
                {canStartProject && (
                  <Button size="sm" className="w-full" onClick={handleStartProject}>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Project
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
