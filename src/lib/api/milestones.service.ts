import { apiClient } from './client'

export interface Deliverable {
  id: string
  title: string
  description: string
  fileUrl?: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  createdAt: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

export interface CreateDeliverableRequest {
  title: string
  description: string
  fileUrl?: string
}

export interface ReviewDeliverableRequest {
  action: 'approve' | 'reject'
  rejectionReason?: string
}

export interface MilestoneProgress {
  id: string
  title: string
  description: string
  amount: number
  percentage: number
  dueDate: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  deliverables: Deliverable[]
  completionPercentage: number
}

export interface MilestoneTimeline {
  milestones: MilestoneProgress[]
  totalMilestones: number
  completedMilestones: number
  overallProgress: number
}

class MilestonesService {
  // Deliverable Management
  async getDeliverables(milestoneId: string): Promise<{ deliverables: Deliverable[] }> {
    return apiClient.get<{ deliverables: Deliverable[] }>(`/milestones/${milestoneId}/deliverables`)
  }

  async createDeliverable(milestoneId: string, data: CreateDeliverableRequest): Promise<Deliverable> {
    return apiClient.post<Deliverable>(`/milestones/${milestoneId}/deliverables`, data)
  }

  async updateDeliverable(deliverableId: string, data: Partial<CreateDeliverableRequest>): Promise<Deliverable> {
    return apiClient.put<Deliverable>(`/deliverables/${deliverableId}`, data)
  }

  async deleteDeliverable(deliverableId: string): Promise<void> {
    return apiClient.delete(`/deliverables/${deliverableId}`)
  }

  async submitDeliverable(deliverableId: string): Promise<Deliverable> {
    return apiClient.put<Deliverable>(`/deliverables/${deliverableId}/submit`)
  }

  async reviewDeliverable(deliverableId: string, data: ReviewDeliverableRequest): Promise<Deliverable> {
    return apiClient.put<Deliverable>(`/deliverables/${deliverableId}/review`, data)
  }

  // Milestone Progress Tracking
  async getMilestoneProgress(contractId: string): Promise<MilestoneTimeline> {
    return apiClient.get<MilestoneTimeline>(`/contracts/${contractId}/milestones/progress`)
  }

  async getMilestoneDetail(milestoneId: string): Promise<MilestoneProgress> {
    return apiClient.get<MilestoneProgress>(`/milestones/${milestoneId}/detail`)
  }

  async updateMilestoneProgress(milestoneId: string, completionPercentage: number): Promise<MilestoneProgress> {
    return apiClient.put<MilestoneProgress>(`/milestones/${milestoneId}/progress`, {
      completionPercentage
    })
  }

  // File Upload for Deliverables
  async uploadDeliverableFile(file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number }> {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<{ fileUrl: string; fileName: string; fileSize: number }>(
      '/upload/deliverable', 
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
  }

  // Milestone Notifications
  async getMilestoneNotifications(contractId: string): Promise<Array<{
    id: string
    milestoneId: string
    type: 'milestone_due' | 'deliverable_submitted' | 'milestone_approved' | 'milestone_rejected'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    createdAt: string
    read: boolean
  }>> {
    return apiClient.get(`/contracts/${contractId}/milestones/notifications`)
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return apiClient.put(`/notifications/${notificationId}/read`)
  }
}

export const milestonesService = new MilestonesService()
export default milestonesService
