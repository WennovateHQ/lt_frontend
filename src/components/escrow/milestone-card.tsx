'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import {
  useSubmitMilestone,
  useApproveMilestone,
  useRejectMilestone,
  useMilestoneStatus
} from '@/lib/hooks/use-escrow'
import { EscrowMilestone, MilestoneDeliverable } from '@/lib/payments/escrow-manager'
import { formatCurrency, formatDate } from '@/lib/utils'
import { MilestoneSubmissionModal } from './milestone-submission-modal'

interface MilestoneCardProps {
  milestone: EscrowMilestone
  milestoneNumber: number
  userRole: 'business' | 'talent' | 'admin'
  userId: string
  escrowId: string
  onDispute: (milestone: EscrowMilestone) => void
}

export function MilestoneCard({
  milestone,
  milestoneNumber,
  userRole,
  userId,
  escrowId,
  onDispute
}: MilestoneCardProps) {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')

  const milestoneStatus = useMilestoneStatus(milestone)
  const submitMutation = useSubmitMilestone()
  const approveMutation = useApproveMilestone()
  const rejectMutation = useRejectMilestone()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'released': return 'bg-green-100 text-green-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'in_progress': return <ClockIcon className="w-4 h-4" />
      case 'submitted': return <DocumentArrowUpIcon className="w-4 h-4" />
      case 'approved': return <CheckCircleIcon className="w-4 h-4" />
      case 'released': return <CheckCircleIcon className="w-4 h-4" />
      case 'disputed': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return <ClockIcon className="w-4 h-4" />
    }
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        escrowId,
        milestoneId: milestone.id,
        approvalNotes
      })
      setShowApprovalForm(false)
      setApprovalNotes('')
    } catch (error) {
      console.error('Failed to approve milestone:', error)
    }
  }

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        escrowId,
        milestoneId: milestone.id,
        rejectionReason,
        rejectionNotes
      })
      setShowRejectionForm(false)
      setRejectionReason('')
      setRejectionNotes('')
    } catch (error) {
      console.error('Failed to reject milestone:', error)
    }
  }

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                {milestoneNumber}
              </div>
              <div>
                <CardTitle className="text-lg">{milestone.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(milestone.status)} flex items-center gap-1`}>
              {getStatusIcon(milestone.status)}
              {milestone.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Milestone Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-semibold">{formatCurrency(milestone.amount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded text-white flex items-center justify-center text-xs">
                %
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="font-semibold">{milestone.percentage}%</p>
              </div>
            </div>
            {milestone.dueDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">{formatDate(milestone.dueDate)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Approval Requirements */}
          {milestone.approvalRequirements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Approval Requirements</h4>
              <ul className="list-disc list-inside space-y-1">
                {milestone.approvalRequirements.map((requirement, index) => (
                  <li key={index} className="text-sm text-gray-600">{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Deliverables */}
          {milestone.deliverables.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables</h4>
              <div className="space-y-2">
                {milestone.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DocumentArrowUpIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{deliverable.title}</p>
                        <p className="text-xs text-gray-600">{deliverable.description}</p>
                        {deliverable.fileName && (
                          <p className="text-xs text-blue-600">{deliverable.fileName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(deliverable.status)}>
                        {deliverable.status}
                      </Badge>
                      {deliverable.fileUrl && (
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {milestone.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{milestone.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
            {milestone.submittedAt && (
              <div>
                <p className="font-medium">Submitted</p>
                <p>{formatDate(milestone.submittedAt)}</p>
              </div>
            )}
            {milestone.approvedAt && (
              <div>
                <p className="font-medium">Approved</p>
                <p>{formatDate(milestone.approvedAt)}</p>
              </div>
            )}
            {milestone.releasedAt && (
              <div>
                <p className="font-medium">Released</p>
                <p>{formatDate(milestone.releasedAt)}</p>
              </div>
            )}
            {milestone.disputedAt && (
              <div>
                <p className="font-medium">Disputed</p>
                <p>{formatDate(milestone.disputedAt)}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t">
            {/* Talent Actions */}
            {userRole === 'talent' && milestoneStatus.canSubmit && (
              <Button onClick={() => setShowSubmissionModal(true)}>
                <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                Submit Milestone
              </Button>
            )}

            {userRole === 'talent' && milestoneStatus.needsResubmission && (
              <Button variant="outline" onClick={() => setShowSubmissionModal(true)}>
                <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                Resubmit
              </Button>
            )}

            {/* Business Actions */}
            {userRole === 'business' && milestoneStatus.canApprove && (
              <>
                <Button onClick={() => setShowApprovalForm(true)}>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button variant="outline" onClick={() => setShowRejectionForm(true)}>
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
              </>
            )}

            {/* Dispute Actions */}
            {milestoneStatus.canDispute && (
              <Button variant="outline" onClick={() => onDispute(milestone)}>
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Dispute
              </Button>
            )}
          </div>

          {/* Approval Form */}
          {showApprovalForm && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">Approve Milestone</h4>
              <Textarea
                placeholder="Add approval notes (optional)..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="bg-white"
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
                </Button>
                <Button variant="ghost" onClick={() => setShowApprovalForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectionForm && (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900">Request Changes</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Reason for rejection *
                  </label>
                  <Textarea
                    placeholder="Explain what needs to be changed..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Additional notes (optional)
                  </label>
                  <Textarea
                    placeholder="Any additional feedback..."
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  variant="destructive"
                >
                  {rejectMutation.isPending ? 'Sending...' : 'Request Changes'}
                </Button>
                <Button variant="ghost" onClick={() => setShowRejectionForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Status Alerts */}
          {milestoneStatus.needsResubmission && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This milestone was rejected and needs to be resubmitted with the requested changes.
              </AlertDescription>
            </Alert>
          )}

          {milestoneStatus.isDisputed && (
            <Alert className="border-red-200 bg-red-50">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This milestone is currently under dispute. Please wait for admin resolution.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submission Modal */}
      {showSubmissionModal && (
        <MilestoneSubmissionModal
          escrowId={escrowId}
          milestone={milestone}
          onClose={() => setShowSubmissionModal(false)}
        />
      )}
    </>
  )
}
