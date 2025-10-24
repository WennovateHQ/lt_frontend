import { apiClient } from './client'

export interface Skill {
  id: string
  name: string
  category: string
  subcategory?: string
  description?: string
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface SkillCategory {
  id: string
  name: string
  description?: string
  subcategories: Array<{
    id: string
    name: string
    description?: string
    skillsCount: number
  }>
  skillsCount: number
  isActive: boolean
}

export interface CreateSkillRequest {
  name: string
  category: string
  subcategory?: string
  description?: string
}

export interface SkillSearchParams {
  query?: string
  category?: string
  subcategory?: string
  isActive?: boolean
  popular?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'usageCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface SkillSearchResponse {
  skills: Skill[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SkillSuggestion {
  skill: string
  category: string
  confidence: number
  relatedSkills: string[]
}

export class SkillsService {
  // Public methods
  async searchSkills(params?: SkillSearchParams): Promise<SkillSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            searchParams.append(key, value.toString())
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }

    return apiClient.get<SkillSearchResponse>(`/skills/search?${searchParams.toString()}`)
  }

  async getSkill(skillId: string): Promise<Skill> {
    return apiClient.get<Skill>(`/skills/${skillId}`)
  }

  async getSkillByName(name: string): Promise<Skill> {
    return apiClient.get<Skill>(`/skills/by-name/${encodeURIComponent(name)}`)
  }

  async getPopularSkills(limit: number = 20): Promise<Skill[]> {
    return apiClient.get<Skill[]>(`/skills/popular?limit=${limit}`)
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return apiClient.get<Skill[]>(`/skills/category/${encodeURIComponent(category)}`)
  }

  async getCategories(): Promise<SkillCategory[]> {
    return apiClient.get<SkillCategory[]>('/skills/categories')
  }

  async getCategory(categoryId: string): Promise<SkillCategory> {
    return apiClient.get<SkillCategory>(`/skills/categories/${categoryId}`)
  }

  // Skill suggestions and validation
  async validateSkills(skills: string[]): Promise<Array<{
    skill: string
    isValid: boolean
    suggestion?: string
    category?: string
  }>> {
    return apiClient.post<Array<{
      skill: string
      isValid: boolean
      suggestion?: string
      category?: string
    }>>('/skills/validate', { skills })
  }

  async getSuggestions(query: string, limit: number = 10): Promise<SkillSuggestion[]> {
    return apiClient.get<SkillSuggestion[]>(`/skills/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`)
  }

  async getRelatedSkills(skillName: string, limit: number = 10): Promise<Skill[]> {
    return apiClient.get<Skill[]>(`/skills/related/${encodeURIComponent(skillName)}?limit=${limit}`)
  }

  // Auto-complete
  async autocomplete(query: string, limit: number = 10): Promise<string[]> {
    return apiClient.get<string[]>(`/skills/autocomplete?query=${encodeURIComponent(query)}&limit=${limit}`)
  }

  // Admin methods (require admin authentication)
  async createSkill(data: CreateSkillRequest): Promise<Skill> {
    return apiClient.post<Skill>('/skills/admin', data)
  }

  async updateSkill(skillId: string, data: Partial<CreateSkillRequest>): Promise<Skill> {
    return apiClient.put<Skill>(`/skills/admin/${skillId}`, data)
  }

  async deleteSkill(skillId: string): Promise<void> {
    return apiClient.delete<void>(`/skills/admin/${skillId}`)
  }

  async activateSkill(skillId: string): Promise<Skill> {
    return apiClient.post<Skill>(`/skills/admin/${skillId}/activate`)
  }

  async deactivateSkill(skillId: string): Promise<Skill> {
    return apiClient.post<Skill>(`/skills/admin/${skillId}/deactivate`)
  }

  async mergeSkills(primarySkillId: string, skillIdsToMerge: string[]): Promise<Skill> {
    return apiClient.post<Skill>(`/skills/admin/${primarySkillId}/merge`, {
      skillIdsToMerge
    })
  }

  // Bulk operations
  async bulkCreateSkills(skills: CreateSkillRequest[]): Promise<Skill[]> {
    return apiClient.post<Skill[]>('/skills/admin/bulk', { skills })
  }

  async importSkillsFromText(text: string): Promise<{
    imported: Skill[]
    skipped: Array<{
      skill: string
      reason: string
    }>
  }> {
    return apiClient.post<{
      imported: Skill[]
      skipped: Array<{
        skill: string
        reason: string
      }>
    }>('/skills/admin/import', { text })
  }

  // Analytics
  async getSkillStats(): Promise<{
    totalSkills: number
    activeSkills: number
    totalCategories: number
    mostUsedSkills: Array<{
      skill: string
      usageCount: number
    }>
    recentlyAdded: Skill[]
  }> {
    return apiClient.get('/skills/admin/stats')
  }
}

export const skillsService = new SkillsService()
