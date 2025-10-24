'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/contexts/auth-context'

// Initial empty state
const initialDashboardData = {
  stats: {
    activeProjects: 0,
    totalApplications: 0,
    activeContracts: 0,
    totalSpent: 0,
  },
  recentProjects: [],
  recentApplications: [],
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
}

function BusinessDashboardContent() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(initialDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch dashboard stats, recent projects, and recent applications in parallel
        let statsResponse, projectsResponse, applicationsResponse;
        
        try {
          const dashboardData = await apiClient.get('/users/dashboard');
          statsResponse = { data: dashboardData };
        } catch (err: any) {
          statsResponse = { data: { stats: initialDashboardData.stats } };
        }
        
        try {
          const projectsData = await apiClient.get('/projects/my/projects?limit=3');
          projectsResponse = { data: projectsData };
        } catch (err: any) {
          projectsResponse = { data: [] };
        }
        
        try {
          const applicationsData = await apiClient.get('/applications/business?limit=3');
          applicationsResponse = { data: applicationsData };
        } catch (err: any) {
          applicationsResponse = { data: [] };
        }

        setDashboardData({
          stats: (statsResponse as any)?.data?.stats || initialDashboardData.stats,
          recentProjects: Array.isArray((projectsResponse as any)?.data) ? (projectsResponse as any).data.slice(0, 3) : [],
          recentApplications: Array.isArray((applicationsResponse as any)?.data) ? (applicationsResponse as any).data.slice(0, 3) : []
        })
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        setDashboardData(initialDashboardData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const { stats, recentProjects, recentApplications } = dashboardData

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Link href="/business/projects">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No projects yet</p>
                <p className="text-sm">Create your first project to get started</p>
              </div>
            ) : (
              recentProjects.map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{project.applicationsCount} applications</span>
                      {(() => {
                        // Find the most recent applicant for this project
                        const projectApplication = recentApplications.find((app: any) => app.projectId === project.id) as any;
                        if (projectApplication && projectApplication.talent?.profile) {
                          const talent = projectApplication.talent.profile;
                          return <span>Latest: {talent.firstName} {talent.lastName}</span>;
                        }
                        return <span>{project.location}</span>;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {project.status}
                    </Badge>
                    <Link href={`/business/projects/${project.id}`}>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
            <Link href="/business/projects/create">
              <Button variant="outline" className="w-full">
                <PlusIcon className="h-4 w-4 mr-2" />
                Post New Project
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/business/applications">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No applications yet</p>
                <p className="text-sm">Applications will appear here when talents apply to your projects</p>
              </div>
            ) : (
              recentApplications.map((application: any) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {application.talent?.profile ? 
                        `${application.talent.profile.firstName} ${application.talent.profile.lastName}` : 
                        'Unknown Applicant'
                      }
                    </h4>
                    <p className="text-sm text-gray-600">{application.project?.title || 'Project'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                      {application.status}
                    </Badge>
                    <Link href={`/business/projects/${application.projectId}/applications/${application.id}`}>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/business/projects/create">
              <Button className="w-full h-20 flex-col">
                <PlusIcon className="h-6 w-6 mb-2" />
                Post New Project
              </Button>
            </Link>
            <Link href="/business/talent">
              <Button variant="outline" className="w-full h-20 flex-col">
                <UserGroupIcon className="h-6 w-6 mb-2" />
                Browse Talent
              </Button>
            </Link>
            <Link href="/business/contracts">
              <Button variant="outline" className="w-full h-20 flex-col">
                <DocumentTextIcon className="h-6 w-6 mb-2" />
                Manage Contracts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BusinessDashboard() {
  return (
    <AuthGuard requiredUserType="business">
      <BusinessDashboardContent />
    </AuthGuard>
  )
}
