export interface ContractData {
  businessName: string
  businessAddress: string
  talentName: string
  talentAddress?: string
  projectTitle: string
  projectDescription: string
  scopeOfWork: string
  deliverables: string
  totalAmount?: number
  hourlyRate?: number
  estimatedHours?: number
  paymentSchedule: string
  startDate: string
  completionDate?: string
  duration: string
  additionalTerms?: string
  milestones?: any[]
}