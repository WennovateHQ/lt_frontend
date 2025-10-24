'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

// Utility function to format location object
const formatLocation = (location: any): string => {
  if (!location) return 'Location not specified'
  if (typeof location === 'string') return location
  if (typeof location === 'object') {
    const parts = [location.city, location.province, location.country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Location not specified'
  }
  return 'Location not specified'
}
import { apiClient } from '@/lib/api/client'

// Demo data - would come from API
const mockProject = {
  id: '1',
  title: 'E-commerce Website Development',
  description: `We're looking for an experienced React developer to build a modern e-commerce platform for our growing retail business. 

The project involves:
- Building responsive React components
- Integrating with Stripe payment system
- Implementing user authentication
- Creating admin dashboard
- Setting up product catalog
- Mobile-responsive design
- SEO optimization

We value local collaboration and would prefer someone who can meet in person for initial planning sessions. The ideal candidate should have experience with modern React patterns, TypeScript, and e-commerce platforms.

Timeline is flexible but we'd like to launch before the holiday season.`,
  status: 'active',
  budget: { min: 5000, max: 8000 },
  skills: ['React', 'Node.js', 'MongoDB', 'Stripe', 'TypeScript', 'Tailwind CSS'],
  workArrangement: 'hybrid',
  duration: '6-8 weeks',
  city: 'Vancouver, BC',
  radius: 50,
  startDate: '2024-02-15',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  applicationsCount: 12,
  viewsCount: 48,
  business: {
    id: 'b1',
    name: 'TechStart Vancouver',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    memberSince: '2023-06-15',
    projectsCompleted: 5,
    rating: 4.8,
    location: 'Vancouver, BC'
  },
  applications: [
    {
      id: 'a1',
      talent: {
        id: 't1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        title: 'Senior React Developer',
        rating: 4.9,
        completedProjects: 23,
        skills: ['React', 'Node.js', 'TypeScript'],
        location: 'Vancouver, BC'
      },
      proposedRate: 75,
      coverLetter: 'I have 5+ years of experience building e-commerce platforms...',
      status: 'pending',
      appliedAt: new Date('2024-01-18T10:30:00'),
    },
    {
      id: 'a2',
      talent: {
        id: 't2',
        name: 'Marcus Thompson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        title: 'Full-Stack Developer',
        rating: 4.7,
        completedProjects: 18,
        skills: ['React', 'MongoDB', 'Stripe'],
        location: 'Burnaby, BC'
      },
      proposedRate: 80,
      coverLetter: 'I specialize in e-commerce development and have built similar platforms...',
      status: 'shortlisted',
      appliedAt: new Date('2024-01-17T14:15:00'),
    }
  ]
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-gray-100 text-gray-800',
}

const applicationStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Fetching project details for ID:', params.id)
        const projectData = await apiClient.get(`/projects/${params.id}`) as any
        console.log('📋 Project data received:', projectData)
        setProject(projectData)
      } catch (error) {
        console.error('Failed to fetch project:', error)
        // Fallback to mock data if API fails
        setProject(mockProject)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchApplications = async () => {
      try {
        setApplicationsLoading(true)
        console.log('🔍 Fetching applications for project ID:', params.id)
        const applicationsData = await apiClient.get(`/projects/${params.id}/applications`) as any
        console.log('📋 Applications data received:', applicationsData)
        setApplications(applicationsData.applications || [])
      } catch (error) {
        console.error('Failed to fetch applications:', error)
        setApplications([])
      } finally {
        setApplicationsLoading(false)
      }
    }

    if (params.id) {
      fetchProjectData()
      fetchApplications()
    }
  }, [params.id])

  const handleStatusChange = async (newStatus: string) => {
    try {
      console.log('🔄 Updating project status to:', newStatus)
      await apiClient.put(`/projects/${project.id}`, { status: newStatus })
      setProject((prev: any) => ({ ...prev, status: newStatus }))
    } catch (error) {
      console.error('Failed to update project status:', error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!project) {
    return <div className="flex justify-center items-center h-64">Project not found</div>
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
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">Posted {formatRelativeTime(project.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[project.status as keyof typeof statusColors]}>
            {project.status}
          </Badge>
          <Link href={`/business/projects/${project.id}/edit`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                {project.description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <span className="text-sm font-medium text-gray-500">Required Skills:</span>
                {(project.skills || []).map((skill: any) => (
                  <Badge key={skill.id || skill.name || skill} variant="secondary">
                    {skill.name || skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.attachments.map((attachment: string, index: number) => {
                    const fileName = attachment.split('/').pop() || `attachment-${index + 1}`
                    const fileExtension = fileName.split('.').pop()?.toLowerCase()
                    
                    return (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{fileName}</span>
                          {fileExtension && (
                            <Badge variant="secondary" className="text-xs uppercase">
                              {fileExtension}
                            </Badge>
                          )}
                        </div>
                        <ArrowDownTrayIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </a>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Applications ({applications.length})</CardTitle>
              <Link href={`/business/projects/${project.id}/applications`}>
                <Button variant="outline" size="sm">
                  View All Applications
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading applications...</p>
                </div>
              ) : applications && applications.length > 0 ? (
                applications.slice(0, 3).map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={application.talent?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={application.talent?.profile?.displayName || 'Talent'}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {application.talent?.profile?.displayName || 
                           `${application.talent?.profile?.firstName || ''} ${application.talent?.profile?.lastName || ''}`.trim() ||
                           'Talent Name'}
                        </h4>
                        <p className="text-sm text-gray-600">{application.talent?.profile?.title || 'Professional'}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>⭐ {application.talent?.rating || 'New'}</span>
                          <span>{application.talent?.completedProjects || 0} projects</span>
                          <span>{formatLocation(application.talent?.profile?.location)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={applicationStatusColors[application.status as keyof typeof applicationStatusColors]}>
                        {application.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {application.rateType === 'hourly' 
                          ? `${formatCurrency(application.proposedRate || 0)}/hour`
                          : formatCurrency(application.proposedBudget || 0)
                        }
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {application.coverLetter}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(application.talent.skills || []).map((skill: any) => (
                        <Badge key={skill.id || skill.name || skill} variant="outline" className="text-xs">
                          {skill.name || skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/business/talents/${application.talent.id}`}>
                        <Button variant="outline" size="sm">
                          <UserIcon className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Link href={`/business/messages?talentId=${application.talent.id}`}>
                        <Button size="sm">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No applications yet</p>
                  <p className="text-sm">Applications will appear here when talents apply to your project.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Applications</span>
                <span className="font-medium">{applications.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Views</span>
                <span className="font-medium">{project.viewsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-medium">{formatDate(project.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium">{formatCurrency(project.budgetMin || project.budget?.min || 0)} - {formatCurrency(project.budgetMax || project.budget?.max || 0)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{formatLocation(project.location) || project.city || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{project.duration || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{project.startDate ? formatDate(new Date(project.startDate)) : 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Work Arrangement</p>
                  <p className="font-medium capitalize">{project.workArrangement || project.type || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Location Notes */}
              {project.locationNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Location Notes</p>
                  <p className="text-sm text-gray-900">{project.locationNotes}</p>
                </div>
              )}
              
              {/* Attachments */}
              {project.attachments && project.attachments.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Project Attachments</p>
                  <div className="space-y-2">
                    {project.attachments.map((attachment: string, index: number) => {
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
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {project.business?.profile?.companyName || 
                     project.business?.profile?.displayName || 
                     `${project.business?.profile?.firstName || ''} ${project.business?.profile?.lastName || ''}`.trim() ||
                     project.business?.email || 
                     'Business User'}
                  </h4>
                  <p className="text-sm text-gray-600">{project.business?.location || 'Location not specified'}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since</span>
                  <span>{project.business?.profile?.createdAt ? formatDate(new Date(project.business.profile.createdAt)) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects completed</span>
                  <span>{project.business?.projectsCompleted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span>⭐ {project.business?.rating || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
