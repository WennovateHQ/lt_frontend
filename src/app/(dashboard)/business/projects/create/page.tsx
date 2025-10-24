'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { projectsService } from '@/lib/api/projects.service'

// Import step components
import { ProjectDetailsStep } from '@/components/forms/project-creation/project-details-step'
import { SkillsRequirementsStep } from '@/components/forms/project-creation/skills-requirements-step'
import { LocationPreferencesStep } from '@/components/forms/project-creation/location-preferences-step'
import { BudgetTimelineStep } from '@/components/forms/project-creation/budget-timeline-step'
import { ReviewSubmitStep } from '@/components/forms/project-creation/review-submit-step'

export interface ProjectCreationData {
  // Step 1: Project Details
  title: string
  description: string
  industry: string
  attachments: File[]
  
  // Step 2: Skills Requirements  
  requiredSkills: string[]
  customSkills: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  additionalRequirements?: string
  
  // Step 3: Location Preferences
  location: string
  workArrangement: 'on-site' | 'hybrid' | 'remote'
  hybridPercentage?: number
  travelRadius?: 10 | 25 | 50 | 100
  locationNotes?: string
  
  // Step 4: Budget & Timeline
  budgetType: 'hourly' | 'fixed'
  budgetRange: { min: number; max: number }
  startDate: Date
  duration: string
  deadline?: Date
  deadlineFlexible: boolean
  
  // Step 5: Review & Submit
  termsAgreed?: boolean
}

const steps = [
  { id: 1, name: 'Project Details', description: 'Basic project information' },
  { id: 2, name: 'Skills & Requirements', description: 'Required skills and experience' },
  { id: 3, name: 'Location & Work', description: 'Work arrangement preferences' },
  { id: 4, name: 'Budget & Timeline', description: 'Budget and project timeline' },
  { id: 5, name: 'Review & Submit', description: 'Review and publish project' },
]

export default function CreateProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectData, setProjectData] = useState<Partial<ProjectCreationData>>({
    title: '',
    description: '',
    industry: '',
    attachments: [],
    requiredSkills: [],
    customSkills: [],
    experienceLevel: 'intermediate',
    location: '',
    workArrangement: 'hybrid',
    travelRadius: 25,
    budgetType: 'hourly',
    budgetRange: { min: 0, max: 0 },
    startDate: new Date(),
    duration: '',
    deadlineFlexible: true,
  })

  const updateProjectData = (data: Partial<ProjectCreationData>) => {
    setProjectData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      console.log('🚀 === FRONTEND SUBMIT FUNCTION CALLED ===');
      console.log('📋 Project data:', projectData);
      console.log('📋 Terms agreed:', projectData.termsAgreed);
      
      // Transform the data to match the backend API format
      const apiData = {
        title: projectData.title || '',
        description: projectData.description || '',
        industry: projectData.industry || '',
        budgetType: projectData.budgetType || 'hourly',
        budgetRange: projectData.budgetRange || { min: 0, max: 0 },
        requiredSkills: projectData.requiredSkills || [],
        customSkills: projectData.customSkills || [],
        experienceLevel: projectData.experienceLevel || 'intermediate',
        duration: projectData.duration || '',
        startDate: projectData.startDate,
        deadline: projectData.deadline,
        deadlineFlexible: projectData.deadlineFlexible || false,
        workArrangement: projectData.workArrangement || 'hybrid',
        location: projectData.location || '',
        locationNotes: projectData.locationNotes || '',
        travelRadius: projectData.travelRadius || 25,
        hybridPercentage: projectData.hybridPercentage || 50,
        additionalRequirements: projectData.additionalRequirements || '',
        attachments: projectData.attachments || [],
        termsAgreed: projectData.termsAgreed || false
      }
      
      console.log('Transformed API data:', apiData)
      
      // Call the actual API
      const createdProject = await projectsService.createProject(apiData)
      
      console.log('Project created successfully:', createdProject)
      
      // Redirect to projects list
      router.push('/business/projects?created=true')
    } catch (error) {
      console.error('Failed to create project:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsStep
            data={projectData}
            onUpdate={updateProjectData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <SkillsRequirementsStep
            data={projectData}
            onUpdate={updateProjectData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 3:
        return (
          <LocationPreferencesStep
            data={projectData}
            onUpdate={updateProjectData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 4:
        return (
          <BudgetTimelineStep
            data={projectData}
            onUpdate={updateProjectData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 5:
        return (
          <ReviewSubmitStep
            data={projectData}
            onUpdate={updateProjectData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/business/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600">Find the perfect talent for your project</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      {step.id < currentStep ? (
                        <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                          <CheckIcon className="h-5 w-5 text-white" />
                        </div>
                      ) : step.id === currentStep ? (
                        <div className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">{step.id}</span>
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">{step.id}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <span className={`text-sm font-medium ${
                        step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStep()}
      </div>
    </div>
  )
}
