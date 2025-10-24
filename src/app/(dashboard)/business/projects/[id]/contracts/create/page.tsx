'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { ContractCreationWizard } from '@/components/contracts/contract-creation-wizard'
import { contractTemplates } from '@/lib/data/contract-templates'

interface Application {
  id: string
  projectId: string
  talentId: string
  coverLetter: string
  proposedRate: number | null
  proposedBudget: number | null
  timeline: string
  availability: string | null
  proposedApproach: string
  estimatedHours: number | null
  rateType: 'hourly' | 'fixed'
  status: string
  talent: {
    id: string
    email: string
    profile: {
      firstName: string
      lastName: string
      displayName: string
      avatar?: string
    }
  }
  project: {
    id: string
    title: string
    description: string
    budgetMin: number
    budgetMax: number
    type?: string
  }
}

export default function CreateContractPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const projectId = params.id as string // Using 'id' to match existing structure
  const applicationId = searchParams.get('applicationId')
  
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof contractTemplates[0] | null>(null)

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import('@/lib/api/client')
      const response = await apiClient.get(`/applications/${applicationId}`)
      console.log('📦 Application data received:', response)
      setApplication(response as Application)
    } catch (error) {
      console.error('Failed to fetch application:', error)
      setError('Failed to load application details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template: typeof contractTemplates[0]) => {
    setSelectedTemplate(template)
    setShowWizard(true)
  }

  const handleContractComplete = async (contractData: any) => {
    try {
      const { apiClient } = await import('@/lib/api/client')
      
      // Ensure required fields are present
      const contractPayload = {
        projectId: application?.projectId,
        talentId: application?.talentId,
        applicationId: application?.id,
        title: contractData.projectTitle || `Contract for ${application?.project.title}`,
        description: contractData.projectDescription || application?.project.description || 'Contract description',
        terms: contractData.additionalTerms || '',
        totalAmount: contractData.totalAmount || 0,
        hourlyRate: contractData.hourlyRate || null,
        estimatedHours: contractData.estimatedHours || null, // ✅ Include estimated hours
        startDate: contractData.startDate || null,
        endDate: contractData.completionDate || null,
        templateId: selectedTemplate?.id,
        // Enhanced contract fields
        scopeOfWork: contractData.scopeOfWork || '',
        deliverables: contractData.deliverables || '',
        milestones: contractData.milestones || [],
        contractType: selectedTemplate?.type || 'fixed',
        paymentSchedule: contractData.paymentSchedule || '',
        duration: contractData.duration || '',
        cancellationPolicy: contractData.cancellationPolicy || '',
        intellectualPropertyRights: contractData.intellectualPropertyRights || ''
      }
      
      console.log('Sending contract payload:', contractPayload)
      
      const contract = await apiClient.post('/contracts', contractPayload)
      
      // Redirect back to application with success message
      router.push(`/business/projects/${projectId}/applications/${applicationId}?contractCreated=true`)
    } catch (error) {
      console.error('Failed to create contract:', error)
      alert('Failed to create contract. Please try again.')
    }
  }

  const getInitialData = () => {
    if (!application) return {}
    
    return {
      talentName: application.talent.profile.displayName,
      projectTitle: application.project.title,
      projectDescription: application.project.description,
      hourlyRate: application.proposedRate || undefined,
      totalAmount: selectedTemplate?.type === 'fixed' 
        ? (application.proposedBudget || application.project.budgetMax) 
        : undefined,
      estimatedHours: selectedTemplate?.type === 'hourly' 
        ? (application.estimatedHours || 40) 
        : undefined,
      duration: application.timeline
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Application not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  if (showWizard && selectedTemplate) {
    return (
      <ContractCreationWizard
        template={selectedTemplate}
        onComplete={handleContractComplete}
        onBack={() => setShowWizard(false)}
        initialData={getInitialData()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Application
          </Button>
        </div>
      </div>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Creating Contract</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Project</h4>
              <p className="text-sm text-gray-600">{application.project.title}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Talent</h4>
              <p className="text-sm text-gray-600">{application.talent.profile.displayName}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {application.rateType === 'fixed' ? 'Proposed Budget' : 'Proposed Rate'}
              </h4>
              <p className="text-sm text-gray-600">
                {application.rateType === 'fixed' 
                  ? `$${application.proposedBudget?.toLocaleString() || 0}` 
                  : `$${application.proposedRate || 0}/hour`}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
              <p className="text-sm text-gray-600">{application.timeline || 'Not specified'}</p>
            </div>
            {application.estimatedHours && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Estimated Hours</h4>
                <p className="text-sm text-gray-600">{application.estimatedHours} hours</p>
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <Badge className="bg-green-100 text-green-800">{application.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Choose Contract Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contractTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                template.id === 'bc-fixed-web-dev' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.id === 'bc-fixed-web-dev' && (
                    <Badge variant="default">Recommended</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {template.type === 'fixed' ? 'Fixed total amount' : 'Hourly rate'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {template.type === 'fixed' ? 'Milestone payments' : 'Time tracking'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    {template.type === 'fixed' ? 'Clear deliverables' : 'Flexible scope'}
                  </div>
                  {template.defaultMilestones && (
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Milestone management
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
