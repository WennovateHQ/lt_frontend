'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { useAuth } from '@/lib/contexts/auth-context'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Under Review',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Not Selected',
}

const workArrangementColors = {
  remote: 'bg-green-100 text-green-800',
  hybrid: 'bg-blue-100 text-blue-800',
  onsite: 'bg-purple-100 text-purple-800',
}

function TalentApplicationsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiClient.get('/applications/my')
        
        // Check if response.data exists or if data is directly in response
        let applicationsData = []
        if (Array.isArray((response as any)?.data)) {
          applicationsData = (response as any).data
        } else if (Array.isArray(response)) {
          applicationsData = response
        } else {
          applicationsData = []
        }
        
        setApplications(applicationsData)
      } catch (err) {
        console.error('Error fetching applications:', err)
        console.error('Error details:', {
          message: (err as any)?.message,
          response: (err as any)?.response,
          status: (err as any)?.response?.status,
          data: (err as any)?.response?.data
        })
        setError('Failed to load applications')
        setApplications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [user])

  const filteredApplications = applications.filter(app => {
    // Safety checks for project data
    if (!app.project) {
      return false
    }
    
    const title = app.project.title || ''
    const company = app.project.company || ''
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate status counts
  const statusCounts = applications.reduce((counts, app) => {
    const status = app.status?.toLowerCase() || 'pending'
    if (counts[status as keyof typeof counts] !== undefined) {
      counts[status as keyof typeof counts]++
    }
    return counts
  }, {
    pending: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Loading your applications...</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track your project applications and their status</p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Applications', count: applications.length },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
            { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                statusFilter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                <p className="mb-4">
                  {applications.length === 0 
                    ? "You haven't applied to any projects yet." 
                    : "No applications match your current filters."
                  }
                </p>
                {applications.length === 0 && (
                  <Link href="/talent/opportunities">
                    <Button>Browse Opportunities</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={application.project.companyAvatar}
                        alt={application.project.company}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.project.title}
                        </h3>
                        <p className="text-sm text-gray-600">{application.project.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>
                          {application.project.type === 'HOURLY' 
                            ? application.project.hourlyRate 
                              ? `${formatCurrency(application.project.hourlyRate)}/hr`
                              : application.project.budgetMin && application.project.budgetMax
                                ? `${formatCurrency(application.project.budgetMin)}-${formatCurrency(application.project.budgetMax)}/hr`
                                : `${formatCurrency(application.project.budgetMin || application.project.budgetMax || 0)}/hr`
                            : `${formatCurrency(application.project.budgetMin || 0)} - ${formatCurrency(application.project.budgetMax || 0)}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        {application.project.location || 'Remote'}
                      </div>
                      {application.project.workArrangement && (
                        <Badge className={workArrangementColors[application.project.workArrangement as keyof typeof workArrangementColors]}>
                          {application.project.workArrangement}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                      {statusLabels[application.status as keyof typeof statusLabels]}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {formatRelativeTime(application.createdAt)}
                    </p>
                    {(application.messages || 0) > 0 && (
                      <p className="text-sm text-blue-600 mt-1">
                        {application.messages} new message{application.messages > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {application.rateType === 'hourly' ? 'Proposed Rate:' : 'Proposed Budget:'} 
                      <span className="font-medium">
                        {application.rateType === 'hourly' 
                          ? `$${application.proposedRate || 0}/hr`
                          : `$${application.proposedBudget || 0}`
                        }
                      </span>
                    </span>
                    {application.viewedByClient && (
                      <span className="text-sm text-green-600">✓ Viewed by client</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/talent/applications/${application.id}`)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {application.messages > 0 && (
                      <Button variant="outline" size="sm">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        Messages
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default function TalentApplicationsPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <TalentApplicationsContent />
    </AuthGuard>
  )
}
