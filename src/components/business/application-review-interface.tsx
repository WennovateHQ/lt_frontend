'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Application, ApplicationStatus, getStatusConfig } from '@/lib/types/application'
import { TalentProfile } from '@/lib/types/user'
import { useUpdateApplicationStatus } from '@/lib/hooks/use-applications'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'
import { ContractActions } from './contract-actions'

interface ApplicationReviewInterfaceProps {
  application: Application
  talentProfile: TalentProfile
  onStatusUpdate?: (newStatus: ApplicationStatus, notes?: string) => void
  onScheduleInterview?: (date: Date) => void
  onSendMessage?: () => void
  onRefresh?: () => void
}

export function ApplicationReviewInterface({
  application,
  talentProfile,
  onStatusUpdate,
  onScheduleInterview,
  onSendMessage,
  onRefresh
}: ApplicationReviewInterfaceProps) {
  const [selectedAction, setSelectedAction] = useState<ApplicationStatus | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFullCoverLetter, setShowFullCoverLetter] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [contractStatus, setContractStatus] = useState<{
    hasContract: boolean
    contractId?: string
    canMessage: boolean
    needsContract: boolean
    isFullySigned?: boolean
  } | null>(null)
  const [isLoadingContract, setIsLoadingContract] = useState(false)

  const router = useRouter()
  const updateStatusMutation = useUpdateApplicationStatus()
  const statusConfig = getStatusConfig(application.status)

  // Fetch contract status when application is accepted
  useEffect(() => {
    if (application.status.toLowerCase() === 'accepted') {
      fetchContractStatus()
    }
  }, [application.status, application.id])

  const fetchContractStatus = async () => {
    try {
      setIsLoadingContract(true)
      const { apiClient } = await import('@/lib/api/client')
      const response = await apiClient.get(`/applications/${application.id}/contract`)
      setContractStatus(response as any)
    } catch (error) {
      console.error('Failed to fetch contract status:', error)
      setContractStatus({
        hasContract: false,
        canMessage: false,
        needsContract: true
      })
    } finally {
      setIsLoadingContract(false)
    }
  }

  const handleAction = async (action: ApplicationStatus) => {
    setSelectedAction(action)
    
    if (action === 'accepted' || action === 'rejected') {
      // Show confirmation form
      return
    }
    
    // For simple status updates (shortlisted, under_review)
    await processAction(action)
  }

  const processAction = async (action: ApplicationStatus, notes?: string, metadata?: any) => {
    try {
      setIsProcessing(true)
      
      await updateStatusMutation.mutateAsync({
        applicationId: application.id,
        newStatus: action,
        notes,
        metadata
      })
      
      onStatusUpdate?.(action, notes)
      setSelectedAction(null)
      setActionNotes('')
      
      // Auto-refresh the page after successful action
      setTimeout(() => {
        onRefresh?.() || window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Failed to update application status:', error)
    } finally {
      setIsProcessing(false)
    }
  }


  const handleSaveCandidate = () => {
    setIsSaved(!isSaved)
    // In real implementation, this would save to a favorites list
  }

  const getMessagingButton = () => {
    // Check if application has been accepted
    if (application.status.toLowerCase() !== 'accepted') {
      return null; // No messaging until application is accepted
    }

    // Show loading state while checking contract status
    if (isLoadingContract) {
      return (
        <Button disabled className="w-full" variant="outline">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          Checking Contract...
        </Button>
      );
    }

    // If no contract status loaded yet, don't show anything
    if (!contractStatus) {
      return null;
    }

    // If contract doesn't exist, show create contract button
    if (contractStatus.needsContract) {
      return (
        <Button
          onClick={() => {
            // Navigate to contract creation
            router.push(`/business/projects/${application.projectId}/contracts/create?applicationId=${application.id}`);
          }}
          className="w-full"
          variant="outline"
        >
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      );
    }

    // If contract exists but not fully signed, show status
    if (contractStatus.hasContract && !contractStatus.canMessage) {
      return (
        <Button disabled className="w-full" variant="outline">
          <DocumentTextIcon className="h-4 w-4 mr-2" />
          Waiting for Signatures
        </Button>
      );
    }

    // If contract is fully signed, show message button
    if (contractStatus.canMessage && contractStatus.contractId) {
      return (
        <Button
          onClick={async () => {
            if (onSendMessage) {
              onSendMessage();
            } else {
              // Navigate to messages with contract ID
              try {
                router.push(`/business/messages?conversationId=${contractStatus.contractId}`);
              } catch (error) {
                console.error('Failed to open conversation:', error);
                alert('Failed to open conversation. Please try again.');
              }
            }
          }}
          className="w-full"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      );
    }

    return null;
  };

  const getActionButtons = () => {
    const currentStatus = application.status
    
    // Handle backend status format (uppercase) vs frontend format (lowercase)
    const normalizedStatus = typeof currentStatus === 'string' ? currentStatus.toLowerCase() : currentStatus
    
    switch (normalizedStatus) {
      case 'pending':
      case 'submitted':
      case 'under_review':
        return (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('shortlisted')}
              disabled={isProcessing}
              className="w-full"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('accepted')}
              disabled={isProcessing}
              className="w-full text-green-600 hover:text-green-700"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Accept Candidate
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('rejected')}
              disabled={isProcessing}
              className="w-full text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )
      
      case 'shortlisted':
        return (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleAction('accepted')}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Accept Candidate
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('rejected')}
              disabled={isProcessing}
              className="w-full text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )
      
      
      case 'accepted':
        return <ContractActions applicationId={application.id} projectId={application.projectId} />
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="relative">
            {talentProfile.avatar ? (
              <img
                src={talentProfile.avatar}
                alt={talentProfile.displayName || 'Talent'}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <Badge className={statusConfig.bgColor + ' ' + statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {talentProfile.displayName ||
                 `${talentProfile.firstName || ''} ${talentProfile.lastName || ''}`.trim() ||
                 talentProfile.email || 'Talent'}
              </h2>
              <button
                onClick={handleSaveCandidate}
                className="text-gray-400 hover:text-red-500"
              >
                {isSaved ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => {
                  // Navigate to talent profile within the app
                  const currentUrl = window.location.pathname;
                  window.location.href = `/business/talent/${talentProfile.id}?returnTo=${encodeURIComponent(currentUrl)}`;
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View Full Profile
              </button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              {talentProfile.rating && (
                <>
                  <div className="flex items-center space-x-1">
                    <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                    <span>{talentProfile.rating.toFixed(1)}</span>
                    <span>({talentProfile.completedProjects || 0} projects)</span>
                  </div>
                  <span>•</span>
                </>
              )}
              <span>{talentProfile.location?.city || 'Location not specified'}</span>
              {talentProfile.responseTime && (
                <>
                  <span>•</span>
                  <span>Responds in {talentProfile.responseTime}</span>
                </>
              )}
            </div>
            
            {talentProfile.successRate && (
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm text-gray-500">Success Rate:</span>
                <span className="text-sm font-medium text-green-600">
                  {talentProfile.successRate}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Applied {formatRelativeTime((application.createdAt || application.appliedAt)!)}</p>
          {application.viewedByClient && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
              <EyeIcon className="h-3 w-3" />
              <span>Viewed</span>
            </div>
          )}
        </div>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>Proposal Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">
                    {application.rateType === 'hourly' ? 'Proposed Rate:' : 'Proposed Budget:'}
                  </span>
                  <p className="font-medium text-lg">
                    {application.rateType === 'hourly' 
                      ? `${formatCurrency(application.proposedRate || 0)}/hr`
                      : formatCurrency(application.proposedBudget || 0)
                    }
                  </p>
                </div>
                {application.estimatedHours && application.rateType === 'hourly' && (
                  <div>
                    <span className="text-gray-500">Estimated Hours:</span>
                    <p className="font-medium">{application.estimatedHours}h</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Timeline:</span>
                  <p className="font-medium">
                    {application.timeline || (application as any).project?.duration || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium">
                    {application.startDate 
                      ? formatDate(application.startDate) 
                      : (application as any).project?.startDate 
                        ? formatDate((application as any).project.startDate)
                        : 'Not specified'}
                  </p>
                </div>
              </div>
              
              {application.rateType === 'hourly' && application.estimatedHours && application.proposedRate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Project Value:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(application.proposedRate * application.estimatedHours)}
                    </span>
                  </div>
                </div>
              )}
              
              {application.rateType === 'fixed' && application.proposedBudget && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Project Budget:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(application.proposedBudget)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Cover Letter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className={`text-gray-700 ${!showFullCoverLetter ? 'line-clamp-4' : ''}`}>
                  {application.coverLetter}
                </p>
                {application.coverLetter.length > 200 && (
                  <button
                    onClick={() => setShowFullCoverLetter(!showFullCoverLetter)}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    {showFullCoverLetter ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Proposed Approach */}
          {application.proposedApproach && (
            <Card>
              <CardHeader>
                <CardTitle>Proposed Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                    {application.proposedApproach}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          {application.questions && (
            <Card>
              <CardHeader>
                <CardTitle>Questions from Candidate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-l-4 border-blue-200 pl-4">
                  <p className="text-gray-700 font-medium">Additional Questions/Comments:</p>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{application.questions}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {application.attachments && application.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.attachments.map((attachment, index) => {
                    // Handle both string paths and attachment objects
                    const fileName = typeof attachment === 'string' 
                      ? (attachment as string).split('/').pop() || `attachment-${index + 1}`
                      : (attachment as any).fileName || `attachment-${index + 1}`
                    const filePath = typeof attachment === 'string' ? attachment : (attachment as any).url
                    
                    return (
                      <div key={(attachment as any).id || fileName || index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{fileName}</span>
                          {typeof attachment === 'object' && (attachment as any).fileSize && (
                            <span className="text-xs text-gray-500">
                              ({((attachment as any).fileSize / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          // Construct full backend URL for file download
                          // Remove /api suffix from API URL to get base backend URL
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                          const backendUrl = apiUrl.replace('/api', '');
                          const fullUrl = filePath.startsWith('http') ? filePath : `${backendUrl}${filePath}`;
                          console.log('📥 Download URL:', fullUrl);
                          window.open(fullUrl, '_blank');
                        }}>
                          Download
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getActionButtons()}
              
              {getMessagingButton()}
            </CardContent>
          </Card>

          {/* Talent Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Handle different possible skill data structures
                  const skills = talentProfile.skills || [];
                  
                  if (skills.length === 0) {
                    return <p className="text-gray-500 text-sm">No skills listed</p>;
                  }
                  
                  return skills.map((skill: any, index: number) => {
                    // Handle skill object with nested skill.name
                    const skillName = skill.skill?.name || skill.name || skill.skillName || `Skill ${index + 1}`;
                    const skillLevel = skill.level ? ` (Level ${skill.level})` : '';
                    
                    return (
                      <Badge key={skill.id || skill.skillId || index} variant="secondary">
                        {skillName}{skillLevel}
                      </Badge>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Rate Information */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {talentProfile.hourlyRate && (
                <div>
                  <span className="text-sm text-gray-500">Hourly Rate:</span>
                  <p className="font-medium">
                    {formatCurrency(talentProfile.hourlyRate)}/hr
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">This Proposal:</span>
                <p className="font-medium text-lg">
                  {application.rateType === 'hourly' 
                    ? `${formatCurrency(application.proposedRate || 0)}/hr`
                    : formatCurrency(application.proposedBudget || 0)
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Modals */}
      {(selectedAction === 'accepted' || selectedAction === 'rejected') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {selectedAction === 'accepted' ? 'Accept Candidate' : 'Decline Application'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="action-notes">
                  {selectedAction === 'accepted' ? 'Welcome Message' : 'Feedback (Optional)'}
                </Label>
                <Textarea
                  id="action-notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    selectedAction === 'accepted'
                      ? "Welcome to the team! Here's what happens next..."
                      : "Thank you for your interest. We've decided to move forward with another candidate..."
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => processAction(selectedAction, actionNotes)}
                  disabled={isProcessing}
                  className={selectedAction === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {selectedAction === 'accepted' ? 'Accept Candidate' : 'Decline Application'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedAction(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
