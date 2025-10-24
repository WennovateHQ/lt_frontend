import { apiClient } from './client'

export interface Review {
  id: string
  type: 'project' | 'talent' | 'business'
  
  // Related entities
  projectId?: string
  contractId?: string
  reviewerId: string
  revieweeId: string
  
  // Review content
  rating: number // 1-5 scale
  title: string
  content: string
  
  // Detailed ratings
  ratings: {
    communication: number
    quality: number
    timeliness: number
    professionalism: number
    value: number
  }
  
  // Review metadata
  status: 'draft' | 'published' | 'flagged' | 'hidden'
  isAnonymous: boolean
  isVerified: boolean
  
  // Responses and interactions
  response?: {
    content: string
    respondedAt: string
    respondedBy: string
  }
  
  helpfulVotes: number
  reportCount: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
  
  // Populated fields
  reviewer?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
    userType: 'business' | 'talent'
    isVerified: boolean
  }
  
  reviewee?: {
    id: string
    firstName: string
    lastName: string
    companyName?: string
    avatar?: string
    userType: 'business' | 'talent'
    isVerified: boolean
  }
  
  project?: {
    id: string
    title: string
    category: string
  }
}

export interface CreateReviewRequest {
  type: Review['type']
  projectId?: string
  contractId?: string
  revieweeId: string
  rating: number
  title: string
  content: string
  ratings: Review['ratings']
  isAnonymous?: boolean
}

export interface UpdateReviewRequest {
  rating?: number
  title?: string
  content?: string
  ratings?: Review['ratings']
  isAnonymous?: boolean
}

export interface ReviewResponse {
  content: string
}

export interface ReviewSearchParams {
  page?: number
  limit?: number
  type?: Review['type']
  reviewerId?: string
  revieweeId?: string
  projectId?: string
  rating?: number
  minRating?: number
  maxRating?: number
  status?: Review['status']
  isVerified?: boolean
  sortBy?: 'createdAt' | 'rating' | 'helpfulVotes'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface ReviewSearchResponse {
  reviews: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
  averageRating: number
  ratingDistribution: Record<string, number>
}

export interface UserRatingsSummary {
  userId: string
  userType: 'business' | 'talent'
  
  overall: {
    averageRating: number
    totalReviews: number
    recommendationRate: number
  }
  
  breakdown: {
    communication: number
    quality: number
    timeliness: number
    professionalism: number
    value: number
  }
  
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  
  trends: {
    last30Days: {
      averageRating: number
      totalReviews: number
    }
    last90Days: {
      averageRating: number
      totalReviews: number
    }
    trend: 'improving' | 'stable' | 'declining'
  }
  
  highlights: {
    strengths: string[]
    improvements: string[]
    commonPhrases: Array<{
      phrase: string
      count: number
      sentiment: 'positive' | 'neutral' | 'negative'
    }>
  }
}

export interface ReviewStats {
  overview: {
    totalReviews: number
    averageRating: number
    verifiedReviews: number
    responseRate: number
  }
  
  byType: Record<Review['type'], {
    count: number
    averageRating: number
  }>
  
  byRating: Record<string, number>
  
  trends: {
    reviewsThisMonth: number
    reviewsLastMonth: number
    averageRatingThisMonth: number
    averageRatingLastMonth: number
  }
  
  topReviewers: Array<{
    userId: string
    userName: string
    reviewCount: number
    averageRating: number
    helpfulVotes: number
  }>
  
  flaggedReviews: {
    total: number
    pending: number
    resolved: number
  }
}

export interface PendingReview {
  id: string
  type: Review['type']
  projectId?: string
  contractId?: string
  revieweeId: string
  revieweeName: string
  projectTitle?: string
  dueDate?: string
  remindersSent: number
  canReview: boolean
  reason?: string
}

export class ReviewsService {
  async getUserReviews(userId: string, params?: ReviewSearchParams): Promise<ReviewSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ReviewSearchResponse>(`/reviews/user/${userId}?${searchParams.toString()}`)
  }

  async getUserRatingsSummary(userId: string): Promise<UserRatingsSummary> {
    return apiClient.get<UserRatingsSummary>(`/reviews/user/${userId}/summary`)
  }

  async getReview(reviewId: string): Promise<Review> {
    return apiClient.get<Review>(`/reviews/${reviewId}`)
  }

  async createReview(data: CreateReviewRequest): Promise<Review> {
    return apiClient.post<Review>('/reviews', data)
  }

  async getMyReviews(params?: ReviewSearchParams): Promise<ReviewSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ReviewSearchResponse>(`/reviews/my/reviews?${searchParams.toString()}`)
  }

  async getPendingReviews(): Promise<PendingReview[]> {
    return apiClient.get<PendingReview[]>('/reviews/my/pending')
  }

  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review> {
    return apiClient.put<Review>(`/reviews/${reviewId}`, data)
  }

  async deleteReview(reviewId: string): Promise<void> {
    return apiClient.delete<void>(`/reviews/${reviewId}`)
  }

  async respondToReview(reviewId: string, data: ReviewResponse): Promise<Review> {
    return apiClient.post<Review>(`/reviews/${reviewId}/respond`, data)
  }

  async flagReview(reviewId: string, reason: string): Promise<void> {
    return apiClient.post<void>(`/reviews/${reviewId}/flag`, { reason })
  }

  async markHelpful(reviewId: string): Promise<Review> {
    return apiClient.post<Review>(`/reviews/${reviewId}/helpful`)
  }

  async removeHelpful(reviewId: string): Promise<Review> {
    return apiClient.delete<Review>(`/reviews/${reviewId}/helpful`)
  }

  // Business-specific methods
  async getBusinessReviews(businessId: string, params?: ReviewSearchParams): Promise<ReviewSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ReviewSearchResponse>(`/reviews/business/${businessId}?${searchParams.toString()}`)
  }

  async getBusinessRatingsSummary(businessId: string): Promise<UserRatingsSummary> {
    return apiClient.get<UserRatingsSummary>(`/reviews/business/${businessId}/summary`)
  }

  // Talent-specific methods
  async getTalentReviews(talentId: string, params?: ReviewSearchParams): Promise<ReviewSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ReviewSearchResponse>(`/reviews/talent/${talentId}?${searchParams.toString()}`)
  }

  async getTalentRatingsSummary(talentId: string): Promise<UserRatingsSummary> {
    return apiClient.get<UserRatingsSummary>(`/reviews/talent/${talentId}/summary`)
  }

  // Project-specific methods
  async getProjectReviews(projectId: string, params?: ReviewSearchParams): Promise<ReviewSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ReviewSearchResponse>(`/reviews/project/${projectId}?${searchParams.toString()}`)
  }

  // Review eligibility and validation
  async canReviewUser(userId: string, projectId?: string): Promise<{
    canReview: boolean
    reason?: string
    existingReviewId?: string
  }> {
    const params = projectId ? `?projectId=${projectId}` : ''
    return apiClient.get<any>(`/reviews/can-review/${userId}${params}`)
  }

  async canReviewProject(projectId: string): Promise<{
    canReview: boolean
    reason?: string
    existingReviewId?: string
  }> {
    return apiClient.get<any>(`/reviews/can-review-project/${projectId}`)
  }

  // Review templates and suggestions
  async getReviewTemplates(type: Review['type']): Promise<Array<{
    id: string
    title: string
    content: string
    category: string
    rating: number
  }>> {
    return apiClient.get<Array<any>>(`/reviews/templates?type=${type}`)
  }

  async getReviewSuggestions(revieweeId: string, projectId?: string): Promise<{
    suggestedRating: number
    suggestedContent: string
    keyPoints: string[]
    similarReviews: Array<{
      content: string
      rating: number
    }>
  }> {
    const params = projectId ? `?projectId=${projectId}` : ''
    return apiClient.get<any>(`/reviews/suggestions/${revieweeId}${params}`)
  }

  // Analytics and insights
  async getReviewStats(): Promise<ReviewStats> {
    return apiClient.get<ReviewStats>('/reviews/stats')
  }

  async getReviewInsights(userId: string): Promise<{
    performanceScore: number
    strengths: string[]
    improvements: string[]
    trends: {
      ratingTrend: 'up' | 'down' | 'stable'
      volumeTrend: 'up' | 'down' | 'stable'
    }
    benchmarks: {
      industryAverage: number
      topPerformers: number
      yourRating: number
    }
    recommendations: string[]
  }> {
    return apiClient.get<any>(`/reviews/insights/${userId}`)
  }

  // Review moderation (admin functions)
  async getFlaggedReviews(params?: ReviewSearchParams): Promise<ReviewSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<ReviewSearchResponse>(`/reviews/admin/flagged?${searchParams.toString()}`)
  }

  async moderateReview(reviewId: string, action: 'approve' | 'hide' | 'delete', reason?: string): Promise<Review> {
    return apiClient.post<Review>(`/reviews/admin/${reviewId}/moderate`, { action, reason })
  }

  // Bulk operations
  async bulkUpdateReviews(reviewIds: string[], updates: Partial<Review>): Promise<{ updated: number; errors: string[] }> {
    return apiClient.post<any>('/reviews/bulk/update', { reviewIds, updates })
  }

  async exportReviews(params?: ReviewSearchParams & { format: 'csv' | 'excel' | 'json' }): Promise<{ downloadUrl: string }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<{ downloadUrl: string }>(`/reviews/export?${searchParams.toString()}`)
  }
}

export const reviewsService = new ReviewsService()
