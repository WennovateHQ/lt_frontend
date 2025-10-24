'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

interface Application {
  id: string
  status: string
  coverLetter: string
  proposedRate?: number
  proposedBudget?: number
  rateType: 'hourly' | 'fixed'
  createdAt: string
  talent?: {
    id: string
    email: string
    profile?: {
      firstName: string
      lastName: string
      title?: string
      hourlyRate?: number
    }
  }
}

interface Project {
  id: string
  title: string
  description: string
  business?: {
    profile?: {
      companyName: string
    }
  }
}

export default function ProjectApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Debug: Check current user info and token
        console.log('🔍 Debug: Checking authentication...')
        console.log('Token in localStorage:', localStorage.getItem('token'))
        console.log('Token in sessionStorage:', sessionStorage.getItem('token'))
        console.log('LocalTalents token:', localStorage.getItem('localtalents_token'))
        
        try {
          const userData = await apiClient.get('/users/profile')
          console.log('Current user:', userData)
        } catch (userErr: any) {
          console.log('User profile error:', userErr.response?.status, userErr.response?.data)
          console.log('Full user error:', userErr)
        }

        // Fetch project details and applications
        console.log('🔍 Fetching project and applications data...')
        const projectData = await apiClient.get(`/projects/${params.id}`) as any
        console.log('Project data loaded:', projectData)
        setProject(projectData as Project)

        const applicationsData = await apiClient.get(`/projects/${params.id}/applications`) as any
        console.log('Applications data loaded:', applicationsData)
        
        if (applicationsData && applicationsData.applications) {
          // Backend returns { projectId, applications, total }
          console.log('Using applications from nested structure:', applicationsData.applications)
          setApplications(applicationsData.applications as any[])
        } else if (Array.isArray(applicationsData)) {
          // Backend returns applications array directly
          console.log('Using applications array directly:', applicationsData)
          setApplications(applicationsData)
        } else {
          // No applications found
          console.log('No applications found, setting empty array')
          setApplications([])
        }
      } catch (err: any) {
        console.error('Error fetching project applications:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        })
        
        if (err.response?.status === 404) {
          const errorMsg = err.response?.data?.message || 'Project not found or you do not have permission to view its applications'
          setError(errorMsg)
          console.log('🚨 Project not found - this may be due to an invalid project ID in the URL')
        } else if (err.response?.status === 403) {
          setError('Access denied. You do not have permission to view this project\'s applications')
        } else if (err.code === 'ECONNREFUSED') {
          setError('Cannot connect to server. Please check if the backend is running.')
        } else {
          setError('Failed to load project applications. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  // Group applications by status
  const applicationsByStatus = {
    all: applications,
    pending: applications.filter(app => app.status === 'PENDING'),
    reviewed: applications.filter(app => app.status === 'REVIEWED'),
    accepted: applications.filter(app => app.status === 'ACCEPTED'),
    rejected: applications.filter(app => app.status === 'REJECTED')
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary'
      case 'accepted':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">Error</div>
            <div className="text-gray-600 mb-6">{error}</div>
            {error.includes('Project not found') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="text-blue-800 text-sm">
                  <strong>For testing:</strong> Try with a valid project ID owned by current user:
                  <br />
                  <a 
                    href="/business/projects/cmgbd5jor0001owtoxycox4ff/applications"
                    className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                  >
                    View project with applications →
                  </a>
                  <br />
                  <a 
                    href="/business/projects/cmgbd5jor0001owtoxycox4ff/applications/cmgfh155g0001owu0cvptqpp6"
                    className="text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                  >
                    View specific application detail →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600">Loading applications...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/business/projects/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">
              {project?.title || 'Loading...'} • {project?.business?.profile?.companyName || 'Your Company'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/business/projects/${projectId}`}>
            <Button variant="outline">
              View Project Details
            </Button>
          </Link>
          <Link href="/business/applications">
            <Button variant="outline">
              All Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({applicationsByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({applicationsByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({applicationsByStatus.reviewed.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({applicationsByStatus.accepted.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({applicationsByStatus.rejected.length})</TabsTrigger>
        </TabsList>

        {(['all', 'pending', 'reviewed', 'accepted', 'rejected'] as const).map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {applicationsByStatus[status].length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {status === 'all' 
                        ? 'No applications received for this project yet.'
                        : `No ${status} applications found.`
                      }
                    </p>
                    {status === 'all' && (
                      <p className="text-sm text-gray-500 mt-2">
                        Applications will appear here once talents start applying to your project.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              applicationsByStatus[status].map(application => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {application.talent?.profile?.firstName} {application.talent?.profile?.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {application.talent?.profile?.title || 'Professional'}
                        </p>
                        {application.talent?.profile?.hourlyRate && (
                          <p className="text-sm text-gray-600">
                            Rate: ${application.talent.profile.hourlyRate}/hour
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700">Cover Letter</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {application.coverLetter}
                        </p>
                      </div>
                      
                      {(application.proposedRate || application.proposedBudget) && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700">
                            {application.rateType === 'hourly' ? 'Proposed Rate' : 'Proposed Budget'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {application.rateType === 'hourly' 
                              ? `$${application.proposedRate} per hour`
                              : `$${application.proposedBudget} total budget`
                            }
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-gray-500">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/business/projects/${projectId}/applications/${application.id}`)}
                          >
                            View Details
                          </Button>
                          {application.status === 'PENDING' && (
                            <>
                              <Button size="sm" variant="default">
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive">
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
