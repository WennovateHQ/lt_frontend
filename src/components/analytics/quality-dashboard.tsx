'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  BriefcaseIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { analyticsService, QualityMetrics, PerformanceMetrics } from '@/lib/api/analytics.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export function QualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const [qualityData, performanceData] = await Promise.all([
        analyticsService.getQualityMetrics(startDate.toISOString(), endDate.toISOString()),
        analyticsService.getPerformanceMetrics()
      ])

      setMetrics(qualityData)
      setPerformance(performanceData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthBadgeColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
    if (trend < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
    return <div className="w-4 h-4" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Quality Metrics Dashboard
          </h1>
          <p className="text-gray-600">Monitor platform performance and user satisfaction</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Platform Health Overview */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Platform Health Overview</span>
              <Badge className={getHealthBadgeColor(metrics.overview.platformHealth)}>
                {metrics.overview.platformHealth}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {(metrics.overview.successRate * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(metrics.projectMetrics.trends.completionRateTrend)}
                  <span className="text-xs text-gray-500 ml-1">
                    {metrics.projectMetrics.trends.completionRateTrend > 0 ? '+' : ''}
                    {(metrics.projectMetrics.trends.completionRateTrend * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics.overview.averageRating.toFixed(1)}
                </div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <div className="flex items-center justify-center mt-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-500 ml-1">out of 5.0</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {(metrics.overview.userSatisfactionScore * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-gray-600">User Satisfaction</p>
                <div className="flex items-center justify-center mt-1">
                  {getTrendIcon(metrics.projectMetrics.trends.satisfactionTrend)}
                  <span className="text-xs text-gray-500 ml-1">
                    {metrics.projectMetrics.trends.satisfactionTrend > 0 ? '+' : ''}
                    {(metrics.projectMetrics.trends.satisfactionTrend * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metrics.overview.completedProjects.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Completed Projects</p>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-xs text-gray-500">
                    of {metrics.overview.totalProjects.toLocaleString()} total
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Project Quality</TabsTrigger>
          <TabsTrigger value="users">User Metrics</TabsTrigger>
          <TabsTrigger value="matching">Matching Performance</TabsTrigger>
          <TabsTrigger value="system">System Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {metrics && (
            <>
              {/* Project Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {(metrics.projectMetrics.completionRate * 100).toFixed(1)}%
                    </div>
                    <Progress value={metrics.projectMetrics.completionRate * 100} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">Projects completed successfully</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">On-Time Delivery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {(metrics.projectMetrics.onTimeDelivery * 100).toFixed(1)}%
                    </div>
                    <Progress value={metrics.projectMetrics.onTimeDelivery * 100} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">Projects delivered on schedule</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Adherence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {(metrics.projectMetrics.budgetAdherence * 100).toFixed(1)}%
                    </div>
                    <Progress value={metrics.projectMetrics.budgetAdherence * 100} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">Projects within budget</p>
                  </CardContent>
                </Card>
              </div>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.projectMetrics.byCategory.map(category => (
                      <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{category.category}</h4>
                            <p className="text-sm text-gray-600">
                              {category.projectCount} projects • Avg: {formatCurrency(category.averageBudget)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold">
                              {(category.successRate * 100).toFixed(1)}%
                            </span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < category.averageRating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {metrics && (
            <>
              {/* User Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-semibold">{metrics.userMetrics.businesses.total.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold">{metrics.userMetrics.businesses.active.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg Projects Posted</span>
                        <span className="font-semibold">{metrics.userMetrics.businesses.averageProjectsPosted.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg Spend</span>
                        <span className="font-semibold">{formatCurrency(metrics.userMetrics.businesses.averageSpend)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{metrics.userMetrics.businesses.satisfactionScore.toFixed(1)}</span>
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Talent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-semibold">{metrics.userMetrics.talents.total.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold">{metrics.userMetrics.talents.active.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg Applications</span>
                        <span className="font-semibold">{metrics.userMetrics.talents.averageApplications.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg Earnings</span>
                        <span className="font-semibold">{formatCurrency(metrics.userMetrics.talents.averageEarnings)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{metrics.userMetrics.talents.satisfactionScore.toFixed(1)}</span>
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {metrics.userMetrics.engagement.dailyActiveUsers.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Daily Active Users</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {metrics.userMetrics.engagement.weeklyActiveUsers.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Weekly Active Users</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {Math.round(metrics.userMetrics.engagement.averageSessionDuration / 60)}m
                      </div>
                      <p className="text-sm text-gray-600">Avg Session Duration</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {(metrics.userMetrics.retentionRate * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600">Retention Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          {metrics && (
            <>
              {/* Matching Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Matching Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Overall Accuracy</span>
                          <span>{(metrics.matchingMetrics.matchAccuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.matchingMetrics.matchAccuracy * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Skill Matching</span>
                          <span>{(metrics.matchingMetrics.algorithmPerformance.skillMatchAccuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.matchingMetrics.algorithmPerformance.skillMatchAccuracy * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Budget Matching</span>
                          <span>{(metrics.matchingMetrics.algorithmPerformance.budgetMatchAccuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.matchingMetrics.algorithmPerformance.budgetMatchAccuracy * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Timeline Matching</span>
                          <span>{(metrics.matchingMetrics.algorithmPerformance.timelineMatchAccuracy * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.matchingMetrics.algorithmPerformance.timelineMatchAccuracy * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">View to Application</span>
                        <span className="font-semibold">{(metrics.matchingMetrics.conversionRates.viewToApplication * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Application to Interview</span>
                        <span className="font-semibold">{(metrics.matchingMetrics.conversionRates.applicationToInterview * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Interview to Hire</span>
                        <span className="font-semibold">{(metrics.matchingMetrics.conversionRates.interviewToHire * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Overall Conversion</span>
                        <span className="font-bold text-lg">{(metrics.matchingMetrics.conversionRates.overallConversion * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {performance && (
            <>
              {/* System Health */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {(performance.systemHealth.uptime * 100).toFixed(2)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Excellent</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {performance.systemHealth.responseTime}ms
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Average</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {(performance.systemHealth.errorRate * 100).toFixed(2)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Acceptable</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {performance.systemHealth.throughput.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">req/min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Details */}
              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performance.apiMetrics.endpointPerformance.slice(0, 5).map(endpoint => (
                      <div key={endpoint.endpoint} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{endpoint.endpoint}</p>
                          <p className="text-sm text-gray-600">
                            {endpoint.requests.toLocaleString()} requests
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{endpoint.averageTime}ms</p>
                          <p className="text-sm text-gray-600">
                            {(endpoint.errorRate * 100).toFixed(2)}% errors
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
