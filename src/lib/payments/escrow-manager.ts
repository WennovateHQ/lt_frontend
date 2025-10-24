import { 
  createPaymentIntent, 
  capturePayment, 
  cancelPayment, 
  calculatePlatformFee, 
  calculateStripeFee,
  PaymentIntent 
} from './stripe-connect'

export interface EscrowAccount {
  id: string
  contractId: string
  businessId: string
  talentId: string
  talentStripeAccountId: string
  totalAmount: number
  currency: string
  status: 'created' | 'funded' | 'partially_released' | 'completed' | 'disputed' | 'cancelled'
  milestones: EscrowMilestone[]
  paymentIntentId?: string
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
}

export interface EscrowMilestone {
  id: string
  escrowId: string
  title: string
  description: string
  amount: number
  percentage: number
  dueDate?: Date
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'released' | 'disputed'
  submittedAt?: Date
  approvedAt?: Date
  releasedAt?: Date
  disputedAt?: Date
  paymentIntentId?: string
  deliverables: MilestoneDeliverable[]
  approvalRequirements: string[]
  notes?: string
}

export interface MilestoneDeliverable {
  id: string
  milestoneId: string
  title: string
  description: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  submittedAt?: Date
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
}

export interface EscrowTransaction {
  id: string
  escrowId: string
  milestoneId?: string
  type: 'deposit' | 'release' | 'refund' | 'dispute_hold' | 'fee_collection'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentIntentId?: string
  stripeTransferId?: string
  processedAt?: Date
  failureReason?: string
  metadata: Record<string, any>
}

export interface DisputeCase {
  id: string
  escrowId: string
  milestoneId?: string
  initiatedBy: 'business' | 'talent'
  reason: string
  description: string
  status: 'open' | 'under_review' | 'resolved' | 'closed'
  resolution?: 'refund_business' | 'release_talent' | 'partial_split' | 'mediation_required'
  resolutionAmount?: number
  resolutionNotes?: string
  createdAt: Date
  resolvedAt?: Date
  adminNotes?: string
}

/**
 * Create escrow account for a contract
 */
export async function createEscrowAccount(
  contractId: string,
  businessId: string,
  talentId: string,
  talentStripeAccountId: string,
  milestones: Omit<EscrowMilestone, 'id' | 'escrowId' | 'status' | 'paymentIntentId' | 'deliverables'>[]
): Promise<EscrowAccount> {
  // Calculate total amount
  const totalAmount = milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
  
  // Validate milestone percentages add up to 100%
  const totalPercentage = milestones.reduce((sum, milestone) => sum + milestone.percentage, 0)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Milestone percentages must add up to 100%')
  }

  const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Create milestone objects
  const escrowMilestones: EscrowMilestone[] = milestones.map((milestone, index) => ({
    ...milestone,
    id: `milestone_${escrowId}_${index + 1}`,
    escrowId,
    status: 'pending',
    deliverables: [],
    approvalRequirements: milestone.approvalRequirements || []
  }))

  const escrowAccount: EscrowAccount = {
    id: escrowId,
    contractId,
    businessId,
    talentId,
    talentStripeAccountId,
    totalAmount,
    currency: 'cad',
    status: 'created',
    milestones: escrowMilestones,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      created_by: 'system',
      contract_id: contractId
    }
  }

  // In real implementation, save to database
  console.log('Created escrow account:', escrowAccount)
  
  return escrowAccount
}

/**
 * Fund escrow account (business pays upfront)
 */
export async function fundEscrowAccount(
  escrowId: string,
  paymentMethodId: string
): Promise<{ escrowAccount: EscrowAccount; paymentIntent: PaymentIntent }> {
  // In real implementation, fetch from database
  const escrowAccount = await getEscrowAccount(escrowId)
  
  if (escrowAccount.status !== 'created') {
    throw new Error('Escrow account cannot be funded in current status')
  }

  // Calculate fees
  const platformFee = calculatePlatformFee(escrowAccount.totalAmount)
  const stripeFee = calculateStripeFee(escrowAccount.totalAmount)
  const totalFees = platformFee + stripeFee

  // Create payment intent for full amount
  const paymentIntent = await createPaymentIntent(
    escrowAccount.totalAmount,
    escrowAccount.currency,
    escrowAccount.talentStripeAccountId,
    Math.round(totalFees * 100), // Convert to cents
    {
      escrow_id: escrowId,
      contract_id: escrowAccount.contractId,
      business_id: escrowAccount.businessId,
      talent_id: escrowAccount.talentId,
      type: 'escrow_funding'
    }
  )

  // Update escrow account
  escrowAccount.paymentIntentId = paymentIntent.id
  escrowAccount.status = 'funded'
  escrowAccount.updatedAt = new Date()

  // In real implementation, save to database
  console.log('Funded escrow account:', escrowAccount)

  return { escrowAccount, paymentIntent }
}

/**
 * Submit milestone for approval
 */
export async function submitMilestone(
  escrowId: string,
  milestoneId: string,
  deliverables: Omit<MilestoneDeliverable, 'id' | 'milestoneId' | 'submittedAt' | 'status'>[],
  notes?: string
): Promise<EscrowMilestone> {
  const escrowAccount = await getEscrowAccount(escrowId)
  const milestone = escrowAccount.milestones.find(m => m.id === milestoneId)
  
  if (!milestone) {
    throw new Error('Milestone not found')
  }
  
  if (milestone.status !== 'pending' && milestone.status !== 'in_progress') {
    throw new Error('Milestone cannot be submitted in current status')
  }

  // Create deliverable objects
  const milestoneDeliverables: MilestoneDeliverable[] = deliverables.map((deliverable, index) => ({
    ...deliverable,
    id: `deliverable_${milestoneId}_${index + 1}`,
    milestoneId,
    submittedAt: new Date(),
    status: 'submitted'
  }))

  // Update milestone
  milestone.status = 'submitted'
  milestone.submittedAt = new Date()
  milestone.deliverables = milestoneDeliverables
  milestone.notes = notes

  escrowAccount.updatedAt = new Date()

  // In real implementation, save to database and send notifications
  console.log('Submitted milestone:', milestone)

  return milestone
}

/**
 * Approve milestone and release payment
 */
export async function approveMilestone(
  escrowId: string,
  milestoneId: string,
  approvalNotes?: string
): Promise<{ milestone: EscrowMilestone; transaction: EscrowTransaction }> {
  const escrowAccount = await getEscrowAccount(escrowId)
  const milestone = escrowAccount.milestones.find(m => m.id === milestoneId)
  
  if (!milestone) {
    throw new Error('Milestone not found')
  }
  
  if (milestone.status !== 'submitted') {
    throw new Error('Milestone must be submitted before approval')
  }

  // Calculate release amount (milestone amount minus fees)
  const platformFee = calculatePlatformFee(milestone.amount)
  const stripeFee = calculateStripeFee(milestone.amount)
  const releaseAmount = milestone.amount - platformFee - stripeFee

  // Create payment intent for this milestone
  const paymentIntent = await createPaymentIntent(
    milestone.amount,
    escrowAccount.currency,
    escrowAccount.talentStripeAccountId,
    Math.round((platformFee + stripeFee) * 100), // Convert to cents
    {
      escrow_id: escrowId,
      milestone_id: milestoneId,
      contract_id: escrowAccount.contractId,
      type: 'milestone_release'
    }
  )

  // Capture the payment (release from escrow)
  await capturePayment(paymentIntent.id, releaseAmount)

  // Update milestone
  milestone.status = 'released'
  milestone.approvedAt = new Date()
  milestone.releasedAt = new Date()
  milestone.paymentIntentId = paymentIntent.id
  milestone.notes = approvalNotes

  // Update deliverables
  milestone.deliverables.forEach(deliverable => {
    deliverable.status = 'approved'
  })

  // Create transaction record
  const transaction: EscrowTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    escrowId,
    milestoneId,
    type: 'release',
    amount: releaseAmount,
    currency: escrowAccount.currency,
    status: 'completed',
    paymentIntentId: paymentIntent.id,
    processedAt: new Date(),
    metadata: {
      milestone_title: milestone.title,
      platform_fee: platformFee,
      stripe_fee: stripeFee,
      gross_amount: milestone.amount
    }
  }

  // Check if all milestones are completed
  const allMilestonesReleased = escrowAccount.milestones.every(m => m.status === 'released')
  if (allMilestonesReleased) {
    escrowAccount.status = 'completed'
  } else {
    escrowAccount.status = 'partially_released'
  }

  escrowAccount.updatedAt = new Date()

  // In real implementation, save to database and send notifications
  console.log('Approved milestone:', milestone)
  console.log('Created transaction:', transaction)

  return { milestone, transaction }
}

/**
 * Reject milestone
 */
export async function rejectMilestone(
  escrowId: string,
  milestoneId: string,
  rejectionReason: string,
  rejectionNotes?: string
): Promise<EscrowMilestone> {
  const escrowAccount = await getEscrowAccount(escrowId)
  const milestone = escrowAccount.milestones.find(m => m.id === milestoneId)
  
  if (!milestone) {
    throw new Error('Milestone not found')
  }
  
  if (milestone.status !== 'submitted') {
    throw new Error('Only submitted milestones can be rejected')
  }

  // Update milestone
  milestone.status = 'in_progress' // Back to in progress for resubmission
  milestone.notes = `Rejected: ${rejectionReason}${rejectionNotes ? `\n\nNotes: ${rejectionNotes}` : ''}`

  // Update deliverables
  milestone.deliverables.forEach(deliverable => {
    deliverable.status = 'rejected'
  })

  escrowAccount.updatedAt = new Date()

  // In real implementation, save to database and send notifications
  console.log('Rejected milestone:', milestone)

  return milestone
}

/**
 * Initiate dispute
 */
export async function initiateDispute(
  escrowId: string,
  milestoneId: string,
  initiatedBy: 'business' | 'talent',
  reason: string,
  description: string
): Promise<DisputeCase> {
  const escrowAccount = await getEscrowAccount(escrowId)
  const milestone = escrowAccount.milestones.find(m => m.id === milestoneId)
  
  if (!milestone) {
    throw new Error('Milestone not found')
  }

  const dispute: DisputeCase = {
    id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    escrowId,
    milestoneId,
    initiatedBy,
    reason,
    description,
    status: 'open',
    createdAt: new Date()
  }

  // Update milestone status
  milestone.status = 'disputed'
  milestone.disputedAt = new Date()

  // Update escrow status
  escrowAccount.status = 'disputed'
  escrowAccount.updatedAt = new Date()

  // In real implementation, save to database and notify admin
  console.log('Created dispute:', dispute)

  return dispute
}

/**
 * Resolve dispute
 */
export async function resolveDispute(
  disputeId: string,
  resolution: 'refund_business' | 'release_talent' | 'partial_split',
  resolutionAmount?: number,
  resolutionNotes?: string,
  adminNotes?: string
): Promise<DisputeCase> {
  // In real implementation, fetch dispute from database
  const dispute = await getDispute(disputeId)
  
  if (dispute.status !== 'open' && dispute.status !== 'under_review') {
    throw new Error('Dispute cannot be resolved in current status')
  }

  const escrowAccount = await getEscrowAccount(dispute.escrowId)
  const milestone = escrowAccount.milestones.find(m => m.id === dispute.milestoneId)
  
  if (!milestone) {
    throw new Error('Associated milestone not found')
  }

  // Process resolution
  switch (resolution) {
    case 'refund_business':
      // Cancel payment intent to refund business
      if (milestone.paymentIntentId) {
        await cancelPayment(milestone.paymentIntentId)
      }
      milestone.status = 'pending' // Reset to pending
      break

    case 'release_talent':
      // Approve and release payment to talent
      await approveMilestone(dispute.escrowId, dispute.milestoneId!, resolutionNotes)
      break

    case 'partial_split':
      if (!resolutionAmount) {
        throw new Error('Resolution amount required for partial split')
      }
      // Implement partial payment logic
      // This would involve creating separate payment intents for business refund and talent payment
      break
  }

  // Update dispute
  dispute.status = 'resolved'
  dispute.resolution = resolution
  dispute.resolutionAmount = resolutionAmount
  dispute.resolutionNotes = resolutionNotes
  dispute.resolvedAt = new Date()
  dispute.adminNotes = adminNotes

  // Update escrow status
  const hasOpenDisputes = escrowAccount.milestones.some(m => m.status === 'disputed')
  if (!hasOpenDisputes) {
    escrowAccount.status = 'partially_released' // Or 'completed' if all milestones done
  }
  escrowAccount.updatedAt = new Date()

  // In real implementation, save to database and send notifications
  console.log('Resolved dispute:', dispute)

  return dispute
}

/**
 * Cancel escrow account (refund all funds to business)
 */
export async function cancelEscrowAccount(
  escrowId: string,
  reason: string
): Promise<EscrowAccount> {
  const escrowAccount = await getEscrowAccount(escrowId)
  
  if (escrowAccount.status === 'completed' || escrowAccount.status === 'cancelled') {
    throw new Error('Cannot cancel escrow in current status')
  }

  // Cancel main payment intent if exists
  if (escrowAccount.paymentIntentId) {
    await cancelPayment(escrowAccount.paymentIntentId)
  }

  // Cancel any milestone payment intents
  for (const milestone of escrowAccount.milestones) {
    if (milestone.paymentIntentId && milestone.status !== 'released') {
      await cancelPayment(milestone.paymentIntentId)
    }
  }

  // Update escrow account
  escrowAccount.status = 'cancelled'
  escrowAccount.updatedAt = new Date()
  escrowAccount.metadata.cancellation_reason = reason
  escrowAccount.metadata.cancelled_at = new Date().toISOString()

  // In real implementation, save to database and send notifications
  console.log('Cancelled escrow account:', escrowAccount)

  return escrowAccount
}

/**
 * Get escrow account details
 */
async function getEscrowAccount(escrowId: string): Promise<EscrowAccount> {
  // In real implementation, fetch from database
  // This is a mock implementation
  throw new Error('getEscrowAccount not implemented - would fetch from database')
}

/**
 * Get dispute details
 */
async function getDispute(disputeId: string): Promise<DisputeCase> {
  // In real implementation, fetch from database
  // This is a mock implementation
  throw new Error('getDispute not implemented - would fetch from database')
}

/**
 * Calculate escrow summary
 */
export function calculateEscrowSummary(escrowAccount: EscrowAccount): {
  totalAmount: number
  releasedAmount: number
  pendingAmount: number
  platformFees: number
  stripeFees: number
  netToTalent: number
  completionPercentage: number
} {
  const releasedMilestones = escrowAccount.milestones.filter(m => m.status === 'released')
  const releasedAmount = releasedMilestones.reduce((sum, m) => sum + m.amount, 0)
  const pendingAmount = escrowAccount.totalAmount - releasedAmount

  const platformFees = calculatePlatformFee(escrowAccount.totalAmount)
  const stripeFees = calculateStripeFee(escrowAccount.totalAmount)
  const netToTalent = escrowAccount.totalAmount - platformFees - stripeFees

  const completionPercentage = escrowAccount.milestones.length > 0 
    ? (releasedMilestones.length / escrowAccount.milestones.length) * 100 
    : 0

  return {
    totalAmount: escrowAccount.totalAmount,
    releasedAmount,
    pendingAmount,
    platformFees,
    stripeFees,
    netToTalent,
    completionPercentage: Math.round(completionPercentage)
  }
}
