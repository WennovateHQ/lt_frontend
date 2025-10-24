'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { adminService, AdminStats, ProjectMonitoring, UserMonitoring, DisputeCase } from '@/lib/api/admin.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [flaggedProjects, setFlaggedProjects] = useState<ProjectMonitoring[]>([])
  const [flaggedUsers, setFlaggedUsers] = useState<UserMonitoring[]>([])
  const [openDisputes, setOpenDisputes] = useState<DisputeCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [
        dashboardStats,
        projectsResponse,
        usersResponse,
        disputesResponse
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getProjectsForMonitoring({ flagged: true, limit: 5 }),
        adminService.getUsersForMonitoring({ flagged: true, limit: 5 }),
        adminService.getDisputes({ status: 'open', limit: 5 })
      ])

      setStats(dashboardStats)
      setFlaggedProjects(projectsResponse.projects)
      setFlaggedUsers(usersResponse.users)
      setOpenDisputes(disputesResponse.disputes)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'verified': case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': case 'disputed': case 'rejected': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor platform activity and manage operations</p>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{stats.userStats.newUsersToday} today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BriefcaseIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.totalProjects.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{stats.projectStats.projectsPostedToday} today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.totalRevenue)}</p>
                  <p className="text-sm text-green-600">+{formatCurrency(stats.financialStats.revenueToday)} today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overview.disputeCount}</p>
                  <p className="text-sm text-gray-600">Requires attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="font-medium">{(stats.performanceMetrics.systemUptime * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Match Success Rate</span>
                  <span className="font-medium">{(stats.performanceMetrics.matchSuccessRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User Satisfaction</span>
                  <span className="font-medium">{stats.performanceMetrics.userSatisfactionScore.toFixed(1)}/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-medium">{stats.userStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified Users</span>
                  <span className="font-medium">{stats.userStats.verifiedUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New This Week</span>
                  <span className="font-medium">+{stats.userStats.newUsersThisWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform Fees</span>
                  <span className="font-medium">{formatCurrency(stats.financialStats.platformFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Escrow Balance</span>
                  <span className="font-medium">{formatCurrency(stats.financialStats.escrowBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-medium">{formatCurrency(stats.financialStats.revenueThisMonth)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monitoring Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Flagged Projects</TabsTrigger>
          <TabsTrigger value="users">Flagged Users</TabsTrigger>
          <TabsTrigger value="disputes">Open Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedProjects.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">No projects currently flagged for review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedProjects.map(project => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-gray-600">
                            {project.business.companyName} • {formatCurrency(project.budget.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {project.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge className={getSeverityColor(flag.severity)}>
                              {flag.severity}
                            </Badge>
                            <span className="text-gray-700">{flag.message}</span>
                            <span className="text-gray-500">• {formatDate(flag.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-600">No users currently flagged for review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedUsers.map(user => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {user.firstName} {user.lastName}
                            {user.companyName && ` (${user.companyName})`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {user.email} • {user.userType} • Joined {formatDate(user.registrationDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          <Badge className={getStatusColor(user.verificationStatus)}>
                            {user.verificationStatus}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {user.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge className={getSeverityColor(flag.severity)}>
                              {flag.severity}
                            </Badge>
                            <span className="text-gray-700">{flag.message}</span>
                            <span className="text-gray-500">• {formatDate(flag.createdAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Open Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              {openDisputes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Disputes!</h3>
                  <p className="text-gray-600">All disputes have been resolved.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {openDisputes.map(dispute => (
                    <div key={dispute.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{dispute.details.subject}</h4>
                          <p className="text-sm text-gray-600">
                            {dispute.project.title} • {dispute.parties.complainant.name} vs {dispute.parties.respondent.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(dispute.priority)}>
                            {dispute.priority}
                          </Badge>
                          <Badge className={getStatusColor(dispute.status)}>
                            {dispute.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">{dispute.details.description}</p>
                        <div className="flex items-center gap-4">
                          <span>Type: {dispute.type}</span>
                          {dispute.details.amountInDispute && (
                            <span>Amount: {formatCurrency(dispute.details.amountInDispute)}</span>
                          )}
                          <span>Created: {formatDate(dispute.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
