import { apiClient } from './client'

export interface TimeEntry {
  id: string
  contractId: string
  milestoneId: string | null
  date: string
  hours: string | number // Backend returns string, convert to number for calculations
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  rejectionReason?: string | null
  approvedAt?: string | null
  rejectedAt?: string | null
  createdAt: string
  updatedAt: string
  milestone?: {
    id: string
    title: string
  } | null
  // Frontend-only computed fields
  startTime?: string
  endTime?: string
  category?: 'development' | 'design' | 'testing' | 'meeting' | 'research' | 'documentation' | 'other'
  hourlyRate?: number
  amount?: number
}

export interface CreateTimeEntryRequest {
  date: string
  startTime?: string
  endTime?: string
  hours?: number
  hoursWorked?: number // Backend accepts both
  description: string
  category?: string
  milestoneId?: string
}

export interface TimesheetSummary {
  totalHours: number
  approvedHours: number
  pendingHours: number
  rejectedHours: number
  totalEntries: number
  hourlyRate: number
  totalEarnings: number
  approvedEarnings: number
  pendingEarnings: number
}

export interface PaymentPeriod {
  startDate: string
  endDate: string
  totalHours: number
  totalAmount: number
  platformFee: number
  taxAmount: number
  netAmount: number
  timeEntries: TimeEntry[]
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED'
}

export interface BiweeklyPaymentRequest {
  periodStart: string
  periodEnd: string
  totalHours: number
  totalAmount: number
  platformFee: number
  taxAmount: number
  netAmount: number
  timeEntryIds: string[]
  notes?: string
}

export interface TimeTrackingFilters {
  period?: 'current' | 'previous' | 'all'
  status?: 'all' | 'pending' | 'approved' | 'rejected'
  startDate?: string
  endDate?: string
}

class TimeTrackingService {
  // Time Entry Management
  async getTimeEntries(contractId: string, filters?: TimeTrackingFilters): Promise<{
    timeEntries: TimeEntry[]
    summary: TimesheetSummary
  }> {
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    return apiClient.get<{
      timeEntries: TimeEntry[]
      summary: TimesheetSummary
    }>(`/contracts/${contractId}/time-entries?${params}`)
  }

  async createTimeEntry(contractId: string, data: CreateTimeEntryRequest): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>(`/contracts/${contractId}/time-entries`, data)
  }

  async updateTimeEntry(timeEntryId: string, data: Partial<CreateTimeEntryRequest>): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/time-entries/${timeEntryId}`, data)
  }

  async deleteTimeEntry(timeEntryId: string): Promise<void> {
    return apiClient.delete(`/time-entries/${timeEntryId}`)
  }

  // Time Entry Approval (Business Users)
  async approveTimeEntry(timeEntryId: string, feedback?: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/time-entries/${timeEntryId}/approve`, { feedback })
  }

  async rejectTimeEntry(timeEntryId: string, reason: string): Promise<TimeEntry> {
    return apiClient.put<TimeEntry>(`/time-entries/${timeEntryId}/reject`, { reason })
  }

  async bulkApproveTimeEntries(timeEntryIds: string[]): Promise<{ approved: number; failed: number }> {
    return apiClient.post<{ approved: number; failed: number }>('/time-entries/bulk-approve', {
      timeEntryIds
    })
  }

  // Payment Period Management
  async getCurrentPaymentPeriod(contractId: string): Promise<{ paymentPeriod: PaymentPeriod }> {
    return apiClient.get<{ paymentPeriod: PaymentPeriod }>(`/contracts/${contractId}/payment-period/current`)
  }

  async getPaymentPeriods(contractId: string): Promise<{ paymentPeriods: PaymentPeriod[] }> {
    return apiClient.get<{ paymentPeriods: PaymentPeriod[] }>(`/contracts/${contractId}/payment-periods`)
  }

  async processBiweeklyPayment(contractId: string, data: BiweeklyPaymentRequest): Promise<{
    paymentId: string
    status: string
    netAmount: number
  }> {
    return apiClient.post<{
      paymentId: string
      status: string
      netAmount: number
    }>(`/contracts/${contractId}/payments/biweekly`, data)
  }

  // Timesheet Export
  async exportTimesheet(contractId: string, options: {
    period?: 'current' | 'previous' | 'all'
    format: 'pdf' | 'csv' | 'excel'
    startDate?: string
    endDate?: string
  }): Promise<Blob> {
    const params = new URLSearchParams()
    if (options.period) params.append('period', options.period)
    params.append('format', options.format)
    if (options.startDate) params.append('startDate', options.startDate)
    if (options.endDate) params.append('endDate', options.endDate)

    return apiClient.get(`/contracts/${contractId}/timesheet/export?${params}`, {
      responseType: 'blob'
    })
  }

  // Time Tracking Analytics
  async getTimeTrackingAnalytics(contractId: string, period: 'week' | 'month' | 'quarter'): Promise<{
    totalHours: number
    averageHoursPerDay: number
    mostProductiveDay: string
    categoryBreakdown: Array<{
      category: string
      hours: number
      percentage: number
    }>
    weeklyTrends: Array<{
      week: string
      hours: number
      earnings: number
    }>
  }> {
    return apiClient.get(`/contracts/${contractId}/time-tracking/analytics?period=${period}`)
  }

  // Time Entry Templates
  async getTimeEntryTemplates(): Promise<Array<{
    id: string
    name: string
    category: TimeEntry['category']
    description: string
    estimatedHours: number
  }>> {
    return apiClient.get('/time-entries/templates')
  }

  async createTimeEntryFromTemplate(contractId: string, templateId: string, data: {
    date: string
    startTime: string
    actualHours: number
  }): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>(`/contracts/${contractId}/time-entries/from-template`, {
      templateId,
      ...data
    })
  }

  // Time Tracking Settings
  async getTimeTrackingSettings(contractId: string): Promise<{
    hourlyRate: number
    autoSubmitEntries: boolean
    requireApproval: boolean
    allowWeekendEntries: boolean
    maxHoursPerDay: number
    reminderEnabled: boolean
  }> {
    return apiClient.get(`/contracts/${contractId}/time-tracking/settings`)
  }

  async updateTimeTrackingSettings(contractId: string, settings: {
    autoSubmitEntries?: boolean
    requireApproval?: boolean
    allowWeekendEntries?: boolean
    maxHoursPerDay?: number
    reminderEnabled?: boolean
  }): Promise<void> {
    return apiClient.put(`/contracts/${contractId}/time-tracking/settings`, settings)
  }
}

export const timeTrackingService = new TimeTrackingService()
export default timeTrackingService
