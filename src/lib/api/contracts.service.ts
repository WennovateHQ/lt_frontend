import { apiClient } from './client'

export interface Contract {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'disputed'
  type: 'fixed_price' | 'hourly' | 'milestone_based'
  
  // Parties
  businessId: string
  talentId: string
  projectId: string
  applicationId?: string
  
  // Financial terms
  totalAmount: number
  currency: string
  paymentTerms: {
    type: 'upfront' | 'milestone' | 'completion' | 'hourly'
    schedule?: Array<{
      milestone: string
      amount: number
      dueDate?: string
    }>
    hourlyRate?: number
    maxHours?: number
  }
  
  // Timeline
  startDate: string
  endDate: string
  estimatedHours?: number
  
  // Deliverables and milestones
  deliverables: Array<{
    id: string
    title: string
    description: string
    dueDate: string
    status: 'pending' | 'in_progress' | 'completed' | 'approved'
    amount?: number
  }>
  
  milestones: Array<{
    id: string
    title: string
    description: string
    amount: number
    dueDate: string
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected'
    submittedAt?: string
    approvedAt?: string
    rejectionReason?: string
    deliverables?: string[]
  }>
  
  // Terms and conditions
  terms: {
    workScope: string
    revisions: number
    cancellationPolicy: string
    intellectualProperty: string
    confidentiality: boolean
    disputeResolution: string
  }
  
  // Legal compliance (BC specific)
  compliance: {
    bcLaws: boolean
    taxObligations: string
    workersCompensation?: boolean
    businessLicense?: string
  }
  
  // Signatures
  signatures: {
    business: {
      signed: boolean
      signedAt?: string
      signedBy?: string
      ipAddress?: string
    }
    talent: {
      signed: boolean
      signedAt?: string
      signedBy?: string
      ipAddress?: string
    }
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
  signedAt?: string
  completedAt?: string
  cancelledAt?: string
  
  // Populated fields
  business?: {
    id: string
    firstName: string
    lastName: string
    companyName?: string
    email: string
  }
  
  talent?: {
    id: string
    firstName: string
    lastName: string
    email: string
    title?: string
  }
  
  project?: {
    id: string
    title: string
    description: string
  }
}

export interface CreateContractRequest {
  title: string
  description: string
  type: Contract['type']
  projectId: string
  talentId: string
  applicationId?: string
  totalAmount: number
  currency: string
  paymentTerms: Contract['paymentTerms']
  startDate: string
  endDate: string
  estimatedHours?: number
  deliverables: Array<{
    title: string
    description: string
    dueDate: string
    amount?: number
  }>
  milestones?: Array<{
    title: string
    description: string
    amount: number
    dueDate: string
  }>
  terms: Contract['terms']
  compliance: Contract['compliance']
}

export interface UpdateContractRequest {
  title?: string
  description?: string
  totalAmount?: number
  paymentTerms?: Contract['paymentTerms']
  startDate?: string
  endDate?: string
  estimatedHours?: number
  deliverables?: Contract['deliverables']
  milestones?: Contract['milestones']
  terms?: Contract['terms']
  compliance?: Contract['compliance']
}

export interface SignContractRequest {
  signature: string
  agreementConfirmed: boolean
  ipAddress?: string
}

export interface MilestoneData {
  title: string
  description: string
  amount: number
  dueDate: string
  deliverables?: string[]
}

export interface UpdateMilestoneRequest {
  title?: string
  description?: string
  amount?: number
  dueDate?: string
  deliverables?: string[]
}

export interface SubmissionData {
  deliverables: string[]
  notes?: string
  attachments?: Array<{
    fileName: string
    fileUrl: string
    fileType: string
  }>
}

export interface ContractStats {
  overview: {
    totalContracts: number
    activeContracts: number
    completedContracts: number
    totalValue: number
    averageValue: number
    completionRate: number
  }
  
  byStatus: Record<Contract['status'], number>
  byType: Record<Contract['type'], number>
  
  financial: {
    totalEarnings: number
    pendingPayments: number
    averageProjectValue: number
    topEarningCategories: Array<{
      category: string
      totalValue: number
      contractCount: number
    }>
  }
  
  performance: {
    onTimeCompletion: number
    averageDeliveryTime: number
    clientSatisfactionScore: number
    repeatClientRate: number
  }
  
  trends: {
    contractsThisMonth: number
    contractsLastMonth: number
    revenueThisMonth: number
    revenueLastMonth: number
  }
}

export interface ContractSearchParams {
  page?: number
  limit?: number
  status?: Contract['status']
  type?: Contract['type']
  businessId?: string
  talentId?: string
  projectId?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'totalAmount'
  sortOrder?: 'asc' | 'desc'
}

export interface ContractSearchResponse {
  contracts: Contract[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ContractsService {
  async createContract(data: CreateContractRequest): Promise<Contract> {
    return apiClient.post<Contract>('/contracts', data)
  }

  async getMyContracts(params?: ContractSearchParams): Promise<ContractSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ContractSearchResponse>(`/contracts/my/contracts?${searchParams.toString()}`)
  }

  async getContract(contractId: string): Promise<Contract> {
    return apiClient.get<Contract>(`/contracts/${contractId}`)
  }

  async updateContract(contractId: string, data: UpdateContractRequest): Promise<Contract> {
    return apiClient.put<Contract>(`/contracts/${contractId}`, data)
  }

  async signContract(contractId: string, data: SignContractRequest): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/${contractId}/sign`, data)
  }

  async deleteContract(contractId: string): Promise<void> {
    return apiClient.delete<void>(`/contracts/${contractId}`)
  }

  // Milestone Management
  async createMilestone(contractId: string, data: MilestoneData): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/${contractId}/milestones`, data)
  }

  async updateMilestone(milestoneId: string, data: UpdateMilestoneRequest): Promise<Contract> {
    return apiClient.put<Contract>(`/contracts/milestones/${milestoneId}`, data)
  }

  async submitMilestone(milestoneId: string, data: SubmissionData): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/milestones/${milestoneId}/submit`, data)
  }

  async approveMilestone(milestoneId: string, feedback?: string): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/milestones/${milestoneId}/approve`, { feedback })
  }

  async rejectMilestone(milestoneId: string, reason: string): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/milestones/${milestoneId}/reject`, { reason })
  }

  // Contract Actions
  async startContract(contractId: string): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/${contractId}/start`)
  }

  async completeContract(contractId: string, feedback?: string): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/${contractId}/complete`, { feedback })
  }

  async cancelContract(contractId: string, reason: string): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/${contractId}/cancel`, { reason })
  }

  async disputeContract(contractId: string, reason: string): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/${contractId}/dispute`, { reason })
  }

  // Templates and Utilities
  async getContractTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    type: Contract['type']
    template: Partial<Contract>
  }>> {
    return apiClient.get<Array<any>>('/contracts/templates')
  }

  async generateContractFromTemplate(templateId: string, data: Partial<CreateContractRequest>): Promise<Contract> {
    return apiClient.post<Contract>(`/contracts/templates/${templateId}/generate`, data)
  }

  async previewContract(data: CreateContractRequest): Promise<{ html: string; pdf?: string }> {
    return apiClient.post<{ html: string; pdf?: string }>('/contracts/preview', data)
  }

  async downloadContract(contractId: string, format: 'pdf' | 'docx' = 'pdf'): Promise<{ downloadUrl: string }> {
    return apiClient.get<{ downloadUrl: string }>(`/contracts/${contractId}/download?format=${format}`)
  }

  // Statistics and Analytics
  async getContractStats(): Promise<ContractStats> {
    return apiClient.get<ContractStats>('/contracts/stats')
  }

  async getBusinessContracts(businessId: string, params?: ContractSearchParams): Promise<ContractSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ContractSearchResponse>(`/contracts/business/${businessId}?${searchParams.toString()}`)
  }

  async getTalentContracts(talentId: string, params?: ContractSearchParams): Promise<ContractSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ContractSearchResponse>(`/contracts/talent/${talentId}?${searchParams.toString()}`)
  }

  // Compliance and Legal
  async validateContract(data: CreateContractRequest): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
    suggestions: string[]
  }> {
    return apiClient.post<any>('/contracts/validate', data)
  }

  async getComplianceRequirements(province: string = 'BC'): Promise<{
    requirements: Array<{
      category: string
      requirement: string
      mandatory: boolean
      description: string
    }>
    templates: Array<{
      name: string
      description: string
      content: string
    }>
  }> {
    return apiClient.get<any>(`/contracts/compliance?province=${province}`)
  }

  // Notifications and Updates
  async getContractNotifications(): Promise<Array<{
    id: string
    contractId: string
    type: 'milestone_due' | 'payment_due' | 'signature_required' | 'completion_request'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    createdAt: string
    read: boolean
  }>> {
    return apiClient.get<Array<any>>('/contracts/notifications')
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return apiClient.post<void>(`/contracts/notifications/${notificationId}/read`)
  }
}

export const contractsService = new ContractsService()
