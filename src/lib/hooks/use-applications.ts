import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { 
  Application, 
  ApplicationStatus, 
  ApplicationFilters, 
  ApplicationStatusUpdate,
  ApplicationMetrics,
  canTransitionTo 
} from '@/lib/types/application'

// Hook for fetching applications (talent side)
export function useApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.status?.length) {
        params.append('status', filters.status.join(','))
      }
      if (filters?.projectId) {
        params.append('projectId', filters.projectId)
      }
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString())
        params.append('endDate', filters.dateRange.end.toISOString())
      }
      
      const response = await apiClient.get<Application[]>(`/talent/applications?${params}`)
      return response
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for fetching single application
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: ['applications', applicationId],
    queryFn: () => apiClient.get<Application>(`/applications/${applicationId}`),
    enabled: !!applicationId,
  })
}

// Hook for submitting new application
export function useSubmitApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (applicationData: Omit<Application, 'id' | 'appliedAt' | 'lastActivity'>) => {
      const response = await apiClient.post<Application>('/applications', applicationData)
      return response
    },
    onSuccess: (newApplication) => {
      // Update applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      
      // Add to cache
      queryClient.setQueryData(['applications', newApplication.id], newApplication)
      
      // Update project applications count
      queryClient.invalidateQueries({ queryKey: ['projects', newApplication.projectId] })
    },
  })
}

// Hook for updating application status
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      newStatus, 
      notes,
      metadata 
    }: {
      applicationId: string
      newStatus: ApplicationStatus
      notes?: string
      metadata?: Record<string, any>
    }) => {
      const response = await apiClient.put<Application>(`/applications/${applicationId}/status`, {
        status: newStatus,
        notes,
        metadata
      })
      return response
    },
    onSuccess: (updatedApplication) => {
      // Update application in cache
      queryClient.setQueryData(['applications', updatedApplication.id], updatedApplication)
      
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      
      // Invalidate project applications if business is viewing
      queryClient.invalidateQueries({ 
        queryKey: ['projects', updatedApplication.projectId, 'applications'] 
      })
    },
  })
}

// Hook for withdrawing application
export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason?: string }) => {
      const response = await apiClient.patch<Application>(`/applications/${applicationId}/withdraw`, {
        reason
      })
      return response
    },
    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(['applications', updatedApplication.id], updatedApplication)
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

// Hook for business to fetch project applications
export function useProjectApplications(projectId: string, filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['projects', projectId, 'applications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.status?.length) {
        params.append('status', filters.status.join(','))
      }
      
      const response = await apiClient.get<Application[]>(`/projects/${projectId}/applications?${params}`)
      return response
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  })
}

// Hook for application metrics
export function useApplicationMetrics(timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  return useQuery({
    queryKey: ['application-metrics', timeframe],
    queryFn: () => apiClient.get<ApplicationMetrics>(`/talent/applications/metrics?timeframe=${timeframe}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for application status history
export function useApplicationStatusHistory(applicationId: string) {
  return useQuery({
    queryKey: ['applications', applicationId, 'status-history'],
    queryFn: () => apiClient.get<ApplicationStatusUpdate[]>(`/applications/${applicationId}/status-history`),
    enabled: !!applicationId,
  })
}

// Custom hook for application state management
export function useApplicationState(application: Application) {
  const [localStatus, setLocalStatus] = useState<ApplicationStatus>(application.status)
  const updateStatusMutation = useUpdateApplicationStatus()
  const withdrawMutation = useWithdrawApplication()

  const canUpdateStatus = (newStatus: ApplicationStatus): boolean => {
    return canTransitionTo(localStatus, newStatus)
  }

  const updateStatus = async (newStatus: ApplicationStatus, notes?: string, metadata?: Record<string, any>) => {
    if (!canUpdateStatus(newStatus)) {
      throw new Error(`Cannot transition from ${localStatus} to ${newStatus}`)
    }

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: application.id,
        newStatus,
        notes,
        metadata
      })
      setLocalStatus(newStatus)
    } catch (error) {
      console.error('Failed to update application status:', error)
      throw error
    }
  }

  const withdraw = async (reason?: string) => {
    try {
      await withdrawMutation.mutateAsync({
        applicationId: application.id,
        reason
      })
      setLocalStatus('withdrawn')
    } catch (error) {
      console.error('Failed to withdraw application:', error)
      throw error
    }
  }

  // Sync local status with prop changes
  useEffect(() => {
    setLocalStatus(application.status)
  }, [application.status])

  return {
    status: localStatus,
    canUpdateStatus,
    updateStatus,
    withdraw,
    isUpdating: updateStatusMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    error: updateStatusMutation.error || withdrawMutation.error
  }
}

// Hook for real-time application updates
export function useApplicationUpdates(applicationId: string) {
  const queryClient = useQueryClient()
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // In a real implementation, this would use WebSocket or Server-Sent Events
    // For now, we'll use polling
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['applications', applicationId] })
      setLastUpdate(new Date())
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [applicationId, queryClient])

  return { lastUpdate }
}

// Hook for business to fetch all applications for their projects
export function useBusinessApplications(filters?: ApplicationFilters) {
  return useQuery({
    queryKey: ['business', 'applications', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.status?.length) {
        params.append('status', filters.status.join(','))
      }
      
      const response = await apiClient.get<Application[]>(`/applications/business?${params}`)
      return response
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for application analytics
export function useApplicationAnalytics(applicationId: string) {
  return useQuery({
    queryKey: ['applications', applicationId, 'analytics'],
    queryFn: () => apiClient.get(`/applications/${applicationId}/analytics`),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
