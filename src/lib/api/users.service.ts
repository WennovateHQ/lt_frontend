import { apiClient } from './client'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'business' | 'talent' | 'admin'
  emailVerified: boolean
  phoneVerified: boolean
  phone?: string
  avatar?: string
  createdAt: string
  updatedAt: string
  lastActiveAt?: string
}

export interface BusinessUser extends User {
  userType: 'business'
  companyName: string
  companySize?: string
  industry?: string
  website?: string
  description?: string
  location?: {
    address?: string
    city?: string
    province?: string
    postalCode?: string
    country?: string
  }
  verificationStatus: 'pending' | 'verified' | 'rejected'
  businessRegistrationNumber?: string
}

export interface TalentUser extends User {
  userType: 'talent'
  title?: string
  bio?: string
  skills: string[]
  experience: {
    level: 'entry' | 'intermediate' | 'expert'
    years: number
  }
  hourlyRate?: {
    min: number
    max: number
    currency: string
  }
  availability: {
    status: 'available' | 'busy' | 'unavailable'
    hoursPerWeek?: number
    startDate?: string
  }
  location?: {
    city?: string
    province?: string
    country?: string
    remote: boolean
    willingToTravel: boolean
  }
  portfolio: Array<{
    id: string
    title: string
    description: string
    imageUrl?: string
    projectUrl?: string
    technologies: string[]
    completedAt: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startYear: number
    endYear?: number
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    credentialUrl?: string
  }>
  languages: Array<{
    language: string
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
  }>
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  // Business-specific fields
  companyName?: string
  companySize?: string
  industry?: string
  website?: string
  description?: string
  // Talent-specific fields
  title?: string
  bio?: string
  skills?: string[]
  experience?: TalentUser['experience']
  hourlyRate?: TalentUser['hourlyRate']
  availability?: TalentUser['availability']
  location?: TalentUser['location'] | BusinessUser['location']
}

export interface UserSearchParams {
  query?: string
  userType?: 'business' | 'talent'
  skills?: string[]
  location?: string
  experienceLevel?: string
  availability?: string
  verified?: boolean
  page?: number
  limit?: number
}

export interface UserSearchResponse {
  users: (BusinessUser | TalentUser)[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class UsersService {
  async getProfile(): Promise<BusinessUser | TalentUser> {
    return apiClient.get<BusinessUser | TalentUser>('/users/profile')
  }

  async updateProfile(data: UpdateProfileRequest): Promise<BusinessUser | TalentUser> {
    return apiClient.put<BusinessUser | TalentUser>('/users/profile', data)
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return apiClient.post<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async getUser(userId: string): Promise<BusinessUser | TalentUser> {
    return apiClient.get<BusinessUser | TalentUser>(`/users/${userId}`)
  }

  async searchUsers(params: UserSearchParams): Promise<UserSearchResponse> {
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

    return apiClient.get<UserSearchResponse>(`/users/search?${searchParams.toString()}`)
  }

  // Talent-specific methods
  async addPortfolioItem(data: Omit<TalentUser['portfolio'][0], 'id'>): Promise<TalentUser['portfolio'][0]> {
    return apiClient.post<TalentUser['portfolio'][0]>('/users/portfolio', data)
  }

  async updatePortfolioItem(itemId: string, data: Partial<TalentUser['portfolio'][0]>): Promise<TalentUser['portfolio'][0]> {
    return apiClient.put<TalentUser['portfolio'][0]>(`/users/portfolio/${itemId}`, data)
  }

  async deletePortfolioItem(itemId: string): Promise<void> {
    return apiClient.delete<void>(`/users/portfolio/${itemId}`)
  }

  async addEducation(data: Omit<TalentUser['education'][0], 'id'>): Promise<TalentUser['education'][0]> {
    return apiClient.post<TalentUser['education'][0]>('/users/education', data)
  }

  async updateEducation(itemId: string, data: Partial<TalentUser['education'][0]>): Promise<TalentUser['education'][0]> {
    return apiClient.put<TalentUser['education'][0]>(`/users/education/${itemId}`, data)
  }

  async deleteEducation(itemId: string): Promise<void> {
    return apiClient.delete<void>(`/users/education/${itemId}`)
  }

  async addCertification(data: Omit<TalentUser['certifications'][0], 'id'>): Promise<TalentUser['certifications'][0]> {
    return apiClient.post<TalentUser['certifications'][0]>('/users/certifications', data)
  }

  async updateCertification(itemId: string, data: Partial<TalentUser['certifications'][0]>): Promise<TalentUser['certifications'][0]> {
    return apiClient.put<TalentUser['certifications'][0]>(`/users/certifications/${itemId}`, data)
  }

  async deleteCertification(itemId: string): Promise<void> {
    return apiClient.delete<void>(`/users/certifications/${itemId}`)
  }

  // Admin methods
  async getAllUsers(params: UserSearchParams): Promise<UserSearchResponse> {
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

    return apiClient.get<UserSearchResponse>(`/users/admin/all?${searchParams.toString()}`)
  }

  async verifyUser(userId: string): Promise<void> {
    return apiClient.post<void>(`/users/admin/${userId}/verify`)
  }

  async suspendUser(userId: string, reason: string): Promise<void> {
    return apiClient.post<void>(`/users/admin/${userId}/suspend`, { reason })
  }

  async unsuspendUser(userId: string): Promise<void> {
    return apiClient.post<void>(`/users/admin/${userId}/unsuspend`)
  }
}

export const usersService = new UsersService()
