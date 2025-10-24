'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  BriefcaseIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/contexts/auth-context'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-gray-100 text-gray-800',
  in_review: 'bg-purple-100 text-purple-800',
}

function BusinessProjectsContent() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 Fetching my projects...');
        const response = await apiClient.get('/projects/my/projects')
        console.log('📋 Projects response:', response);
        
        // The backend returns projects directly, not wrapped in data
        const projectsData = Array.isArray(response) ? response : [];
        console.log('📋 Processed projects:', projectsData);
        setProjects(projectsData)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects')
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (project.skills || []).some((skill: any) => skill.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || 
                            project.status?.toLowerCase() === statusFilter.toLowerCase() ||
                            (statusFilter === 'active' && (project.status === 'PUBLISHED' || project.status === 'active')) ||
                            (statusFilter === 'draft' && (project.status === 'DRAFT' || project.status === 'draft')) ||
                            (statusFilter === 'completed' && (project.status === 'COMPLETED' || project.status === 'completed'))
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'budget_high':
          return (Number(b.budgetMax) || 0) - (Number(a.budgetMax) || 0)
        case 'budget_low':
          return (Number(a.budgetMin) || 0) - (Number(b.budgetMin) || 0)
        case 'applications':
          return (b.applicationsCount || b._count?.applications || 0) - (a.applicationsCount || a._count?.applications || 0)
        default:
          return 0
      }
    })

  const getProjectStats = () => {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'PUBLISHED' || p.status === 'active').length,
      draft: projects.filter(p => p.status === 'DRAFT' || p.status === 'draft').length,
      completed: projects.filter(p => p.status === 'COMPLETED' || p.status === 'completed').length,
      totalApplications: projects.reduce((sum, p) => sum + (p.applicationsCount || p._count?.applications || 0), 0),
    }
  }

  const stats = getProjectStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Loading your projects...</p>
          </div>
          <Link href="/business/projects/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
          </Link>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Failed to load projects</p>
          </div>
          <Link href="/business/projects/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">Manage and track your posted projects</p>
        </div>
        <Link href="/business/projects/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
            <div className="text-sm text-gray-500">Total Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects by title, description, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="budget_high">Highest Budget</option>
          <option value="budget_low">Lowest Budget</option>
          <option value="applications">Most Applications</option>
        </select>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Projects', count: projects.length },
            { key: 'active', label: 'Active', count: projects.filter(p => p.status === 'active').length },
            { key: 'draft', label: 'Drafts', count: projects.filter(p => p.status === 'draft').length },
            { key: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                statusFilter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Projects grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm line-clamp-3">{project.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Budget:</span>
                  <span className="font-medium">
                    {project.type === 'HOURLY' 
                      ? project.hourlyRate 
                        ? `${formatCurrency(project.hourlyRate)}/hr`
                        : project.budgetMin && project.budgetMax
                          ? `${formatCurrency(project.budgetMin)}-${formatCurrency(project.budgetMax)}/hr`
                          : `${formatCurrency(project.budgetMin || project.budgetMax || 0)}/hr`
                      : `${formatCurrency(project.budgetMin || 0)} - ${formatCurrency(project.budgetMax || 0)}`
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{project.location || project.city || 'Remote'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Applications:</span>
                  <span className="font-medium">{project.applicationsCount || project._count?.applications || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Posted:</span>
                  <span className="font-medium">{formatDate(project.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {(project.skills || []).slice(0, 3).map((skill: any) => (
                  <Badge key={skill.id || skill.name} variant="secondary" className="text-xs">
                    {skill.name || skill}
                  </Badge>
                ))}
                {(project.skills || []).length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(project.skills || []).length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/business/projects/${project.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Link href={`/business/projects/${project.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <BriefcaseIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? "You haven't posted any projects yet." 
              : `No ${statusFilter} projects found.`}
          </p>
          <div className="mt-6">
            <Link href="/business/projects/create">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Post Your First Project
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BusinessProjectsPage() {
  return (
    <AuthGuard requiredUserType="business">
      <BusinessProjectsContent />
    </AuthGuard>
  )
}
