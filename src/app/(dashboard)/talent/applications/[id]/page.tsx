'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  PaperClipIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Pending Review',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

function ApplicationDetailsContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleMessageClient = () => {
    if (application?.project?.businessId) {
      // Navigate to messages with the business user ID
      router.push(`/talent/messages?userId=${application.project.businessId}`)
    } else {
      alert('Unable to start conversation - business information not available')
    }
  }

  const handleSignContract = () => {
    console.log('Contract data:', contract)
    const contractId = contract?.id || contract?.contractId
    if (contractId) {
      // Navigate to contract signing page
      router.push(`/talent/contracts/${contractId}/sign`)
    } else {
      console.log('Contract not available - contract data:', contract)
      alert('Contract not available for signing')
    }
  }

  const handleEditApplication = () => {
    // Navigate to edit page or show edit modal
    router.push(`/talent/opportunities/${application.projectId}/apply?edit=${application.id}`)
  }

  const handleWithdrawApplication = async () => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.post(`/applications/${application.id}/withdraw`)
      alert('Application withdrawn successfully')
      router.push('/talent/applications')
    } catch (error) {
      console.error('Error withdrawing application:', error)
      alert('Failed to withdraw application. Please try again.')
    }
  }

  useEffect(() => {
    const fetchApplication = async () => {
      if (!params.id || !user) return

      try {
        setIsLoading(true)
        setError(null)
        
        // First try to get the specific application
        const response = await apiClient.get(`/applications/${params.id}`)
        
        let applicationData = null
        if ((response as any)?.data) {
          applicationData = (response as any).data
        } else if (response) {
          applicationData = response
        }
        
        if (!applicationData) {
          throw new Error('Application not found')
        }
        
        setApplication(applicationData)
        console.log('Application data loaded:', applicationData)
        
        // Check if contract is already included in application data
        if (applicationData.contract) {
          console.log('Contract found in application data:', applicationData.contract)
          setContract(applicationData.contract)
        }
        
        // If application is accepted, try to fetch associated contract
        if (applicationData.status?.toLowerCase() === 'accepted') {
          try {
            console.log('Application accepted, fetching contract for application:', params.id)
            
            // Try multiple endpoints to find the contract
            let contractData = null
            
            // Method 1: Try application-specific contract endpoint
            try {
              const contractResponse = await apiClient.get(`/applications/${params.id}/contract`)
              contractData = contractResponse
              console.log('Contract found via application endpoint:', contractData)
            } catch (err) {
              console.log('Application contract endpoint failed, trying alternatives')
            }
            
            // Method 2: If no contract found, try getting all contracts and find by application ID
            if (!contractData) {
              try {
                const allContractsResponse = await apiClient.get('/contracts')
                const allContracts = Array.isArray(allContractsResponse) ? allContractsResponse : []
                contractData = allContracts.find((c: any) => c.applicationId === params.id)
                console.log('Contract found via contracts list:', contractData)
              } catch (err) {
                console.log('Contracts list endpoint failed')
              }
            }
            
            if (contractData) {
              setContract(contractData)
            } else {
              console.log('No contract found for this application yet')
            }
          } catch (contractErr) {
            console.error('Error fetching contract:', contractErr)
          }
        }
      } catch (err) {
        console.error('Error fetching application:', err)
        
        // If specific endpoint doesn't exist, try to get from user's applications
        try {
          const allApplicationsResponse = await apiClient.get('/applications/my')
          let allApplications = []
          
          if (Array.isArray((allApplicationsResponse as any)?.data)) {
            allApplications = (allApplicationsResponse as any).data
          } else if (Array.isArray(allApplicationsResponse)) {
            allApplications = allApplicationsResponse
          }
          
          const foundApplication = allApplications.find((app: any) => app.id === params.id)
          
          if (foundApplication) {
            setApplication(foundApplication)
          } else {
            setError('Application not found')
          }
        } catch (fallbackErr) {
          console.error('Fallback error:', fallbackErr)
          setError('Failed to load application details')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplication()
  }, [params.id, user])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Application not found'}</p>
        <Link href="/talent/applications">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/talent/applications">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">View your application details and status</p>
          </div>
        </div>
        <Badge className={statusColors[application.status?.toLowerCase() as keyof typeof statusColors]}>
          {statusLabels[application.status?.toLowerCase() as keyof typeof statusLabels] || application.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {application.project?.title || 'Project Title'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {application.project?.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                  <span>
                    {application.project?.type === 'HOURLY' 
                      ? application.project?.hourlyRate 
                        ? `${formatCurrency(application.project.hourlyRate)}/hr`
                        : application.project.budgetMin && application.project.budgetMax
                          ? `${formatCurrency(application.project.budgetMin)}-${formatCurrency(application.project.budgetMax)}/hr`
                          : `${formatCurrency(application.project?.budgetMin || application.project?.budgetMax || 0)}/hr`
                      : `${formatCurrency(application.project?.budgetMin || 0)} - ${formatCurrency(application.project?.budgetMax || 0)}`
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  <span>{application.project?.location || 'Remote'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span>Applied {formatRelativeTime(application.createdAt)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Company:</span> {application.project?.company || 'Unknown Company'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Your Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Letter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                  <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {application.coverLetter || 'No cover letter provided'}
                  </p>
                </div>
              </div>

              {/* Proposed Approach */}
              {application.proposedApproach && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Proposed Approach</h4>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                    <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {application.proposedApproach}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {application.timeline && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Proposed Timeline</h4>
                  <p className="text-gray-700">{application.timeline}</p>
                </div>
              )}

              {/* Questions */}
              {application.questions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Questions for Client</h4>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                    <p className="text-gray-700 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {application.questions}
                    </p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {application.attachments && application.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {application.attachments.map((attachment: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <PaperClipIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {attachment.split('/').pop() || `Attachment ${index + 1}`}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`http://localhost:5000${attachment}`} target="_blank" rel="noopener noreferrer">
                            <EyeIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Application Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <Badge className={statusColors[application.status?.toLowerCase() as keyof typeof statusColors]}>
                    {statusLabels[application.status?.toLowerCase() as keyof typeof statusLabels] || application.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applied:</span>
                  <span className="font-medium">{formatRelativeTime(application.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {application.rateType === 'hourly' ? 'Proposed Rate:' : 'Proposed Budget:'}
                  </span>
                  <span className="font-medium">
                    {application.rateType === 'hourly' 
                      ? `$${application.proposedRate || 0}/hr`
                      : `$${application.proposedBudget || 0}`
                    }
                  </span>
                </div>
                {application.viewedByClient && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Client Status:</span>
                    <span className="text-green-600 text-sm">✓ Viewed by client</span>
                  </div>
                )}
                {application.status?.toLowerCase() === 'accepted' && contract && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract:</span>
                    <span className={`text-sm ${
                      contract.contractStatus === 'SIGNED' || contract.contractStatus === 'ACTIVE' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {contract.contractStatus === 'SIGNED' || contract.contractStatus === 'ACTIVE' 
                        ? '✓ Signed' 
                        : '⏳ Pending signature'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" onClick={handleMessageClient}>
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Message Client
              </Button>
              
              {/* Edit Application Button - Disabled when accepted */}
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleEditApplication}
                disabled={application.status?.toLowerCase() === 'accepted'}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Application
              </Button>
              
              {/* Sign Contract Button - Show when accepted and contract needs signing */}
              {application.status?.toLowerCase() === 'accepted' && (
                contract && (contract.id || contract.contractId) ? (
                  (contract.hasContract && contract.contractStatus === 'PENDING_SIGNATURES') ? (
                    <Button className="w-full" onClick={handleSignContract}>
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Sign Contract
                    </Button>
                  ) : contract.contractStatus === 'SIGNED' || contract.contractStatus === 'ACTIVE' ? (
                    <Button className="w-full" variant="outline" disabled>
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Contract Signed
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Contract Processing
                    </Button>
                  )
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Contract Pending
                  </Button>
                )
              )}
              
              {/* Withdraw Application - Only for pending applications */}
              {application.status?.toLowerCase() === 'pending' && (
                <Button className="w-full" variant="outline" onClick={handleWithdrawApplication}>
                  Withdraw Application
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Application Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              {application.status?.toLowerCase() === 'pending' && (
                <p>Your application is under review. You'll be notified of any updates.</p>
              )}
              {application.status?.toLowerCase() === 'shortlisted' && (
                <p>Congratulations! You've been shortlisted. Expect to hear from the client soon.</p>
              )}
              {application.status?.toLowerCase() === 'accepted' && (
                <div className="space-y-2">
                  <p>Congratulations! Your application has been accepted.</p>
                  {contract && contract.hasContract && contract.contractStatus === 'PENDING_SIGNATURES' ? (
                    <p className="text-blue-600 font-medium">Next step: Sign your contract to begin the project.</p>
                  ) : contract && (contract.contractStatus === 'SIGNED' || contract.contractStatus === 'ACTIVE') ? (
                    <p className="text-green-600 font-medium">Contract signed! You can now start working on the project.</p>
                  ) : (
                    <p>The client is preparing your contract. You'll be notified when it's ready to sign.</p>
                  )}
                </div>
              )}
              {application.status?.toLowerCase() === 'rejected' && (
                <p>Unfortunately, your application wasn't selected this time. Keep applying to other projects!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationDetailsPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <ApplicationDetailsContent />
    </AuthGuard>
  )
}
