import { apiClient } from './client'

export interface Notification {
  id: string
  userId: string
  type: 'message' | 'application' | 'project' | 'payment' | 'system'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  emailSent: boolean
  createdAt: string
  readAt?: string
}

export interface NotificationPreferences {
  id: string
  userId: string
  email: {
    newMessages: boolean
    applicationUpdates: boolean
    projectUpdates: boolean
    paymentNotifications: boolean
    systemNotifications: boolean
    marketingEmails: boolean
  }
  push: {
    newMessages: boolean
    applicationUpdates: boolean
    projectUpdates: boolean
    paymentNotifications: boolean
  }
  frequency: {
    immediate: boolean
    daily: boolean
    weekly: boolean
    never: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface EmailTemplate {
  id: string
  name: string
  type: 'message' | 'application' | 'project' | 'payment' | 'system'
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationRequest {
  userId: string
  type: Notification['type']
  title: string
  message: string
  data?: Record<string, any>
  sendEmail?: boolean
}

export interface NotificationSearchParams {
  type?: Notification['type']
  read?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'readAt'
  sortOrder?: 'asc' | 'desc'
}

export interface NotificationSearchResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
  page: number
  limit: number
  totalPages: number
}

export class NotificationsService {
  // User notifications
  async getNotifications(params?: NotificationSearchParams): Promise<NotificationSearchResponse> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiClient.get<NotificationSearchResponse>(`/notifications?${searchParams.toString()}`)
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/notifications/unread-count')
  }

  async markAsRead(notificationIds: string[]): Promise<void> {
    return apiClient.post<void>('/notifications/mark-read', { notificationIds })
  }

  async markAllAsRead(): Promise<void> {
    return apiClient.post<void>('/notifications/mark-all-read')
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${notificationId}`)
  }

  async deleteAllRead(): Promise<void> {
    return apiClient.delete<void>('/notifications/read')
  }

  // Notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    return apiClient.get<NotificationPreferences>('/notifications/preferences')
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return apiClient.put<NotificationPreferences>('/notifications/preferences', preferences)
  }

  // Email subscriptions
  async unsubscribeFromEmails(token: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/notifications/unsubscribe', { token })
  }

  async resubscribeToEmails(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/notifications/resubscribe')
  }

  // Admin methods
  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    return apiClient.post<Notification>('/notifications/admin', data)
  }

  async sendBulkNotification(data: {
    userIds: string[]
    type: Notification['type']
    title: string
    message: string
    data?: Record<string, any>
    sendEmail?: boolean
  }): Promise<{ sent: number; failed: number }> {
    return apiClient.post<{ sent: number; failed: number }>('/notifications/admin/bulk', data)
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return apiClient.get<EmailTemplate[]>('/notifications/admin/templates')
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    return apiClient.post<EmailTemplate>('/notifications/admin/templates', template)
  }

  async updateEmailTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return apiClient.put<EmailTemplate>(`/notifications/admin/templates/${templateId}`, template)
  }

  async deleteEmailTemplate(templateId: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/admin/templates/${templateId}`)
  }

  async testEmailTemplate(templateId: string, testData: Record<string, any>): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/notifications/admin/templates/${templateId}/test`, testData)
  }

  // Analytics
  async getNotificationStats(): Promise<{
    totalSent: number
    totalRead: number
    readRate: number
    emailsSent: number
    emailOpenRate: number
    typeBreakdown: Array<{
      type: string
      count: number
      readRate: number
    }>
    recentActivity: Array<{
      date: string
      sent: number
      read: number
    }>
  }> {
    return apiClient.get('/notifications/admin/stats')
  }
}

export const notificationsService = new NotificationsService()
