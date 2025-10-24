import { apiClient } from './client'

export interface AdminStats {
  overview: {
    totalUsers: number
    totalProjects: number
    totalApplications: number
    totalRevenue: number
    activeContracts: number
    disputeCount: number
  }
  userStats: {
    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    activeUsers: number
    verifiedUsers: number
    businessUsers: number
    talentUsers: number
  }
  projectStats: {
    projectsPostedToday: number
    projectsPostedThisWeek: number
    projectsPostedThisMonth: number
    activeProjects: number
    completedProjects: number
    averageProjectValue: number
    topCategories: Array<{
      category: string
      count: number
      percentage: number
    }>
  }
  financialStats: {
    revenueToday: number
    revenueThisWeek: number
    revenueThisMonth: number
    revenueThisYear: number
    platformFees: number
    processingFees: number
    escrowBalance: number
    pendingPayouts: number
  }
  performanceMetrics: {
    averageMatchTime: number
    successfulMatches: number
    matchSuccessRate: number
    averageProjectCompletion: number
    userSatisfactionScore: number
    systemUptime: number
  }
}

export interface ProjectMonitoring {
  id: string
  title: string
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  business: {
    id: string
    companyName: string
    firstName: string
    lastName: string
    verificationStatus: 'pending' | 'verified' | 'rejected'
  }
  assignedTalent?: {
    id: string
    firstName: string
    lastName: string
    verificationStatus: 'pending' | 'verified' | 'rejected'
  }
  budget: {
    type: 'fixed' | 'hourly'
    amount: number
    currency: string
  }
  timeline: {
    startDate: string
    endDate: string
    daysRemaining: number
  }
  progress: {
    percentage: number
    milestonesCompleted: number
    totalMilestones: number
    lastActivity: string
  }
  flags: Array<{
    type: 'budget_overrun' | 'timeline_delay' | 'communication_gap' | 'quality_concern' | 'payment_issue'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    createdAt: string
  }>
  metrics: {
    applicationCount: number
    messageCount: number
    averageResponseTime: number
    clientSatisfaction?: number
    talentSatisfaction?: number
  }
  createdAt: string
  updatedAt: string
}

export interface UserMonitoring {
  id: string
  userType: 'business' | 'talent'
  firstName: string
  lastName: string
  email: string
  companyName?: string
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  registrationDate: string
  lastActivity: string
  stats: {
    projectsPosted?: number
    projectsCompleted?: number
    applicationsSubmitted?: number
    contractsCompleted?: number
    totalEarnings?: number
    totalSpent?: number
    averageRating: number
    responseRate: number
  }
  flags: Array<{
    type: 'suspicious_activity' | 'payment_issues' | 'quality_concerns' | 'policy_violation'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    createdAt: string
  }>
  verificationDocuments: Array<{
    type: 'id' | 'business_registration' | 'tax_document' | 'portfolio'
    status: 'pending' | 'approved' | 'rejected'
    uploadedAt: string
  }>
}

export interface DisputeCase {
  id: string
  type: 'payment' | 'quality' | 'timeline' | 'scope' | 'communication' | 'contract_violation'
  status: 'open' | 'investigating' | 'mediation' | 'resolved' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  project: {
    id: string
    title: string
  }
  
  parties: {
    complainant: {
      id: string
      name: string
      type: 'business' | 'talent'
    }
    respondent: {
      id: string
      name: string
      type: 'business' | 'talent'
    }
  }
  
  details: {
    subject: string
    description: string
    evidence: Array<{
      type: 'document' | 'screenshot' | 'message' | 'contract'
      url: string
      description: string
    }>
    requestedResolution: string
    amountInDispute?: number
  }
  
  timeline: Array<{
    action: string
    actor: string
    timestamp: string
    notes?: string
  }>
  
  assignedMediator?: {
    id: string
    name: string
  }
  
  resolution?: {
    outcome: 'complainant_favor' | 'respondent_favor' | 'compromise' | 'no_fault'
    details: string
    compensation?: {
      amount: number
      recipient: string
    }
    resolvedAt: string
    resolvedBy: string
  }
  
  createdAt: string
  updatedAt: string
}

export interface SystemAlert {
  id: string
  type: 'security' | 'performance' | 'financial' | 'user_activity' | 'system_error'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  source: string
  metadata?: Record<string, any>
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  createdAt: string
}

export class AdminService {
  // Dashboard and Analytics
  async getDashboardStats(): Promise<AdminStats> {
    return apiClient.get<AdminStats>('/admin/dashboard/stats')
  }

  async getRevenueAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<{
    revenue: Array<{
      date: string
      amount: number
      transactions: number
    }>
    breakdown: {
      platformFees: number
      processingFees: number
      escrowFees: number
    }
    trends: {
      revenueGrowth: number
      transactionGrowth: number
      averageTransactionValue: number
    }
  }> {
    return apiClient.get(`/admin/analytics/revenue?period=${period}`)
  }

  async getUserAnalytics(period: 'day' | 'week' | 'month' | 'year'): Promise<{
    registrations: Array<{
      date: string
      business: number
      talent: number
      total: number
    }>
    activity: Array<{
      date: string
      activeUsers: number
      newProjects: number
      applications: number
    }>
    retention: {
      day1: number
      day7: number
      day30: number
    }
  }> {
    return apiClient.get(`/admin/analytics/users?period=${period}`)
  }

  // Project Monitoring
  async getProjectsForMonitoring(params?: {
    status?: string
    flagged?: boolean
    page?: number
    limit?: number
    sortBy?: 'created' | 'updated' | 'budget' | 'timeline'
    sortOrder?: 'asc' | 'desc'
  }): Promise<{
    projects: ProjectMonitoring[]
    total: number
    flaggedCount: number
    page: number
    totalPages: number
  }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/admin/projects/monitoring?${searchParams.toString()}`)
  }

  async getProjectDetails(projectId: string): Promise<ProjectMonitoring> {
    return apiClient.get<ProjectMonitoring>(`/admin/projects/${projectId}/monitoring`)
  }

  async flagProject(projectId: string, flag: {
    type: ProjectMonitoring['flags'][0]['type']
    severity: ProjectMonitoring['flags'][0]['severity']
    message: string
  }): Promise<void> {
    return apiClient.post(`/admin/projects/${projectId}/flag`, flag)
  }

  async unflagProject(projectId: string, flagId: string): Promise<void> {
    return apiClient.delete(`/admin/projects/${projectId}/flags/${flagId}`)
  }

  // User Monitoring
  async getUsersForMonitoring(params?: {
    userType?: 'business' | 'talent'
    status?: string
    verificationStatus?: string
    flagged?: boolean
    page?: number
    limit?: number
  }): Promise<{
    users: UserMonitoring[]
    total: number
    flaggedCount: number
    page: number
    totalPages: number
  }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/admin/users/monitoring?${searchParams.toString()}`)
  }

  async getUserDetails(userId: string): Promise<UserMonitoring> {
    return apiClient.get<UserMonitoring>(`/admin/users/${userId}/monitoring`)
  }

  async suspendUser(userId: string, reason: string, duration?: number): Promise<void> {
    return apiClient.post(`/admin/users/${userId}/suspend`, { reason, duration })
  }

  async unsuspendUser(userId: string): Promise<void> {
    return apiClient.post(`/admin/users/${userId}/unsuspend`)
  }

  async verifyUser(userId: string, documentType: string): Promise<void> {
    return apiClient.post(`/admin/users/${userId}/verify`, { documentType })
  }

  async rejectVerification(userId: string, documentType: string, reason: string): Promise<void> {
    return apiClient.post(`/admin/users/${userId}/reject-verification`, { documentType, reason })
  }

  // Dispute Management
  async getDisputes(params?: {
    status?: string
    type?: string
    priority?: string
    page?: number
    limit?: number
  }): Promise<{
    disputes: DisputeCase[]
    total: number
    openCount: number
    page: number
    totalPages: number
  }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/admin/disputes?${searchParams.toString()}`)
  }

  async getDisputeDetails(disputeId: string): Promise<DisputeCase> {
    return apiClient.get<DisputeCase>(`/admin/disputes/${disputeId}`)
  }

  async assignMediator(disputeId: string, mediatorId: string): Promise<void> {
    return apiClient.post(`/admin/disputes/${disputeId}/assign`, { mediatorId })
  }

  async updateDisputeStatus(disputeId: string, status: DisputeCase['status'], notes?: string): Promise<void> {
    return apiClient.post(`/admin/disputes/${disputeId}/status`, { status, notes })
  }

  async resolveDispute(disputeId: string, resolution: {
    outcome: 'complainant_favor' | 'respondent_favor' | 'compromise' | 'no_fault'
    details: string
    compensation?: {
      amount: number
      recipient: string
    }
  }): Promise<void> {
    return apiClient.post(`/admin/disputes/${disputeId}/resolve`, resolution)
  }

  // System Alerts
  async getSystemAlerts(params?: {
    type?: string
    severity?: string
    acknowledged?: boolean
    page?: number
    limit?: number
  }): Promise<{
    alerts: SystemAlert[]
    total: number
    unacknowledgedCount: number
    page: number
    totalPages: number
  }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    return apiClient.get(`/admin/alerts?${searchParams.toString()}`)
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    return apiClient.post(`/admin/alerts/${alertId}/acknowledge`)
  }

  async acknowledgeAllAlerts(): Promise<void> {
    return apiClient.post('/admin/alerts/acknowledge-all')
  }

  // System Health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    services: Array<{
      name: string
      status: 'up' | 'down' | 'degraded'
      responseTime: number
      lastCheck: string
    }>
    metrics: {
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
      activeConnections: number
    }
  }> {
    return apiClient.get('/admin/system/health')
  }

  // Bulk Operations
  async bulkUserAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'verify' | 'delete', reason?: string): Promise<{
    successful: number
    failed: number
    errors: Array<{
      userId: string
      error: string
    }>
  }> {
    return apiClient.post('/admin/users/bulk-action', { userIds, action, reason })
  }

  async bulkProjectAction(projectIds: string[], action: 'flag' | 'unflag' | 'suspend' | 'activate', data?: any): Promise<{
    successful: number
    failed: number
    errors: Array<{
      projectId: string
      error: string
    }>
  }> {
    return apiClient.post('/admin/projects/bulk-action', { projectIds, action, data })
  }

  // Reports
  async generateReport(type: 'users' | 'projects' | 'revenue' | 'disputes', params: {
    startDate: string
    endDate: string
    format: 'csv' | 'pdf' | 'excel'
    filters?: Record<string, any>
  }): Promise<Blob> {
    const response = await apiClient.post(`/admin/reports/${type}`, params, {
      responseType: 'blob'
    }) as any
    return response.data
  }
}

export const adminService = new AdminService()
