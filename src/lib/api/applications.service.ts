import { apiClient } from './client'

export interface Application {
  id: string
  projectId: string
  talentId: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  coverLetter: string
  proposedRate?: number        // For hourly projects
  proposedBudget?: number      // For fixed projects
  estimatedHours?: number
  availability?: string
  proposedApproach?: string
  timeline?: string
  questions?: string
  selectedPortfolio?: string[]
  attachments?: string[]
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  // Populated fields
  project?: {
    id: string
    title: string
    description: string
    type: 'HOURLY' | 'FIXED'
    budget: any
    startDate?: string
    endDate?: string
    duration?: string
    business: {
      id: string
      email: string
      profile: {
        firstName: string
        lastName: string
        companyName?: string
      }
    }
  }
  talent?: {
    id: string
    email: string
    profile: {
      firstName: string
      lastName: string
      displayName?: string
      title?: string
      avatar?: string
      hourlyRate?: number
      location?: {
        city: string
        province: string
      }
    }
  }
}

export interface CreateApplicationRequest {
  projectId: string
  coverLetter: string
  proposedRate?: number        // For hourly projects
  proposedBudget?: number      // For fixed projects
  estimatedHours?: number
  availability?: string
  proposedApproach?: string
  timeline?: string
  questions?: string
  selectedPortfolio?: string[]
  attachments?: File[]
}

export interface UpdateApplicationRequest {
  coverLetter?: string
  proposedRate?: number        // For hourly projects
  proposedBudget?: number      // For fixed projects
  estimatedHours?: number
  availability?: string
  proposedApproach?: string
  timeline?: string
  questions?: string
  selectedPortfolio?: string[]
}

export interface ApplicationSearchParams {
  projectId?: string
  talentId?: string
  status?: Application['status']
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface ApplicationSearchResponse {
  applications: Application[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApplicationStats {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  averageResponseTime: number // in hours
}

export class ApplicationsService {
  // Talent methods
  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    return apiClient.post<Application>('/applications', data)
  }

  async getMyApplications(params?: ApplicationSearchParams): Promise<ApplicationSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ApplicationSearchResponse>(`/applications/my?${searchParams.toString()}`)
  }

  async getApplication(applicationId: string): Promise<Application> {
    return apiClient.get<Application>(`/applications/${applicationId}`)
  }

  async updateApplication(applicationId: string, data: UpdateApplicationRequest): Promise<Application> {
    return apiClient.put<Application>(`/applications/${applicationId}`, data)
  }

  async withdrawApplication(applicationId: string): Promise<Application> {
    return apiClient.post<Application>(`/applications/${applicationId}/withdraw`)
  }

  // Business methods
  async getProjectApplications(projectId: string, params?: ApplicationSearchParams): Promise<ApplicationSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ApplicationSearchResponse>(`/applications/project/${projectId}?${searchParams.toString()}`)
  }

  async reviewApplication(applicationId: string, status: 'accepted' | 'rejected', feedback?: string): Promise<Application> {
    return apiClient.post<Application>(`/applications/${applicationId}/review`, {
      status,
      feedback
    })
  }

  async getBusinessApplications(params?: ApplicationSearchParams): Promise<ApplicationSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ApplicationSearchResponse>(`/applications/business?${searchParams.toString()}`)
  }

  // Admin methods
  async getAllApplications(params?: ApplicationSearchParams): Promise<ApplicationSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ApplicationSearchResponse>(`/applications/admin/all?${searchParams.toString()}`)
  }

  async getApplicationStats(): Promise<ApplicationStats> {
    return apiClient.get<ApplicationStats>('/applications/admin/stats')
  }

  // Utility methods
  async checkApplicationExists(projectId: string): Promise<{ exists: boolean; applicationId?: string }> {
    return apiClient.get<{ exists: boolean; applicationId?: string }>(`/applications/check/${projectId}`)
  }
}

export const applicationsService = new ApplicationsService()
