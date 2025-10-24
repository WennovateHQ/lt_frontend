import { apiClient } from './client'

export interface Project {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  skills: string[]
  budget: {
    type: 'fixed' | 'hourly'
    amount?: number
    hourlyRate?: {
      min: number
      max: number
    }
  }
  timeline: {
    type: 'flexible' | 'fixed'
    duration?: number
    startDate?: string
    endDate?: string
  }
  location: {
    type: 'remote' | 'onsite' | 'hybrid'
    address?: string
    city?: string
    province?: string
    postalCode?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  requirements: {
    experienceLevel: 'entry' | 'intermediate' | 'expert'
    languages?: string[]
    certifications?: string[]
    portfolioRequired: boolean
  }
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled'
  businessId: string
  business?: {
    id: string
    companyName: string
    firstName: string
    lastName: string
  }
  applicationsCount?: number
  viewsCount?: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CreateProjectRequest {
  title: string
  description: string
  industry: string
  budgetType: 'hourly' | 'fixed'
  budgetRange: { min: number; max: number }
  requiredSkills: string[]
  customSkills?: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration: string
  startDate?: Date
  deadline?: Date
  deadlineFlexible: boolean
  workArrangement: 'on-site' | 'hybrid' | 'remote'
  location: string
  locationNotes?: string
  travelRadius?: number
  hybridPercentage?: number
  additionalRequirements?: string
  attachments?: File[]
  termsAgreed?: boolean
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface ProjectSearchParams {
  query?: string
  category?: string
  skills?: string[]
  budgetMin?: number
  budgetMax?: number
  location?: string
  remote?: boolean
  experienceLevel?: string
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'date' | 'budget'
  sortOrder?: 'asc' | 'desc'
}

export interface ProjectSearchResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectStats {
  totalProjects: number
  publishedProjects: number
  completedProjects: number
  averageBudget: number
  topCategories: Array<{
    category: string
    count: number
  }>
  topSkills: Array<{
    skill: string
    count: number
  }>
}

export class ProjectsService {
  async searchProjects(params: ProjectSearchParams): Promise<ProjectSearchResponse> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return apiClient.get<ProjectSearchResponse>(`/projects/search?${searchParams.toString()}`)
  }

  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`)
  }

  async getBusinessProjects(businessId: string): Promise<Project[]> {
    return apiClient.get<Project[]>(`/projects/business/${businessId}`)
  }

  async getMyProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects/my/projects')
  }

  async getRecommendedProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects/recommended/for-me')
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    // Create FormData to handle file uploads
    const formData = new FormData()
    
    // Add all text fields
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('industry', data.industry)
    formData.append('budgetType', data.budgetType)
    formData.append('budgetRange', JSON.stringify(data.budgetRange))
    formData.append('experienceLevel', data.experienceLevel)
    formData.append('duration', data.duration)
    formData.append('deadlineFlexible', String(data.deadlineFlexible))
    formData.append('workArrangement', data.workArrangement)
    formData.append('location', data.location)
    
    if (data.requiredSkills && data.requiredSkills.length > 0) {
      formData.append('requiredSkills', JSON.stringify(data.requiredSkills))
    }
    if (data.customSkills && data.customSkills.length > 0) {
      formData.append('customSkills', JSON.stringify(data.customSkills))
    }
    if (data.startDate) {
      formData.append('startDate', data.startDate.toISOString())
    }
    if (data.deadline) {
      formData.append('deadline', data.deadline.toISOString())
    }
    if (data.locationNotes) {
      formData.append('locationNotes', data.locationNotes)
    }
    if (data.travelRadius) {
      formData.append('travelRadius', String(data.travelRadius))
    }
    if (data.hybridPercentage) {
      formData.append('hybridPercentage', String(data.hybridPercentage))
    }
    if (data.additionalRequirements) {
      formData.append('additionalRequirements', data.additionalRequirements)
    }
    
    // Add file attachments
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file)
      })
    }
    
    // Use raw fetch to send FormData
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const token = localStorage.getItem('token') ||
                 sessionStorage.getItem('token') || 
                 localStorage.getItem('localtalents_token')
    
    const response = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create project')
    }
    
    return response.json()
  }

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.put<Project>(`/projects/${projectId}`, data)
  }

  async updateProjectStatus(projectId: string, status: Project['status']): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${projectId}/status`, { status })
  }

  async publishProject(projectId: string): Promise<Project> {
    return apiClient.post<Project>(`/projects/${projectId}/publish`)
  }

  async cancelProject(projectId: string): Promise<Project> {
    return apiClient.post<Project>(`/projects/${projectId}/cancel`)
  }

  async completeProject(projectId: string): Promise<Project> {
    return apiClient.post<Project>(`/projects/${projectId}/complete`)
  }

  async deleteProject(projectId: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${projectId}`)
  }

  async getProjectStats(): Promise<ProjectStats> {
    return apiClient.get<ProjectStats>('/projects/admin/stats')
  }
}

export const projectsService = new ProjectsService()
