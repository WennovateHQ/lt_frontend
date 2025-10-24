export interface Application {
  id: string
  projectId: string
  talentId: string
  talent?: any  // Populated relation
  project?: any  // Populated relation
  status: ApplicationStatus
  proposedRate?: number        // For hourly projects
  proposedBudget?: number      // For fixed projects
  rateType: 'hourly' | 'fixed'
  estimatedHours?: number
  coverLetter: string
  proposedApproach: string
  timeline: string
  startDate: Date
  availability: string
  selectedPortfolio: string[]
  questions: string
  attachments: ApplicationAttachment[] | string[]
  additionalNotes?: string
  appliedAt?: Date
  createdAt?: string
  lastActivity: Date
  viewedByClient: boolean
  clientResponse?: string
  interviewDate?: Date
  contractStartDate?: Date
  rejectionReason?: string
  messages: number
}

export type ApplicationStatus = 
  | 'draft'
  | 'pending'
  | 'submitted' 
  | 'under_review'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'expired'

export interface ApplicationAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: Date
  url: string
}

export interface ApplicationStatusUpdate {
  id: string
  applicationId: string
  previousStatus: ApplicationStatus
  newStatus: ApplicationStatus
  updatedBy: 'talent' | 'business' | 'system'
  updatedAt: Date
  notes?: string
  metadata?: Record<string, any>
}

export interface ApplicationFilters {
  status?: ApplicationStatus[]
  projectId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  rateRange?: {
    min: number
    max: number
  }
  workArrangement?: string[]
  location?: string
  skills?: string[]
}

export interface ApplicationMetrics {
  totalApplications: number
  responseRate: number
  averageResponseTime: number
  statusBreakdown: Record<ApplicationStatus, number>
  successRate: number
  averageProposedRate: number
}

// Status transition rules
export const APPLICATION_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ['submitted', 'withdrawn'],
  pending: ['under_review', 'withdrawn', 'expired'],
  submitted: ['under_review', 'withdrawn', 'expired'],
  under_review: ['shortlisted', 'rejected'],
  shortlisted: ['accepted', 'rejected'],
  accepted: [], // Terminal state
  rejected: [], // Terminal state
  withdrawn: [], // Terminal state
  expired: ['submitted'] // Can resubmit
}

// Status display configuration
export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, {
  label: string
  color: string
  bgColor: string
  description: string
  canEdit: boolean
  showToTalent: boolean
  showToBusiness: boolean
}> = {
  draft: {
    label: 'Draft',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Application is being prepared',
    canEdit: true,
    showToTalent: true,
    showToBusiness: false
  },
  pending: {
    label: 'Pending',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Application is pending review',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  submitted: {
    label: 'Submitted',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Application has been submitted and is pending review',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  under_review: {
    label: 'Under Review',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Client is reviewing your application',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  shortlisted: {
    label: 'Shortlisted',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'You have been shortlisted for this project',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Congratulations! Your application has been accepted',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  rejected: {
    label: 'Not Selected',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Application was not selected for this project',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Application was withdrawn by talent',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  },
  expired: {
    label: 'Expired',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Application expired due to inactivity',
    canEdit: false,
    showToTalent: true,
    showToBusiness: true
  }
}

// Helper functions
export const canTransitionTo = (currentStatus: ApplicationStatus, newStatus: ApplicationStatus): boolean => {
  return APPLICATION_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false
}

export const getStatusConfig = (status: ApplicationStatus | string) => {
  // Handle backend status mapping
  const statusMap: Record<string, ApplicationStatus> = {
    'PENDING': 'submitted',
    'UNDER_REVIEW': 'under_review',
    'ACCEPTED': 'accepted',
    'REJECTED': 'rejected',
    'WITHDRAWN': 'withdrawn'
  }
  
  const mappedStatus = statusMap[status as string] || status as ApplicationStatus
  return APPLICATION_STATUS_CONFIG[mappedStatus] || APPLICATION_STATUS_CONFIG['submitted']
}

export const isTerminalStatus = (status: ApplicationStatus): boolean => {
  return APPLICATION_STATUS_TRANSITIONS[status].length === 0
}

export const getAvailableTransitions = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
  return APPLICATION_STATUS_TRANSITIONS[currentStatus] || []
}

export const formatApplicationStatus = (status: ApplicationStatus): string => {
  return APPLICATION_STATUS_CONFIG[status]?.label || status
}

export const getStatusColor = (status: ApplicationStatus): { text: string; bg: string } => {
  const config = APPLICATION_STATUS_CONFIG[status]
  return {
    text: config?.color || 'text-gray-600',
    bg: config?.bgColor || 'bg-gray-100'
  }
}
