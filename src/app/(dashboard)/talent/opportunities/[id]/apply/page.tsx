'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'


interface ApplicationData {
  coverLetter: string
  proposedApproach: string
  timeline: string
  rateQuote: number
  estimatedHours: number
  availability: string
  selectedPortfolio: string[]
  questions: string
  attachments: File[]
}

function ApplyToProjectContent() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const portfolioLoadedRef = useRef(false)
  
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    proposedApproach: '',
    timeline: '',
    rateQuote: 0,
    estimatedHours: 0,
    availability: '',
    selectedPortfolio: [],
    questions: '',
    attachments: []
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !user) return
      
      // Prevent multiple simultaneous calls
      if (isLoading) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch project details
        const projectResponse = await apiClient.get(`/projects/${params.id}`) as any
        
        // Handle different response structures
        const projectData = projectResponse.data || projectResponse
        
        if (!projectData) {
          throw new Error('No project data received from API')
        }
        
        setProject(projectData)

        // Set initial rate quote to project minimum budget after state is set
        // Check different possible budget field names and ensure they're numbers
        const budgetMin = Number(projectData.budgetMin || projectData.budget?.min || projectData.minBudget || 0) || 0
        if (budgetMin > 0) {
          setApplicationData(prev => ({
            ...prev,
            rateQuote: budgetMin
          }))
        }

        // Fetch user's portfolio - use the applications portfolio endpoint
        // Only fetch if we haven't already loaded it successfully
        if (!portfolioLoadedRef.current) {
          try {
            const portfolioResponse = await apiClient.get('/applications/portfolio-items') as any
            const responseData = portfolioResponse
            const portfolioItems = responseData?.portfolioItems || []
            
            if (portfolioItems.length > 0) {
              setPortfolio(portfolioItems)
              portfolioLoadedRef.current = true // Mark as successfully loaded
            } else {
              setPortfolio([])
            }
          } catch (portfolioError) {
            // Only set empty if we haven't loaded successfully before
            if (!portfolioLoadedRef.current) {
              setPortfolio([])
            }
          }
        }

      } catch (err) {
        setError('Failed to load project details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, user])

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }))
  }

  const validateApplication = () => {
    const newErrors: Record<string, string> = {}
    
    if (!applicationData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required'
    } else if (applicationData.coverLetter.length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters'
    }
    
    if (!applicationData.proposedApproach.trim()) {
      newErrors.proposedApproach = 'Proposed approach is required'
    } else if (applicationData.proposedApproach.length < 50) {
      newErrors.proposedApproach = 'Proposed approach must be at least 50 characters'
    }
    
    // Validate timeline for fixed projects
    if (project?.type !== 'HOURLY' && !applicationData.timeline.trim()) {
      newErrors.timeline = 'Timeline is required for fixed-price projects'
    }
    
    // Validate estimated hours for hourly projects
    if (project?.type === 'HOURLY' && (!applicationData.estimatedHours || applicationData.estimatedHours <= 0)) {
      newErrors.estimatedHours = 'Estimated hours is required for hourly projects'
    }
    
    if (project && applicationData.rateQuote) {
      const budgetMin = Number(project.budgetMin || project.budget?.min || project.minBudget || 0) || 0
      const budgetMax = Number(project.budgetMax || project.budget?.max || project.maxBudget || 999999) || 999999
      
      if (applicationData.rateQuote < budgetMin || applicationData.rateQuote > budgetMax) {
        newErrors.rateQuote = `Rate must be between ${formatCurrency(budgetMin)} and ${formatCurrency(budgetMax)}`
      }
    } else if (!applicationData.rateQuote) {
      newErrors.rateQuote = 'Rate quote is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateApplication() || !project || !user) return
    
    try {
      setIsSubmitting(true)
      
      // Create FormData for file uploads
      const formData = new FormData()
      formData.append('projectId', project.id)
      formData.append('coverLetter', applicationData.coverLetter)
      formData.append('proposedApproach', applicationData.proposedApproach)
      
      // Send proposedRate for hourly projects, proposedBudget for fixed projects
      if (project.type === 'HOURLY') {
        formData.append('proposedRate', applicationData.rateQuote.toString())
        if (applicationData.estimatedHours > 0) {
          formData.append('estimatedHours', applicationData.estimatedHours.toString())
        }
      } else {
        formData.append('proposedBudget', applicationData.rateQuote.toString())
        if (applicationData.timeline) {
          formData.append('timeline', applicationData.timeline)
        }
      }
      
      if (applicationData.availability) {
        formData.append('availability', applicationData.availability)
      }
      formData.append('selectedPortfolio', JSON.stringify(applicationData.selectedPortfolio))
      formData.append('questions', applicationData.questions)
      
      // Add files to FormData
      applicationData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file)
      })
      
      console.log('Submitting application with files:', {
        projectId: project.id,
        projectType: project.type,
        coverLetter: applicationData.coverLetter,
        proposedApproach: applicationData.proposedApproach,
        ...(project.type === 'HOURLY' ? {
          proposedRate: applicationData.rateQuote,
          estimatedHours: applicationData.estimatedHours,
        } : {
          proposedBudget: applicationData.rateQuote,
          timeline: applicationData.timeline,
        }),
        availability: applicationData.availability,
        selectedPortfolio: applicationData.selectedPortfolio,
        questions: applicationData.questions,
        attachmentCount: applicationData.attachments.length
      })
      
      // Submit application to API with files
      await apiClient.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      // Redirect to applications page with success message
      router.push('/talent/applications?applied=true')
    } catch (error) {
      console.error('Failed to submit application:', error)
      setError('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePortfolioToggle = (portfolioId: string) => {
    const currentSelection = applicationData.selectedPortfolio
    if (currentSelection.includes(portfolioId)) {
      updateApplicationData({
        selectedPortfolio: currentSelection.filter(id => id !== portfolioId)
      })
    } else {
      updateApplicationData({
        selectedPortfolio: [...currentSelection, portfolioId]
      })
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).filter(file => {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File ${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })
    
    updateApplicationData({
      attachments: [...applicationData.attachments, ...newFiles]
    })
  }

  const removeAttachment = (index: number) => {
    updateApplicationData({
      attachments: applicationData.attachments.filter((_, i) => i !== index)
    })
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

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
        <Link href="/talent/opportunities">
          <Button>Back to Opportunities</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/talent/opportunities">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apply to Project</h1>
            <p className="text-gray-600">Submit your proposal for this opportunity</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter</CardTitle>
              <p className="text-sm text-gray-600">
                Introduce yourself and explain why you're the right fit for this project.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Dear Hiring Manager,

I am excited to apply for your e-commerce website development project. With over 5 years of experience in React and Node.js development, I have successfully delivered similar projects that align perfectly with your requirements.

In my previous work, I have..."
                  value={applicationData.coverLetter}
                  onChange={(e) => updateApplicationData({ coverLetter: e.target.value })}
                  rows={8}
                  className={errors.coverLetter ? 'border-red-500' : ''}
                />
                {errors.coverLetter && (
                  <p className="text-sm text-red-600">{errors.coverLetter}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minimum 100 characters</span>
                  <span>{applicationData.coverLetter.length} characters</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposed Approach */}
          <Card>
            <CardHeader>
              <CardTitle>Proposed Approach</CardTitle>
              <p className="text-sm text-gray-600">
                Describe your methodology and how you plan to tackle this project.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="My approach to this project will include:

1. Discovery & Planning Phase
   - Requirements analysis and technical specification
   - Architecture design and technology stack finalization

2. Development Phase
   - Frontend development with React and responsive design
   - Backend API development with Node.js
   - Database design and implementation

3. Integration & Testing
   - Payment gateway integration (Stripe)
   - Comprehensive testing and quality assurance

4. Deployment & Launch
   - Production deployment and monitoring setup
   - Documentation and training"
                  value={applicationData.proposedApproach}
                  onChange={(e) => updateApplicationData({ proposedApproach: e.target.value })}
                  rows={10}
                  className={errors.proposedApproach ? 'border-red-500' : ''}
                />
                {errors.proposedApproach && (
                  <p className="text-sm text-red-600">{errors.proposedApproach}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minimum 50 characters</span>
                  <span>{applicationData.proposedApproach.length} characters</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Rate & Availability</CardTitle>
              <p className="text-sm text-gray-600">
                Provide your rate, availability, and {project.type === 'HOURLY' ? 'estimated hours' : 'timeline'} for this project.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">
                    Your Rate ({project.type === 'HOURLY' ? 'per hour' : 'total project'})
                  </Label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="rate"
                      type="number"
                      min={Number(project.budgetMin || project.budget?.min || project.minBudget || 0) || 0}
                      max={Number(project.budgetMax || project.budget?.max || project.maxBudget || 999999) || 999999}
                      value={applicationData.rateQuote || ''}
                      onChange={(e) => updateApplicationData({ rateQuote: parseInt(e.target.value) || 0 })}
                      className={`pl-10 ${errors.rateQuote ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.rateQuote && (
                    <p className="text-sm text-red-600">{errors.rateQuote}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Budget range: {formatCurrency(Number(project.budgetMin || project.budget?.min || project.minBudget || 0) || 0)} - {formatCurrency(Number(project.budgetMax || project.budget?.max || project.maxBudget || 999999) || 999999)}
                  </p>
                </div>
                
                {project.type === 'HOURLY' ? (
                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="estimatedHours"
                        type="number"
                        min={0}
                        placeholder="e.g., 40"
                        value={applicationData.estimatedHours || ''}
                        onChange={(e) => updateApplicationData({ estimatedHours: parseInt(e.target.value) || 0 })}
                        className={`pl-10 ${errors.estimatedHours ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.estimatedHours && (
                      <p className="text-sm text-red-600">{errors.estimatedHours}</p>
                    )}
                    {applicationData.estimatedHours > 0 && applicationData.rateQuote > 0 && (
                      <p className="text-xs text-gray-500">
                        Estimated total: {formatCurrency(applicationData.estimatedHours * applicationData.rateQuote)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Proposed Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., 8-10 weeks"
                      value={applicationData.timeline}
                      onChange={(e) => updateApplicationData({ timeline: e.target.value })}
                      className={errors.timeline ? 'border-red-500' : ''}
                    />
                    {errors.timeline && (
                      <p className="text-sm text-red-600">{errors.timeline}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability">Your Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Available immediately / Can start in 2 weeks / 20 hours per week"
                  value={applicationData.availability}
                  onChange={(e) => updateApplicationData({ availability: e.target.value })}
                  className={errors.availability ? 'border-red-500' : ''}
                />
                {errors.availability && (
                  <p className="text-sm text-red-600">{errors.availability}</p>
                )}
                <p className="text-xs text-gray-500">
                  Specify when you can start and your weekly availability
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Relevant Portfolio Items</CardTitle>
              <p className="text-sm text-gray-600">
                Select portfolio items that showcase your relevant experience.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <p>No portfolio items found.</p>
                    <Link href="/talent/profile" className="text-blue-600 hover:text-blue-500">
                      Add portfolio items to your profile
                    </Link>
                  </div>
                ) : (
                  portfolio.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        applicationData.selectedPortfolio.includes(item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handlePortfolioToggle(item.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={applicationData.selectedPortfolio.includes(item.id)}
                          onChange={() => handlePortfolioToggle(item.id)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                          <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {(item.technologies || []).map((tech: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof tech === 'string' ? tech : tech.name || 'Technology'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions & Additional Files */}
          <Card>
            <CardHeader>
              <CardTitle>Questions & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questions">Questions for the Client (Optional)</Label>
                <Textarea
                  id="questions"
                  placeholder="Any questions about the project requirements, timeline, or technical specifications?"
                  value={applicationData.questions}
                  onChange={(e) => updateApplicationData({ questions: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Files (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, JPG, PNG up to 5MB each
                  </p>
                </div>

                {applicationData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Attached Files</h4>
                    {applicationData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/talent/opportunities">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </div>

        {/* Project Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Project Details</span>
                {project.matchScore && (
                  <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    <StarIcon className="h-4 w-4 fill-current" />
                    {project.matchScore}% match
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium">
                    {formatCurrency(Number(project.budgetMin || project.budget?.min || project.minBudget || 0) || 0)} - {formatCurrency(Number(project.budgetMax || project.budget?.max || project.maxBudget || 999999) || 999999)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{project.timeline || project.duration || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{project.city || project.location || 'Remote'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Work Type:</span>
                  <span className="font-medium capitalize">{project.workType || project.workArrangement || 'Remote'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Applications:</span>
                  <span className="font-medium">{project._count?.applications || 0}</span>
                </div>
              </div>

              {project.skills && project.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill.skill?.name || skill.name || (typeof skill === 'string' ? skill : 'Skill')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Personalize your cover letter to the specific project</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Highlight relevant experience and skills</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Provide a detailed approach and timeline</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Select portfolio items that demonstrate similar work</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Ask thoughtful questions about the project</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ApplyToProjectPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <ApplyToProjectContent />
    </AuthGuard>
  )
}
