import { apiClient } from './client'

export interface QualityMetrics {
  overview: {
    totalProjects: number
    completedProjects: number
    successRate: number
    averageRating: number
    userSatisfactionScore: number
    platformHealth: 'excellent' | 'good' | 'fair' | 'poor'
  }
  
  projectMetrics: {
    completionRate: number
    onTimeDelivery: number
    budgetAdherence: number
    qualityScore: number
    clientSatisfaction: number
    talentSatisfaction: number
    
    trends: {
      completionRateTrend: number
      qualityTrend: number
      satisfactionTrend: number
    }
    
    byCategory: Array<{
      category: string
      projectCount: number
      successRate: number
      averageRating: number
      averageBudget: number
    }>
  }
  
  userMetrics: {
    totalUsers: number
    activeUsers: number
    retentionRate: number
    verificationRate: number
    
    businesses: {
      total: number
      active: number
      averageProjectsPosted: number
      averageSpend: number
      satisfactionScore: number
    }
    
    talents: {
      total: number
      active: number
      averageApplications: number
      averageEarnings: number
      satisfactionScore: number
    }
    
    engagement: {
      dailyActiveUsers: number
      weeklyActiveUsers: number
      monthlyActiveUsers: number
      averageSessionDuration: number
      bounceRate: number
    }
  }
  
  matchingMetrics: {
    totalMatches: number
    successfulMatches: number
    matchAccuracy: number
    averageMatchTime: number
    
    algorithmPerformance: {
      skillMatchAccuracy: number
      budgetMatchAccuracy: number
      timelineMatchAccuracy: number
      locationMatchAccuracy: number
    }
    
    conversionRates: {
      viewToApplication: number
      applicationToInterview: number
      interviewToHire: number
      overallConversion: number
    }
  }
  
  communicationMetrics: {
    totalMessages: number
    averageResponseTime: number
    responseRate: number
    
    channels: {
      inPlatform: number
      email: number
      notifications: number
    }
    
    engagement: {
      messagesPerProject: number
      averageConversationLength: number
      resolutionRate: number
    }
  }
  
  financialMetrics: {
    totalTransactionValue: number
    averageProjectValue: number
    platformRevenue: number
    
    paymentMetrics: {
      successRate: number
      averageProcessingTime: number
      disputeRate: number
      chargebackRate: number
    }
    
    revenueBreakdown: {
      platformFees: number
      processingFees: number
      premiumFeatures: number
    }
  }
  
  supportMetrics: {
    totalTickets: number
    resolvedTickets: number
    averageResolutionTime: number
    customerSatisfaction: number
    
    ticketsByCategory: Array<{
      category: string
      count: number
      averageResolutionTime: number
    }>
    
    commonIssues: Array<{
      issue: string
      frequency: number
      impact: 'low' | 'medium' | 'high'
    }>
  }
}

export interface PerformanceMetrics {
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
    throughput: number
  }
  
  apiMetrics: {
    totalRequests: number
    averageResponseTime: number
    errorRate: number
    
    endpointPerformance: Array<{
      endpoint: string
      requests: number
      averageTime: number
      errorRate: number
    }>
  }
  
  databaseMetrics: {
    queryPerformance: number
    connectionPool: number
    slowQueries: number
    indexEfficiency: number
  }
  
  userExperience: {
    pageLoadTime: number
    timeToInteractive: number
    cumulativeLayoutShift: number
    firstContentfulPaint: number
  }
}

export interface BusinessIntelligence {
  marketAnalysis: {
    totalMarketSize: number
    marketGrowth: number
    competitorAnalysis: Array<{
      competitor: string
      marketShare: number
      strengths: string[]
      weaknesses: string[]
    }>
    
    opportunities: Array<{
      area: string
      potential: number
      effort: 'low' | 'medium' | 'high'
      timeline: string
    }>
  }
  
  userBehavior: {
    userJourneys: Array<{
      journey: string
      completionRate: number
      dropoffPoints: Array<{
        step: string
        dropoffRate: number
      }>
    }>
    
    featureUsage: Array<{
      feature: string
      adoptionRate: number
      engagement: number
      satisfaction: number
    }>
    
    cohortAnalysis: Array<{
      cohort: string
      retentionRates: number[]
      lifetimeValue: number
    }>
  }
  
  predictiveAnalytics: {
    churnPrediction: Array<{
      userId: string
      churnProbability: number
      riskFactors: string[]
      recommendedActions: string[]
    }>
    
    growthProjections: {
      userGrowth: Array<{
        month: string
        projectedUsers: number
        confidence: number
      }>
      
      revenueGrowth: Array<{
        month: string
        projectedRevenue: number
        confidence: number
      }>
    }
  }
}

export class AnalyticsService {
  // Quality Metrics
  async getQualityMetrics(dateFrom?: string, dateTo?: string): Promise<QualityMetrics> {
    const params = new URLSearchParams()
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    
    return apiClient.get<QualityMetrics>(`/analytics/quality?${params.toString()}`)
  }

  async getProjectQualityTrends(period: 'day' | 'week' | 'month' | 'quarter'): Promise<Array<{
    date: string
    completionRate: number
    qualityScore: number
    clientSatisfaction: number
    talentSatisfaction: number
  }>> {
    return apiClient.get(`/analytics/quality/trends?period=${period}`)
  }

  async getUserSatisfactionBreakdown(): Promise<{
    overall: number
    byUserType: {
      business: number
      talent: number
    }
    byCategory: Array<{
      category: string
      satisfaction: number
      responseCount: number
    }>
    factors: Array<{
      factor: string
      impact: number
      sentiment: 'positive' | 'neutral' | 'negative'
    }>
  }> {
    return apiClient.get('/analytics/satisfaction/breakdown')
  }

  // Performance Metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return apiClient.get<PerformanceMetrics>('/analytics/performance')
  }

  async getSystemHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical'
    services: Array<{
      name: string
      status: 'up' | 'down' | 'degraded'
      responseTime: number
      uptime: number
    }>
    alerts: Array<{
      severity: 'info' | 'warning' | 'error' | 'critical'
      message: string
      timestamp: string
    }>
  }> {
    return apiClient.get('/analytics/system/health')
  }

  // Business Intelligence
  async getBusinessIntelligence(): Promise<BusinessIntelligence> {
    return apiClient.get<BusinessIntelligence>('/analytics/business-intelligence')
  }

  async getCohortAnalysis(cohortType: 'registration' | 'first_project' | 'first_payment'): Promise<{
    cohorts: Array<{
      cohort: string
      size: number
      retentionRates: number[]
      lifetimeValue: number
    }>
    averageRetention: number[]
    insights: string[]
  }> {
    return apiClient.get(`/analytics/cohort?type=${cohortType}`)
  }

  async getFunnelAnalysis(funnel: 'registration' | 'project_posting' | 'application' | 'hiring'): Promise<{
    steps: Array<{
      step: string
      users: number
      conversionRate: number
      dropoffRate: number
    }>
    overallConversion: number
    bottlenecks: Array<{
      step: string
      issue: string
      impact: number
    }>
  }> {
    return apiClient.get(`/analytics/funnel?type=${funnel}`)
  }

  // Custom Reports
  async generateCustomReport(config: {
    name: string
    metrics: string[]
    filters: Record<string, any>
    dateRange: {
      from: string
      to: string
    }
    groupBy?: string
    format: 'json' | 'csv' | 'pdf'
  }): Promise<any> {
    if (config.format === 'json') {
      return apiClient.post('/analytics/custom-report', config)
    } else {
      const response = await apiClient.post('/analytics/custom-report', config, {
        responseType: 'blob'
      }) as any
      return response.data
    }
  }

  async getReportTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    metrics: string[]
    defaultFilters: Record<string, any>
    category: string
  }>> {
    return apiClient.get('/analytics/report-templates')
  }

  async saveReportTemplate(template: {
    name: string
    description: string
    config: any
  }): Promise<{ id: string; message: string }> {
    return apiClient.post('/analytics/report-templates', template)
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<{
    activeUsers: number
    activeProjects: number
    messagesPerMinute: number
    applicationsPerHour: number
    systemLoad: number
    
    recentActivity: Array<{
      type: 'user_registration' | 'project_posted' | 'application_submitted' | 'message_sent'
      timestamp: string
      details: Record<string, any>
    }>
  }> {
    return apiClient.get('/analytics/realtime')
  }

  async subscribeToRealTimeUpdates(callback: (data: any) => void): Promise<() => void> {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/analytics/realtime`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }
    
    return () => ws.close()
  }

  // Alerts and Monitoring
  async getAlerts(severity?: 'info' | 'warning' | 'error' | 'critical'): Promise<Array<{
    id: string
    severity: 'info' | 'warning' | 'error' | 'critical'
    title: string
    message: string
    metric: string
    threshold: number
    currentValue: number
    timestamp: string
    acknowledged: boolean
  }>> {
    const params = severity ? `?severity=${severity}` : ''
    return apiClient.get(`/analytics/alerts${params}`)
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    return apiClient.post(`/analytics/alerts/${alertId}/acknowledge`)
  }

  async createAlert(alert: {
    name: string
    metric: string
    condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
    threshold: number
    severity: 'info' | 'warning' | 'error' | 'critical'
    recipients: string[]
  }): Promise<{ id: string; message: string }> {
    return apiClient.post('/analytics/alerts', alert)
  }

  // Export and Sharing
  async exportDashboard(dashboardId: string, format: 'pdf' | 'png' | 'csv'): Promise<Blob> {
    const response = await apiClient.get(`/analytics/dashboards/${dashboardId}/export?format=${format}`, {
      responseType: 'blob'
    }) as any
    return response.data
  }

  async shareDashboard(dashboardId: string, recipients: string[], message?: string): Promise<{
    shareUrl: string
    message: string
  }> {
    return apiClient.post(`/analytics/dashboards/${dashboardId}/share`, { recipients, message })
  }

  async scheduleDashboardReport(config: {
    dashboardId: string
    schedule: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: 'pdf' | 'csv'
  }): Promise<{ scheduleId: string; message: string }> {
    return apiClient.post('/analytics/scheduled-reports', config)
  }
}

export const analyticsService = new AnalyticsService()
