'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ApplicationReviewInterface } from '@/components/business/application-review-interface'
import { useApplication } from '@/lib/hooks/use-applications'
import { ApplicationStatus } from '@/lib/types/application'
import { apiClient } from '@/lib/api/client'

// Mock data - would come from API
const mockApplication = {
  id: 'app-1',
  projectId: 'proj-1',
  talentId: 'talent-1',
  status: 'submitted' as ApplicationStatus,
  proposedRate: 75,
  rateType: 'hourly' as const,
  estimatedHours: 40,
  coverLetter: `Dear Hiring Manager,

I am excited to apply for your e-commerce website development project. With over 5 years of experience in React and Node.js development, I have successfully delivered similar projects that align perfectly with your requirements.

In my previous work, I have built several e-commerce platforms featuring:
- Responsive design with modern UI/UX principles
- Secure payment integration with Stripe and PayPal
- Inventory management systems
- Admin dashboards with analytics
- SEO optimization and performance tuning

I particularly appreciate that this is a local opportunity in Vancouver. I believe in-person collaboration leads to better outcomes, especially during the planning and feedback phases. I'm available for on-site meetings and can accommodate your preferred working style.

My approach emphasizes clean, maintainable code and thorough testing. I always deliver projects on time and within budget, with comprehensive documentation and post-launch support.

I would love to discuss how my experience can help bring your e-commerce vision to life. Thank you for considering my application.

Best regards,
Alex Chen`,
  proposedApproach: `My approach to this project will include:

1. Discovery & Planning Phase (Week 1)
   - Requirements analysis and technical specification
   - Architecture design and technology stack finalization
   - Database schema design
   - UI/UX wireframes and mockups

2. Development Phase (Weeks 2-5)
   - Frontend development with React and responsive design
   - Backend API development with Node.js and Express
   - Database implementation with MongoDB
   - Authentication and user management system

3. Integration & Testing (Week 6)
   - Payment gateway integration (Stripe)
   - Third-party service integrations
   - Comprehensive testing (unit, integration, e2e)
   - Performance optimization

4. Deployment & Launch (Week 7)
   - Production deployment setup
   - SSL certificate and security configuration
   - Monitoring and logging setup
   - Documentation and training

5. Post-Launch Support (Week 8)
   - Bug fixes and minor adjustments
   - Performance monitoring
   - User feedback incorporation
   - Knowledge transfer`,
  timeline: '8 weeks',
  startDate: new Date('2024-02-01'),
  availability: 'I am available to start immediately and can dedicate 40 hours per week to this project. My typical working hours are 9 AM - 6 PM PST, but I\'m flexible to accommodate client meetings and urgent requirements.',
  selectedPortfolio: ['portfolio-1', 'portfolio-2'],
  questions: [
    {
      question: 'What payment gateways would you prefer to integrate besides Stripe?',
      answer: ''
    },
    {
      question: 'Do you have existing branding guidelines or will this need to be developed?',
      answer: ''
    },
    {
      question: 'What is your expected traffic volume and do you need any specific hosting recommendations?',
      answer: ''
    }
  ],
  attachments: [
    {
      id: 'att-1',
      fileName: 'ecommerce-portfolio.pdf',
      fileSize: 2.5 * 1024 * 1024,
      fileType: 'application/pdf',
      uploadedAt: new Date('2024-01-18T10:30:00'),
      url: '/uploads/ecommerce-portfolio.pdf'
    },
    {
      id: 'att-2',
      fileName: 'technical-proposal.docx',
      fileSize: 1.2 * 1024 * 1024,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date('2024-01-18T10:30:00'),
      url: '/uploads/technical-proposal.docx'
    }
  ],
  additionalNotes: 'I\'m particularly excited about this project because I have experience with similar retail businesses in the Vancouver area. I understand the local market and can provide insights on user behavior and preferences specific to BC customers.',
  appliedAt: new Date('2024-01-18T10:30:00'),
  lastActivity: new Date('2024-01-18T10:30:00'),
  viewedByClient: true,
  messages: 0
}

const mockTalentProfile = {
  id: 'talent-1',
  firstName: 'Alex',
  lastName: 'Chen',
  displayName: 'Alex Chen',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  rating: 4.9,
  completedProjects: 23,
  skills: ['React', 'Node.js', 'MongoDB', 'Stripe Integration', 'E-commerce', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
  hourlyRate: { min: 65, max: 85 },
  location: 'Vancouver, BC',
  responseTime: '2 hours',
  successRate: 96
}

const mockProject = {
  id: 'proj-1',
  title: 'E-commerce Website Development',
  company: 'Vancouver Retail Co.'
}

export default function ApplicationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [talentProfile, setTalentProfile] = useState<any>(null)

  const projectId = params.id as string
  const applicationId = params.applicationId as string

  // Use the application hook for real data
  const { data: application, isLoading, error, refetch } = useApplication(applicationId)

  useEffect(() => {
    // Use real talent profile from application data if available
    if (application && (application as any)?.talent) {
      const talent = (application as any).talent;
      const profile = talent.profile || {};
      const location = profile.location;
      
      // Extract skills from the nested structure and preserve the original structure for the component
      const skills = profile.skills?.map((userSkill: any) => ({
        id: userSkill.id,
        name: userSkill.skill.name,
        level: userSkill.level,
        experience: userSkill.experience
      })) || [];
      
      // Format location string
      const locationString = location 
        ? `${location.city || ''}, ${location.province || ''}, ${location.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')
        : 'Location not specified';
      
      setTalentProfile({
        id: talent.id,
        firstName: profile.firstName || 'Unknown',
        lastName: profile.lastName || 'User',
        displayName: profile.displayName || `${profile.firstName || 'Unknown'} ${profile.lastName || 'User'}`,
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        // Don't show rating/reviews if we don't have real data
        // rating: undefined,
        // completedProjects: undefined,
        skills: skills,
        hourlyRate: profile.hourlyRate ? Number(profile.hourlyRate) : undefined,
        location: locationString,
        // Don't show response time if we don't have real data
        // responseTime: undefined,
        // Don't show success rate if we don't have real data
        // successRate: undefined
      })
    } else {
      // Fallback to mock data if no talent data available
      setTalentProfile(mockTalentProfile)
    }
  }, [application])

  const handleStatusUpdate = async (newStatus: ApplicationStatus, notes?: string) => {
    console.log('Status updated:', newStatus, notes)
    // Show success message
    // Optionally redirect or update UI
  }

  const handleScheduleInterview = async (date: Date) => {
    console.log('Interview scheduled for:', date)
    // Handle interview scheduling logic
    // Send calendar invite, notifications, etc.
  }

  const handleSendMessage = () => {
    // Navigate to messaging interface or open modal
    console.log('Opening message interface for talent:', talentProfile?.id)
    
    if (talentProfile?.id) {
      // Option 1: Navigate to messaging page
      router.push(`/business/messages?talentId=${talentProfile.id}&applicationId=${applicationId}`)
      
      // Option 2: Open messaging modal (if you prefer modal approach)
      // setShowMessageModal(true)
    } else {
      alert('Unable to start conversation - talent information not available')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/business/projects/${projectId}/applications`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
            <p className="text-gray-600">
              {(application as any)?.project?.title || 'Loading...'} • {(application as any)?.project?.business?.profile?.companyName || (application as any)?.project?.business?.profile?.displayName || 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/business/projects/${projectId}/applications`}>
            <Button variant="outline">
              View All Applications
            </Button>
          </Link>
          <Link href={`/business/projects/${projectId}`}>
            <Button variant="outline">
              View Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Application Review Interface */}
      {application && talentProfile ? (
        <ApplicationReviewInterface
          application={application}
          talentProfile={talentProfile}
          onStatusUpdate={handleStatusUpdate}
          onScheduleInterview={handleScheduleInterview}
          onSendMessage={handleSendMessage}
          onRefresh={() => refetch()}
        />
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
            {error && (
              <p className="text-red-600 mt-2">{error instanceof Error ? error.message : String(error)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
