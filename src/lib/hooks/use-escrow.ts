import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  EscrowAccount,
  EscrowMilestone,
  EscrowTransaction,
  DisputeCase,
  MilestoneDeliverable,
  createEscrowAccount,
  fundEscrowAccount,
  submitMilestone,
  approveMilestone,
  rejectMilestone,
  initiateDispute,
  resolveDispute,
  cancelEscrowAccount,
  calculateEscrowSummary
} from '@/lib/payments/escrow-manager'
import { apiClient } from '@/lib/api-client'

// Hook for fetching escrow account
export function useEscrowAccount(escrowId: string) {
  return useQuery({
    queryKey: ['escrow', escrowId],
    queryFn: async () => {
      const response = await apiClient.get(`/escrow/${escrowId}`) as any
      return response.data as EscrowAccount
    },
    enabled: !!escrowId
  })
}

// Hook for fetching escrow accounts by contract
export function useContractEscrow(contractId: string) {
  return useQuery({
    queryKey: ['escrow', 'contract', contractId],
    queryFn: async () => {
      const response = await apiClient.get(`/escrow/contract/${contractId}`) as any
      return response.data as EscrowAccount
    },
    enabled: !!contractId
  })
}

// Hook for fetching user's escrow accounts
export function useUserEscrowAccounts(userType: 'business' | 'talent', userId: string) {
  return useQuery({
    queryKey: ['escrow', 'user', userType, userId],
    queryFn: async () => {
      const response = await apiClient.get(`/escrow/user/${userType}/${userId}`) as any
      return response.data as EscrowAccount[]
    },
    enabled: !!userId
  })
}

// Hook for creating escrow account
export function useCreateEscrowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      contractId: string
      businessId: string
      talentId: string
      talentStripeAccountId: string
      milestones: Omit<EscrowMilestone, 'id' | 'escrowId' | 'status' | 'paymentIntentId' | 'deliverables'>[]
    }) => {
      const response = await apiClient.post('/escrow/create', params) as any
      return response.data as EscrowAccount
    },
    onSuccess: (escrowAccount) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['escrow'] })
      queryClient.invalidateQueries({ queryKey: ['contracts', escrowAccount.contractId] })
    }
  })
}

// Hook for funding escrow account
export function useFundEscrowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      escrowId: string
      paymentMethodId: string
    }) => {
      const response = await apiClient.post(`/escrow/${params.escrowId}/fund`, {
        paymentMethodId: params.paymentMethodId
      }) as any
      return response.data as { escrowAccount: EscrowAccount; paymentIntent: any }
    },
    onSuccess: (data) => {
      // Update escrow account in cache
      queryClient.setQueryData(['escrow', data.escrowAccount.id], data.escrowAccount)
      queryClient.invalidateQueries({ queryKey: ['escrow'] })
    }
  })
}

// Hook for submitting milestone
export function useSubmitMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      escrowId: string
      milestoneId: string
      deliverables: Omit<MilestoneDeliverable, 'id' | 'milestoneId' | 'submittedAt' | 'status'>[]
      notes?: string
    }) => {
      const response = await apiClient.post(`/escrow/${params.escrowId}/milestones/${params.milestoneId}/submit`, {
        deliverables: params.deliverables,
        notes: params.notes
      }) as any
      return response.data as EscrowMilestone
    },
    onSuccess: (milestone, variables) => {
      // Invalidate escrow account to refresh milestone data
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.escrowId] })
    }
  })
}

// Hook for approving milestone
export function useApproveMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      escrowId: string
      milestoneId: string
      approvalNotes?: string
    }) => {
      const response = await apiClient.post(`/escrow/${params.escrowId}/milestones/${params.milestoneId}/approve`, {
        approvalNotes: params.approvalNotes
      }) as any
      return response.data as { milestone: EscrowMilestone; transaction: EscrowTransaction }
    },
    onSuccess: (data, variables) => {
      // Invalidate escrow account to refresh milestone and transaction data
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.escrowId] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}

// Hook for rejecting milestone
export function useRejectMilestone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      escrowId: string
      milestoneId: string
      rejectionReason: string
      rejectionNotes?: string
    }) => {
      const response = await apiClient.post(`/escrow/${params.escrowId}/milestones/${params.milestoneId}/reject`, {
        rejectionReason: params.rejectionReason,
        rejectionNotes: params.rejectionNotes
      }) as any
      return response.data as EscrowMilestone
    },
    onSuccess: (milestone, variables) => {
      // Invalidate escrow account to refresh milestone data
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.escrowId] })
    }
  })
}

// Hook for initiating dispute
export function useInitiateDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      escrowId: string
      milestoneId: string
      initiatedBy: 'business' | 'talent'
      reason: string
      description: string
    }) => {
      const response = await apiClient.post(`/escrow/${params.escrowId}/disputes/create`, params) as any
      return response.data as DisputeCase
    },
    onSuccess: (dispute, variables) => {
      // Invalidate escrow account and disputes
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.escrowId] })
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
    }
  })
}

// Hook for resolving dispute (admin only)
export function useResolveDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      disputeId: string
      resolution: 'refund_business' | 'release_talent' | 'partial_split'
      resolutionAmount?: number
      resolutionNotes?: string
      adminNotes?: string
    }) => {
      const response = await apiClient.post(`/disputes/${params.disputeId}/resolve`, params) as any
      return response.data as DisputeCase
    },
    onSuccess: (dispute) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['escrow', dispute.escrowId] })
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
    }
  })
}

// Hook for cancelling escrow account
export function useCancelEscrowAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      escrowId: string
      reason: string
    }) => {
      const response = await apiClient.post(`/escrow/${params.escrowId}/cancel`, {
        reason: params.reason
      }) as any
      return response.data as EscrowAccount
    },
    onSuccess: (escrowAccount) => {
      // Update escrow account in cache
      queryClient.setQueryData(['escrow', escrowAccount.id], escrowAccount)
      queryClient.invalidateQueries({ queryKey: ['escrow'] })
    }
  })
}

// Hook for fetching escrow transactions
export function useEscrowTransactions(escrowId: string) {
  return useQuery({
    queryKey: ['escrow', escrowId, 'transactions'],
    queryFn: async () => {
      const response = await apiClient.get(`/escrow/${escrowId}/transactions`) as any
      return response.data as EscrowTransaction[]
    },
    enabled: !!escrowId
  })
}

// Hook for fetching disputes
export function useDisputes(escrowId?: string) {
  return useQuery({
    queryKey: ['disputes', escrowId],
    queryFn: async () => {
      const url = escrowId ? `/disputes?escrowId=${escrowId}` : '/disputes'
      const response = await apiClient.get(url) as any
      return response.data as DisputeCase[]
    }
  })
}

// Hook for escrow summary calculations
export function useEscrowSummary(escrowAccount?: EscrowAccount) {
  return useState(() => {
    if (!escrowAccount) return null
    return calculateEscrowSummary(escrowAccount)
  })[0]
}

// Hook for milestone progress tracking
export function useMilestoneProgress(milestones: EscrowMilestone[]) {
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    disputed: 0,
    completionPercentage: 0,
    amountReleased: 0,
    totalAmount: 0
  })

  useEffect(() => {
    const total = milestones.length
    const completed = milestones.filter(m => m.status === 'released').length
    const inProgress = milestones.filter(m => m.status === 'in_progress' || m.status === 'submitted').length
    const pending = milestones.filter(m => m.status === 'pending').length
    const disputed = milestones.filter(m => m.status === 'disputed').length
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const amountReleased = milestones
      .filter(m => m.status === 'released')
      .reduce((sum, m) => sum + m.amount, 0)
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)

    setProgress({
      total,
      completed,
      inProgress,
      pending,
      disputed,
      completionPercentage,
      amountReleased,
      totalAmount
    })
  }, [milestones])

  return progress
}

// Hook for escrow status checks
export function useEscrowStatus(escrowAccount?: EscrowAccount) {
  if (!escrowAccount) return null

  const canFund = escrowAccount.status === 'created'
  const canSubmitMilestones = escrowAccount.status === 'funded' || escrowAccount.status === 'partially_released'
  const canCancel = escrowAccount.status !== 'completed' && escrowAccount.status !== 'cancelled'
  const hasDisputes = escrowAccount.milestones.some(m => m.status === 'disputed')
  const isCompleted = escrowAccount.status === 'completed'
  const isCancelled = escrowAccount.status === 'cancelled'

  return {
    canFund,
    canSubmitMilestones,
    canCancel,
    hasDisputes,
    isCompleted,
    isCancelled,
    status: escrowAccount.status
  }
}

// Hook for milestone status checks
export function useMilestoneStatus(milestone: EscrowMilestone) {
  const canSubmit = milestone.status === 'pending' || milestone.status === 'in_progress'
  const canApprove = milestone.status === 'submitted'
  const canReject = milestone.status === 'submitted'
  const canDispute = milestone.status === 'submitted' || milestone.status === 'approved'
  const isCompleted = milestone.status === 'released'
  const isDisputed = milestone.status === 'disputed'
  const needsResubmission = milestone.status === 'in_progress' && milestone.deliverables.some(d => d.status === 'rejected')

  return {
    canSubmit,
    canApprove,
    canReject,
    canDispute,
    isCompleted,
    isDisputed,
    needsResubmission,
    status: milestone.status
  }
}
