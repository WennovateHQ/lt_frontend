import { apiClient } from './client'

export interface MatchScore {
  overall: number
  breakdown: {
    skills: number
    experience: number
    location: number
    budget: number
    availability: number
    portfolio: number
  }
  factors: Array<{
    factor: string
    score: number
    weight: number
    explanation: string
  }>
}

export interface TalentMatch {
  talentId: string
  projectId: string
  project?: any  // Populated relation
  matchScore: MatchScore
  talent: {
    id: string
    firstName: string
    lastName: string
    title?: string
    avatar?: string
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
    location?: {
      city?: string
      province?: string
      remote: boolean
    }
    availability: {
      status: 'available' | 'busy' | 'unavailable'
      hoursPerWeek?: number
    }
    portfolio: Array<{
      title: string
      description: string
      imageUrl?: string
      technologies: string[]
    }>
  }
  reasons: string[]
  concerns: string[]
  createdAt: string
}

export interface ProjectMatch {
  projectId: string
  talentId: string
  matchScore: MatchScore
  project: {
    id: string
    title: string
    description: string
    category: string
    skills: string[]
    budget: {
      type: 'fixed' | 'hourly'
      amount?: number
      hourlyRate?: {
        min: number
        max: number
      }
    }
    location: {
      type: 'remote' | 'onsite' | 'hybrid'
      city?: string
      province?: string
    }
    requirements: {
      experienceLevel: 'entry' | 'intermediate' | 'expert'
    }
    business: {
      id: string
      companyName: string
      firstName: string
      lastName: string
    }
  }
  reasons: string[]
  concerns: string[]
  createdAt: string
}

export interface MatchingParams {
  projectId?: string
  talentId?: string
  minScore?: number
  maxResults?: number
  includeApplied?: boolean
  sortBy?: 'score' | 'date'
  sortOrder?: 'desc' | 'asc'
}

export interface MatchingResponse<T> {
  matches: T[]
  total: number
  averageScore: number
  processingTime: number
}

export interface MatchingPreferences {
  id: string
  userId: string
  weights: {
    skills: number
    experience: number
    location: number
    budget: number
    availability: number
    portfolio: number
  }
  filters: {
    minExperience?: 'entry' | 'intermediate' | 'expert'
    maxDistance?: number // in km
    remoteOnly?: boolean
    budgetRange?: {
      min: number
      max: number
    }
    requiredSkills?: string[]
    excludedSkills?: string[]
  }
  notifications: {
    newMatches: boolean
    scoreThreshold: number
    frequency: 'immediate' | 'daily' | 'weekly'
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateMatchingPreferencesRequest {
  weights?: Partial<MatchingPreferences['weights']>
  filters?: Partial<MatchingPreferences['filters']>
  notifications?: Partial<MatchingPreferences['notifications']>
}

export class MatchingService {
  // Get matches for talents (projects they might be interested in)
  async getTalentMatches(params?: MatchingParams): Promise<MatchingResponse<ProjectMatch>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<MatchingResponse<ProjectMatch>>(`/matching/talent?${searchParams.toString()}`)
  }

  // Get matches for businesses (talents for their projects)
  async getProjectMatches(projectId: string, params?: MatchingParams): Promise<MatchingResponse<TalentMatch>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<MatchingResponse<TalentMatch>>(`/matching/project/${projectId}?${searchParams.toString()}`)
  }

  // Get specific match details
  async getMatchDetails(projectId: string, talentId: string): Promise<{
    match: TalentMatch
    detailedAnalysis: {
      skillsAnalysis: Array<{
        skill: string
        required: boolean
        talentHas: boolean
        proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        yearsExperience?: number
      }>
      locationAnalysis: {
        distance?: number
        remoteCompatible: boolean
        timezoneCompatible: boolean
      }
      budgetAnalysis: {
        talentRate?: { min: number; max: number }
        projectBudget?: { type: string; amount?: number; hourlyRate?: any }
        compatible: boolean
        explanation: string
      }
      availabilityAnalysis: {
        talentAvailable: boolean
        estimatedStartDate?: string
        conflictingProjects?: number
      }
    }
  }> {
    return apiClient.get(`/matching/details/${projectId}/${talentId}`)
  }

  // Matching preferences
  async getMatchingPreferences(): Promise<MatchingPreferences> {
    return apiClient.get<MatchingPreferences>('/matching/preferences')
  }

  async updateMatchingPreferences(data: UpdateMatchingPreferencesRequest): Promise<MatchingPreferences> {
    return apiClient.put<MatchingPreferences>('/matching/preferences', data)
  }

  async resetMatchingPreferences(): Promise<MatchingPreferences> {
    return apiClient.post<MatchingPreferences>('/matching/preferences/reset')
  }

  // Feedback and learning
  async provideFeedback(matchId: string, feedback: {
    helpful: boolean
    reasons?: string[]
    comments?: string
  }): Promise<void> {
    return apiClient.post<void>(`/matching/feedback/${matchId}`, feedback)
  }

  async reportMatch(matchId: string, reason: string, details?: string): Promise<void> {
    return apiClient.post<void>(`/matching/report/${matchId}`, {
      reason,
      details
    })
  }

  // Saved matches
  async saveMatch(projectId: string, talentId: string): Promise<void> {
    return apiClient.post<void>('/matching/save', {
      projectId,
      talentId
    })
  }

  async unsaveMatch(projectId: string, talentId: string): Promise<void> {
    return apiClient.delete<void>(`/matching/save/${projectId}/${talentId}`)
  }

  async getSavedMatches(): Promise<{
    talentMatches: TalentMatch[]
    projectMatches: ProjectMatch[]
  }> {
    return apiClient.get('/matching/saved')
  }

  // Admin and analytics
  async getMatchingStats(): Promise<{
    totalMatches: number
    averageScore: number
    successfulMatches: number
    topSkillMatches: Array<{
      skill: string
      matchCount: number
      averageScore: number
    }>
    locationDistribution: Array<{
      location: string
      matchCount: number
    }>
    performanceMetrics: {
      averageProcessingTime: number
      cacheHitRate: number
      accuracyScore: number
    }
  }> {
    return apiClient.get('/matching/admin/stats')
  }

  async recalculateMatches(userId?: string): Promise<{
    processed: number
    updated: number
    errors: number
  }> {
    return apiClient.post('/matching/admin/recalculate', { userId })
  }

  // Bulk operations
  async bulkCalculateMatches(projectIds: string[]): Promise<{
    processed: number
    successful: number
    failed: number
    errors: Array<{
      projectId: string
      error: string
    }>
  }> {
    return apiClient.post('/matching/admin/bulk-calculate', { projectIds })
  }
}

export const matchingService = new MatchingService()
