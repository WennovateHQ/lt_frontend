'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  HeartIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  StarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

const workArrangementColors = {
  remote: 'bg-green-100 text-green-800',
  hybrid: 'bg-blue-100 text-blue-800',
  onsite: 'bg-purple-100 text-purple-800',
}

function OpportunityDetailContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)

  const checkIfApplied = async (projectId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.error('Failed to fetch applications:', response.status)
        return
      }
      
      const applications = await response.json()
      console.log('🔍 User applications:', applications)
      
      // Check if user has already applied to this project
      const existingApp = applications.find((app: any) => app.projectId === projectId)
      
      if (existingApp) {
        console.log('✅ User has already applied to this project:', existingApp)
        setHasApplied(true)
        setExistingApplication(existingApp)
      } else {
        console.log('ℹ️ User has not applied to this project yet')
        setHasApplied(false)
        setExistingApplication(null)
      }
    } catch (error) {
      console.error('❌ Error checking application status:', error)
    }
  }

  const fetchOpportunity = async (id: string) => {
    console.log('🔍 Fetching opportunity details for ID:', id)
    
    // Debug token storage
    console.log('🔍 Token storage check:', {
      token: !!localStorage.getItem('token'),
      sessionToken: !!sessionStorage.getItem('token'),
      prefixedToken: !!localStorage.getItem('localtalents_token'),
      accessToken: !!localStorage.getItem('accessToken'),
      prefixedAccessToken: !!localStorage.getItem('localtalents_accessToken'),
      refreshToken: !!localStorage.getItem('refreshToken'),
      tokenPreview: localStorage.getItem('token')?.substring(0, 30) + '...'
    })
    
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch opportunity: ${response.status}`)
      }
      
      const response_data = await response.json()
      console.log('✅ API Response received:', response_data)
      
      // Extract project from API response wrapper
      const data = response_data.project || response_data
      console.log('✅ Opportunity data loaded:', data)
      console.log('🔍 Data structure check:', {
        hasTitle: !!data.title,
        hasDescription: !!data.description,
        hasBusiness: !!data.business,
        hasSkills: !!data.skills,
        skillsType: typeof data.skills,
        skillsLength: data.skills?.length,
        hasBudget: !!(data.budgetMin && data.budgetMax)
      })
      
      return data
    } catch (error) {
      console.error('❌ Error fetching opportunity:', error)
      throw error
    }
  }

  useEffect(() => {
    const loadOpportunity = async () => {
      if (!params.id) return
      
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchOpportunity(params.id as string)
        setOpportunity(data)
        
        // Check if user has already applied to this project
        await checkIfApplied(params.id as string)
      } catch (error) {
        console.error('❌ Error loading opportunity:', error)
        setError('Failed to load opportunity details')
      } finally {
        setIsLoading(false)
      }
    }

    loadOpportunity()
  }, [params.id])

  const toggleSaved = () => {
    setIsSaved(!isSaved)
  }
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

  if (error || !opportunity) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Opportunity not found'}</p>
        <Link href="/talent/opportunities">
          <Button>Back to Opportunities</Button>
        </Link>
      </div>
    )
  }

  // Use real opportunity data with safe fallbacks
  const displayData = {
    title: opportunity?.title || opportunity?.name || 'Project Title',
    company: opportunity?.business?.profile?.companyName || opportunity?.business?.profile?.displayName || 'Company Name',
    description: opportunity?.description || 'No description available',
    budget: opportunity?.budgetMin && opportunity?.budgetMax ? 
      { min: opportunity.budgetMin, max: opportunity.budgetMax } : 
      { min: 50, max: 150 },
    location: opportunity?.city || opportunity?.location || (opportunity?.isRemote ? 'Remote' : 'On-site'),
    province: opportunity?.province,
    workArrangement: opportunity?.isRemote ? 'remote' : (opportunity?.workType || opportunity?.workArrangement || 'onsite'),
    timeline: opportunity?.timeline || opportunity?.duration || 'Flexible',
    skills: opportunity?.skills || [],
    applicationsCount: opportunity?._count?.applications || opportunity?.applicationsCount || 0,
    contractsCount: opportunity?._count?.contracts || 0,
    postedAt: opportunity?.createdAt || new Date().toISOString(),
    publishedAt: opportunity?.publishedAt,
    updatedAt: opportunity?.updatedAt,
    status: opportunity?.status || 'PUBLISHED',
    type: opportunity?.type,
    hourlyRate: opportunity?.hourlyRate,
    experienceLevel: opportunity?.experienceLevel,
    startDate: opportunity?.startDate,
    endDate: opportunity?.endDate,
    isRemote: opportunity?.isRemote,
    businessId: opportunity?.businessId,
    projectId: opportunity?.id
  }
  
  console.log('📊 Display data processed:', displayData)
  console.log('🔍 Skills processing:', {
    originalSkills: opportunity?.skills,
    processedSkills: displayData.skills,
    skillsCount: displayData.skills?.length || 0
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/talent/opportunities">
          <Button variant="ghost" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSaved}
          >
            {isSaved ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{displayData.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>{displayData.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>
                        {displayData.location}
                        {displayData.province && displayData.location !== 'Remote' && (
                          <span>, {displayData.province}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Posted {formatRelativeTime(displayData.postedAt)}</span>
                    </div>
                    {displayData.publishedAt && displayData.publishedAt !== displayData.postedAt && (
                      <div className="flex items-center gap-1">
                        <CheckBadgeIcon className="h-4 w-4" />
                        <span>Published {formatRelativeTime(displayData.publishedAt)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Application Review Status and Type */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge 
                      className={
                        displayData.applicationsCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {displayData.applicationsCount > 0 ? 'Reviewing Applications' : 'Not Yet Reviewed'}
                    </Badge>
                    {displayData.type && (
                      <Badge variant="outline">
                        {displayData.type === 'FIXED_PRICE' ? 'Fixed Price' : 'Hourly'}
                      </Badge>
                    )}
                    {displayData.experienceLevel && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <AcademicCapIcon className="h-3 w-3" />
                        {displayData.experienceLevel}
                      </Badge>
                    )}
                    {opportunity?.industry && (
                      <Badge variant="outline">
                        {opportunity.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h4 className="font-medium text-gray-900 mb-2">Project Description</h4>
                <p className="whitespace-pre-wrap">{displayData.description}</p>
              </div>
              
              {/* Additional Requirements */}
              {opportunity?.additionalRequirements && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                    Additional Requirements
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{opportunity.additionalRequirements}</p>
                </div>
              )}
              
              {/* Project Timeline */}
              {(displayData.startDate || displayData.endDate || displayData.timeline) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Project Timeline
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {displayData.startDate && (
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <div className="font-medium">{formatDate(displayData.startDate)}</div>
                      </div>
                    )}
                    {displayData.endDate && (
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <div className="font-medium">{formatDate(displayData.endDate)}</div>
                      </div>
                    )}
                    {displayData.timeline && (
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-medium">{displayData.timeline}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {displayData.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  Required Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {displayData.skills.map((skill: any, index: number) => (
                      <Badge 
                        key={skill.id || index} 
                        variant={skill.required ? "default" : "secondary"}
                        className={skill.required ? "bg-blue-600 text-white" : ""}
                      >
                        {skill.skill?.name || skill.name || (typeof skill === 'string' ? skill : 'Unknown Skill')}
                        {skill.required && <span className="ml-1 text-xs">*</span>}
                        {skill.level && (
                          <span className="ml-1 text-xs">({skill.level}/5)</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <InformationCircleIcon className="h-3 w-3" />
                    <span>* Required skills</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" />
                About the Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {opportunity?.business?.profile?.avatar ? (
                    <img 
                      src={opportunity.business.profile.avatar} 
                      alt={displayData.company}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{displayData.company}</h4>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t">
                  <div>
                    <span className="text-gray-600">Projects Posted:</span>
                    <div className="font-medium">View Profile</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Member Since:</span>
                    <div className="font-medium">{formatDate(displayData.postedAt)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Project Info & Apply */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {opportunity?.type === 'HOURLY' ? 'Hourly Rate' : 'Project Budget'}
                </span>
                <span className="font-medium">
                  {opportunity?.type === 'HOURLY' 
                    ? opportunity?.hourlyRate 
                      ? `${formatCurrency(opportunity.hourlyRate)}/hr`
                      : displayData.budget.min && displayData.budget.max
                        ? `${formatCurrency(displayData.budget.min)}-${formatCurrency(displayData.budget.max)}/hr`
                        : `${formatCurrency(displayData.budget.min || displayData.budget.max)}/hr`
                    : `${formatCurrency(displayData.budget.min)} - ${formatCurrency(displayData.budget.max)}`
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Timeline</span>
                <span className="font-medium">{displayData.timeline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Applications</span>
                <span className="font-medium">{displayData.applicationsCount}</span>
              </div>
              {displayData.contractsCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Contracts</span>
                  <span className="font-medium">{displayData.contractsCount}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Work Type</span>
                <Badge className={workArrangementColors[displayData.workArrangement as keyof typeof workArrangementColors]}>
                  {displayData.workArrangement === 'remote' ? 'Remote' : displayData.workArrangement === 'hybrid' ? 'Hybrid' : 'On-site'}
                </Badge>
              </div>
              {opportunity?.experienceLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experience Level</span>
                  <span className="font-medium">{opportunity.experienceLevel}</span>
                </div>
              )}
              {opportunity?.type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Project Type</span>
                  <span className="font-medium">
                    {opportunity.type === 'FIXED_PRICE' ? 'Fixed Price' : 'Hourly'}
                  </span>
                </div>
              )}
              {opportunity?.industry && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="font-medium">{opportunity.industry}</span>
                </div>
              )}
              
              {/* Location Notes */}
              {opportunity?.locationNotes && (
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-600 block mb-2">Location Notes</span>
                  <p className="text-sm text-gray-900">{opportunity.locationNotes}</p>
                </div>
              )}
              
              {/* Attachments */}
              {opportunity?.attachments && opportunity.attachments.length > 0 && (
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-600 block mb-2">Project Attachments</span>
                  <div className="space-y-2">
                    {opportunity.attachments.map((attachment: string, index: number) => {
                      const fileName = attachment.split('/').pop() || attachment
                      const fileUrl = attachment.startsWith('http') ? attachment : `http://localhost:5000/${attachment}`
                      return (
                        <a 
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {fileName}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Project Metadata */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Project ID:</span>
                  <span className="font-mono">{displayData.projectId}</span>
                </div>
                {displayData.updatedAt && displayData.updatedAt !== displayData.postedAt && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last Updated:</span>
                    <span>{formatRelativeTime(displayData.updatedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              {hasApplied && existingApplication ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckBadgeIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          You've Applied!
                        </h4>
                        <p className="text-sm text-blue-700">
                          You submitted your application on {formatDate(existingApplication.createdAt)}
                        </p>
                        <div className="mt-2">
                          <Badge className={
                            existingApplication.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            existingApplication.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                            existingApplication.status === 'SHORTLISTED' ? 'bg-purple-100 text-purple-800' :
                            existingApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }>
                            Status: {existingApplication.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    disabled
                    variant="secondary"
                  >
                    Already Applied
                  </Button>
                  <Link href="/talent/applications">
                    <Button className="w-full" size="sm" variant="outline">
                      View My Applications
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/talent/opportunities/${params.id}/apply`}>
                  <Button className="w-full" size="lg">
                    Apply for this Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OpportunityDetailPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <OpportunityDetailContent />
    </AuthGuard>
  )
}
