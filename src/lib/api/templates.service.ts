import { apiClient } from './client'

export interface MessageTemplate {
  id: string
  name: string
  category: 'project_inquiry' | 'proposal_response' | 'contract_negotiation' | 'milestone_update' | 'payment_reminder' | 'project_completion' | 'feedback_request' | 'dispute_resolution' | 'general'
  userType: 'business' | 'talent' | 'both'
  subject: string
  content: string
  variables: Array<{
    name: string
    description: string
    required: boolean
    defaultValue?: string
  }>
  tags: string[]
  isPublic: boolean
  isActive: boolean
  usageCount: number
  rating: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateRequest {
  name: string
  category: MessageTemplate['category']
  userType: MessageTemplate['userType']
  subject: string
  content: string
  variables?: MessageTemplate['variables']
  tags?: string[]
  isPublic?: boolean
}

export interface TemplateSearchParams {
  category?: MessageTemplate['category']
  userType?: MessageTemplate['userType']
  tags?: string[]
  query?: string
  isPublic?: boolean
  createdBy?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'usageCount' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface TemplateSearchResponse {
  templates: MessageTemplate[]
  total: number
  page: number
  limit: number
  totalPages: number
  categories: Array<{
    category: string
    count: number
  }>
  popularTags: Array<{
    tag: string
    count: number
  }>
}

export interface TemplateUsage {
  id: string
  templateId: string
  userId: string
  recipientId: string
  projectId?: string
  variables: Record<string, string>
  generatedSubject: string
  generatedContent: string
  sentAt: string
  wasHelpful?: boolean
  feedback?: string
}

export class TemplatesService {
  // Template management
  async getTemplates(params?: TemplateSearchParams): Promise<TemplateSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }

    return apiClient.get<TemplateSearchResponse>(`/templates?${searchParams.toString()}`)
  }

  async getTemplate(templateId: string): Promise<MessageTemplate> {
    return apiClient.get<MessageTemplate>(`/templates/${templateId}`)
  }

  async createTemplate(data: CreateTemplateRequest): Promise<MessageTemplate> {
    return apiClient.post<MessageTemplate>('/templates', data)
  }

  async updateTemplate(templateId: string, data: Partial<MessageTemplate>): Promise<MessageTemplate> {
    return apiClient.put<MessageTemplate>(`/templates/${templateId}`, data)
  }

  async deleteTemplate(templateId: string): Promise<void> {
    return apiClient.delete(`/templates/${templateId}`)
  }

  async duplicateTemplate(templateId: string, name: string): Promise<MessageTemplate> {
    return apiClient.post<MessageTemplate>(`/templates/${templateId}/duplicate`, { name })
  }

  // Template usage
  async generateMessage(templateId: string, variables: Record<string, string>): Promise<{
    subject: string
    content: string
    preview: string
  }> {
    return apiClient.post(`/templates/${templateId}/generate`, { variables })
  }

  async useTemplate(templateId: string, data: {
    recipientId: string
    projectId?: string
    variables: Record<string, string>
    sendImmediately?: boolean
  }): Promise<{
    messageId?: string
    subject: string
    content: string
    message: string
  }> {
    return apiClient.post(`/templates/${templateId}/use`, data)
  }

  async getTemplateUsage(templateId: string): Promise<{
    usages: TemplateUsage[]
    stats: {
      totalUsages: number
      uniqueUsers: number
      averageRating: number
      helpfulPercentage: number
    }
  }> {
    return apiClient.get(`/templates/${templateId}/usage`)
  }

  async rateTemplate(templateId: string, rating: number, feedback?: string): Promise<void> {
    return apiClient.post(`/templates/${templateId}/rate`, { rating, feedback })
  }

  // My templates
  async getMyTemplates(): Promise<MessageTemplate[]> {
    return apiClient.get<MessageTemplate[]>('/templates/my')
  }

  async getFavoriteTemplates(): Promise<MessageTemplate[]> {
    return apiClient.get<MessageTemplate[]>('/templates/favorites')
  }

  async addToFavorites(templateId: string): Promise<void> {
    return apiClient.post(`/templates/${templateId}/favorite`)
  }

  async removeFromFavorites(templateId: string): Promise<void> {
    return apiClient.delete(`/templates/${templateId}/favorite`)
  }

  // Categories and suggestions
  async getTemplateCategories(): Promise<Array<{
    category: string
    name: string
    description: string
    templateCount: number
    popularTemplates: Array<{
      id: string
      name: string
      usageCount: number
    }>
  }>> {
    return apiClient.get('/templates/categories')
  }

  async getSuggestedTemplates(context: {
    projectId?: string
    recipientType?: 'business' | 'talent'
    situation?: string
  }): Promise<Array<{
    template: MessageTemplate
    relevanceScore: number
    reason: string
  }>> {
    return apiClient.post('/templates/suggestions', context)
  }

  async getPopularTemplates(category?: string, userType?: string): Promise<MessageTemplate[]> {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (userType) params.append('userType', userType)
    
    return apiClient.get<MessageTemplate[]>(`/templates/popular?${params.toString()}`)
  }

  // Template variables and validation
  async validateTemplate(template: {
    subject: string
    content: string
    variables: MessageTemplate['variables']
  }): Promise<{
    isValid: boolean
    errors: Array<{
      field: string
      message: string
    }>
    suggestions: Array<{
      type: 'variable' | 'content' | 'formatting'
      message: string
    }>
  }> {
    return apiClient.post('/templates/validate', template)
  }

  async extractVariables(content: string): Promise<Array<{
    name: string
    occurrences: number
    suggestedDescription: string
  }>> {
    return apiClient.post('/templates/extract-variables', { content })
  }

  // Bulk operations
  async bulkUpdateTemplates(templateIds: string[], updates: {
    category?: MessageTemplate['category']
    tags?: string[]
    isActive?: boolean
    isPublic?: boolean
  }): Promise<{
    successful: number
    failed: number
    errors: Array<{
      templateId: string
      error: string
    }>
  }> {
    return apiClient.post('/templates/bulk-update', { templateIds, updates })
  }

  async bulkDeleteTemplates(templateIds: string[]): Promise<{
    successful: number
    failed: number
    errors: Array<{
      templateId: string
      error: string
    }>
  }> {
    return apiClient.post('/templates/bulk-delete', { templateIds })
  }

  // Import/Export
  async exportTemplates(templateIds?: string[]): Promise<Blob> {
    const data = templateIds ? { templateIds } : {}
    const response = await apiClient.post('/templates/export', data, {
      responseType: 'blob'
    }) as any
    return response.data
  }

  async importTemplates(file: File): Promise<{
    imported: number
    skipped: number
    errors: Array<{
      template: string
      error: string
    }>
  }> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post('/templates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Analytics
  async getTemplateAnalytics(templateId?: string, dateFrom?: string, dateTo?: string): Promise<{
    overview: {
      totalTemplates: number
      totalUsages: number
      averageRating: number
      activeUsers: number
    }
    
    usageTrends: Array<{
      date: string
      usages: number
      uniqueUsers: number
    }>
    
    topTemplates: Array<{
      template: MessageTemplate
      usages: number
      rating: number
    }>
    
    categoryBreakdown: Array<{
      category: string
      templateCount: number
      usageCount: number
      averageRating: number
    }>
    
    userEngagement: {
      newUsers: number
      returningUsers: number
      averageTemplatesPerUser: number
    }
  }> {
    const params = new URLSearchParams()
    if (templateId) params.append('templateId', templateId)
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    
    return apiClient.get(`/templates/analytics?${params.toString()}`)
  }

  // Admin methods
  async moderateTemplate(templateId: string, action: 'approve' | 'reject' | 'flag', reason?: string): Promise<void> {
    return apiClient.post(`/templates/${templateId}/moderate`, { action, reason })
  }

  async getFlaggedTemplates(): Promise<Array<{
    template: MessageTemplate
    flags: Array<{
      reason: string
      reportedBy: string
      reportedAt: string
    }>
  }>> {
    return apiClient.get('/templates/admin/flagged')
  }

  async getTemplateReports(): Promise<Array<{
    templateId: string
    templateName: string
    reports: Array<{
      reason: string
      description: string
      reportedBy: string
      reportedAt: string
    }>
  }>> {
    return apiClient.get('/templates/admin/reports')
  }
}

export const templatesService = new TemplatesService()
