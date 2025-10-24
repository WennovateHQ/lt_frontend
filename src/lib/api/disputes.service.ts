import { apiClient } from './client'

export interface Dispute {
  id: string
  type: 'payment' | 'quality' | 'timeline' | 'scope' | 'communication' | 'contract_violation'
  status: 'draft' | 'submitted' | 'under_review' | 'mediation' | 'resolved' | 'escalated' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // Related entities
  projectId: string
  contractId?: string
  
  // Parties involved
  complainant: {
    userId: string
    userType: 'business' | 'talent'
    name: string
    email: string
  }
  
  respondent: {
    userId: string
    userType: 'business' | 'talent'
    name: string
    email: string
  }
  
  // Dispute details
  subject: string
  description: string
  category: string
  subcategory?: string
  
  // Financial details
  amountInDispute?: number
  currency?: string
  requestedResolution: 'refund' | 'partial_refund' | 'completion' | 'compensation' | 'mediation' | 'other'
  requestedAmount?: number
  
  // Evidence and documentation
  evidence: Array<{
    id: string
    type: 'document' | 'screenshot' | 'message' | 'contract' | 'invoice' | 'other'
    fileName: string
    fileUrl: string
    description: string
    uploadedBy: string
    uploadedAt: string
  }>
  
  // Timeline and communication
  messages: Array<{
    id: string
    senderId: string
    senderName: string
    senderType: 'complainant' | 'respondent' | 'mediator' | 'admin'
    content: string
    attachments?: Array<{
      fileName: string
      fileUrl: string
    }>
    timestamp: string
    isInternal: boolean
  }>
  
  // Resolution details
  resolution?: {
    outcome: 'complainant_favor' | 'respondent_favor' | 'compromise' | 'no_fault' | 'withdrawn'
    summary: string
    details: string
    financialResolution?: {
      refundAmount?: number
      compensationAmount?: number
      recipient: string
      paymentMethod: string
    }
    actionItems?: Array<{
      description: string
      assignedTo: string
      dueDate: string
      completed: boolean
    }>
    resolvedAt: string
    resolvedBy: string
  }
  
  // Mediation details
  mediator?: {
    id: string
    name: string
    email: string
    assignedAt: string
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  submittedAt?: string
  resolvedAt?: string
  
  // Metadata
  metadata?: Record<string, any>
}

export interface CreateDisputeRequest {
  projectId: string
  contractId?: string
  respondentId: string
  type: Dispute['type']
  subject: string
  description: string
  category: string
  subcategory?: string
  amountInDispute?: number
  requestedResolution: Dispute['requestedResolution']
  requestedAmount?: number
  evidence?: Array<{
    type: string
    fileName: string
    fileUrl: string
    description: string
  }>
}

export interface DisputeSearchParams {
  status?: Dispute['status']
  type?: Dispute['type']
  priority?: Dispute['priority']
  userId?: string
  projectId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export interface DisputeSearchResponse {
  disputes: Dispute[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: {
    byStatus: Record<string, number>
    byType: Record<string, number>
    totalAmount: number
  }
}

export interface DisputeTemplate {
  id: string
  name: string
  type: Dispute['type']
  category: string
  subject: string
  description: string
  suggestedEvidence: string[]
  isActive: boolean
}

export interface MediationSession {
  id: string
  disputeId: string
  mediatorId: string
  scheduledAt: string
  duration: number
  type: 'video_call' | 'phone_call' | 'chat' | 'in_person'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  
  participants: Array<{
    userId: string
    name: string
    role: 'complainant' | 'respondent' | 'mediator'
    joinedAt?: string
    leftAt?: string
  }>
  
  agenda: string[]
  notes?: string
  outcome?: string
  nextSteps?: string[]
  
  createdAt: string
  updatedAt: string
}

export class DisputesService {
  // Dispute management
  async getDisputes(params?: DisputeSearchParams): Promise<DisputeSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<DisputeSearchResponse>(`/disputes?${searchParams.toString()}`)
  }

  async getDispute(disputeId: string): Promise<Dispute> {
    return apiClient.get<Dispute>(`/disputes/${disputeId}`)
  }

  async createDispute(data: CreateDisputeRequest): Promise<Dispute> {
    return apiClient.post<Dispute>('/disputes', data)
  }

  async updateDispute(disputeId: string, data: Partial<Dispute>): Promise<Dispute> {
    return apiClient.put<Dispute>(`/disputes/${disputeId}`, data)
  }

  async submitDispute(disputeId: string): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/submit`)
  }

  async withdrawDispute(disputeId: string, reason: string): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/withdraw`, { reason })
  }

  // Evidence management
  async uploadEvidence(disputeId: string, file: File, description: string, type: string): Promise<{
    id: string
    fileUrl: string
    message: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', description)
    formData.append('type', type)

    return apiClient.post(`/disputes/${disputeId}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async deleteEvidence(disputeId: string, evidenceId: string): Promise<void> {
    return apiClient.delete(`/disputes/${disputeId}/evidence/${evidenceId}`)
  }

  // Communication
  async sendMessage(disputeId: string, content: string, attachments?: File[]): Promise<{
    id: string
    message: string
  }> {
    const formData = new FormData()
    formData.append('content', content)
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
    }

    return apiClient.post(`/disputes/${disputeId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async getMessages(disputeId: string): Promise<Dispute['messages']> {
    return apiClient.get<Dispute['messages']>(`/disputes/${disputeId}/messages`)
  }

  // Templates
  async getDisputeTemplates(type?: Dispute['type']): Promise<DisputeTemplate[]> {
    const params = type ? `?type=${type}` : ''
    return apiClient.get<DisputeTemplate[]>(`/disputes/templates${params}`)
  }

  async getDisputeTemplate(templateId: string): Promise<DisputeTemplate> {
    return apiClient.get<DisputeTemplate>(`/disputes/templates/${templateId}`)
  }

  // Mediation
  async requestMediation(disputeId: string, preferredTimes: string[]): Promise<{
    message: string
    estimatedAssignmentTime: string
  }> {
    return apiClient.post(`/disputes/${disputeId}/request-mediation`, { preferredTimes })
  }

  async getMediationSessions(disputeId: string): Promise<MediationSession[]> {
    return apiClient.get<MediationSession[]>(`/disputes/${disputeId}/mediation-sessions`)
  }

  async scheduleMediationSession(disputeId: string, data: {
    scheduledAt: string
    duration: number
    type: MediationSession['type']
    agenda: string[]
  }): Promise<MediationSession> {
    return apiClient.post<MediationSession>(`/disputes/${disputeId}/mediation-sessions`, data)
  }

  // Resolution
  async proposeResolution(disputeId: string, proposal: {
    outcome: 'complainant_favor' | 'respondent_favor' | 'compromise' | 'no_fault' | 'withdrawn'
    summary: string
    details: string
    financialResolution?: {
      refundAmount?: number
      compensationAmount?: number
      recipient: string
      paymentMethod: string
    }
    actionItems?: Array<{
      action: string
      owner: string
      dueDate: string
    }>
  }): Promise<{ message: string }> {
    return apiClient.post(`/disputes/${disputeId}/propose-resolution`, proposal)
  }

  async acceptResolution(disputeId: string): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/accept-resolution`)
  }

  async rejectResolution(disputeId: string, reason: string): Promise<{ message: string }> {
    return apiClient.post(`/disputes/${disputeId}/reject-resolution`, { reason })
  }

  // User actions
  async respondToDispute(disputeId: string, response: {
    content: string
    evidence?: Array<{
      type: string
      fileName: string
      fileUrl: string
      description: string
    }>
  }): Promise<{ message: string }> {
    return apiClient.post(`/disputes/${disputeId}/respond`, response)
  }

  async escalateDispute(disputeId: string, reason: string): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/escalate`, { reason })
  }

  // Analytics and reporting
  async getDisputeStats(dateFrom?: string, dateTo?: string): Promise<{
    total: number
    resolved: number
    pending: number
    averageResolutionTime: number
    resolutionRate: number
    
    byType: Array<{
      type: string
      count: number
      resolutionRate: number
      averageTime: number
    }>
    
    byOutcome: Array<{
      outcome: string
      count: number
      percentage: number
    }>
    
    monthlyTrends: Array<{
      month: string
      opened: number
      resolved: number
      pending: number
    }>
    
    topCategories: Array<{
      category: string
      count: number
      percentage: number
    }>
  }> {
    const params = new URLSearchParams()
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    
    return apiClient.get(`/disputes/stats?${params.toString()}`)
  }

  // Admin methods
  async assignMediator(disputeId: string, mediatorId: string): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/assign-mediator`, { mediatorId })
  }

  async updateDisputeStatus(disputeId: string, status: Dispute['status'], notes?: string): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/status`, { status, notes })
  }

  async updateDisputePriority(disputeId: string, priority: Dispute['priority']): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/priority`, { priority })
  }

  async resolveDispute(disputeId: string, resolution: {
    outcome: 'complainant_favor' | 'respondent_favor' | 'compromise' | 'no_fault' | 'withdrawn'
    summary: string
    details: string
    financialResolution?: {
      refundAmount?: number
      compensationAmount?: number
      recipient: string
      paymentMethod: string
    }
    actionItems?: Array<{
      action: string
      owner: string
      dueDate: string
    }>
  }): Promise<Dispute> {
    return apiClient.post<Dispute>(`/disputes/${disputeId}/resolve`, resolution as Dispute['resolution'])
  }

  async getAvailableMediators(): Promise<Array<{
    id: string
    name: string
    email: string
    specializations: string[]
    rating: number
    activeDisputes: number
    availability: 'available' | 'busy' | 'unavailable'
  }>> {
    return apiClient.get('/disputes/mediators')
  }

  // Bulk operations
  async bulkUpdateDisputes(disputeIds: string[], updates: {
    status?: Dispute['status']
    priority?: Dispute['priority']
    mediatorId?: string
  }): Promise<{
    successful: number
    failed: number
    errors: Array<{
      disputeId: string
      error: string
    }>
  }> {
    return apiClient.post('/disputes/bulk-update', { disputeIds, updates })
  }
}

export const disputesService = new DisputesService()
