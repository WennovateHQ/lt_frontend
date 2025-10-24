'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'
import { useInitiateDispute } from '@/lib/hooks/use-escrow'
import { EscrowMilestone } from '@/lib/payments/escrow-manager'
import { formatCurrency } from '@/lib/utils'

const disputeSchema = z.object({
  reason: z.enum([
    'work_not_completed',
    'work_quality_issues',
    'missed_deadline',
    'scope_disagreement',
    'communication_issues',
    'payment_delay',
    'contract_violation',
    'other'
  ], { required_error: 'Please select a dispute reason' }),
  description: z.string().min(50, 'Please provide at least 50 characters describing the issue'),
  evidence: z.string().optional()
})

type DisputeFormData = z.infer<typeof disputeSchema>

interface DisputeModalProps {
  escrowId: string
  milestone: EscrowMilestone
  userRole: 'business' | 'talent' | 'admin'
  onClose: () => void
}

const disputeReasons = {
  work_not_completed: {
    label: 'Work Not Completed',
    description: 'The deliverables were not completed as agreed'
  },
  work_quality_issues: {
    label: 'Quality Issues',
    description: 'The work quality does not meet the agreed standards'
  },
  missed_deadline: {
    label: 'Missed Deadline',
    description: 'The milestone was not delivered on time'
  },
  scope_disagreement: {
    label: 'Scope Disagreement',
    description: 'There is disagreement about what work should be included'
  },
  communication_issues: {
    label: 'Communication Issues',
    description: 'Poor communication or unresponsiveness'
  },
  payment_delay: {
    label: 'Payment Delay',
    description: 'Payment approval is being unreasonably delayed'
  },
  contract_violation: {
    label: 'Contract Violation',
    description: 'Terms of the contract have been violated'
  },
  other: {
    label: 'Other',
    description: 'Other issues not covered above'
  }
}

export function DisputeModal({ escrowId, milestone, userRole, onClose }: DisputeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const initiateMutation = useInitiateDispute()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema)
  })

  const selectedReason = watch('reason')

  const onSubmit = async (data: DisputeFormData) => {
    setIsSubmitting(true)
    try {
      await initiateMutation.mutateAsync({
        escrowId,
        milestoneId: milestone.id,
        initiatedBy: userRole as 'business' | 'talent',
        reason: data.reason,
        description: data.description + (data.evidence ? `\n\nEvidence:\n${data.evidence}` : '')
      })
      onClose()
    } catch (error) {
      console.error('Failed to initiate dispute:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            Initiate Dispute
          </DialogTitle>
          <DialogDescription>
            If you have concerns about this milestone, you can initiate a dispute. Our team will review the situation and help resolve the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Milestone Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Milestone Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Title</Label>
                  <p className="font-medium">{milestone.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="font-medium">{formatCurrency(milestone.amount)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-gray-700">{milestone.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Status</Label>
                <p className="font-medium capitalize">{milestone.status.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Warning Alert */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <ShieldExclamationIcon className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Important:</strong> Initiating a dispute will pause all milestone activities until the issue is resolved. 
              Please try to resolve the issue directly with the other party first through our messaging system.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dispute Reason */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Reason for Dispute *</Label>
              <RadioGroup
                value={selectedReason}
                onValueChange={(value) => setValue('reason', value as any)}
              >
                {Object.entries(disputeReasons).map(([key, reason]) => (
                  <div key={key} className="flex items-start space-x-3">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={key} className="cursor-pointer font-medium">
                        {reason.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Detailed Description *
              </Label>
              <p className="text-sm text-gray-600">
                Please provide a clear and detailed explanation of the issue. Include specific examples and any relevant context.
              </p>
              <Textarea
                {...register('description')}
                placeholder="Describe the issue in detail. What happened? What was expected? What evidence do you have?"
                rows={6}
                className="resize-none"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Evidence */}
            <div className="space-y-2">
              <Label htmlFor="evidence" className="text-base font-semibold">
                Supporting Evidence (Optional)
              </Label>
              <p className="text-sm text-gray-600">
                Include any additional evidence such as screenshots, file references, or communication logs that support your dispute.
              </p>
              <Textarea
                {...register('evidence')}
                placeholder="List any files, screenshots, messages, or other evidence that supports your case..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Process Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  Dispute Resolution Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">What happens next:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Your dispute will be submitted to our resolution team</li>
                    <li>Both parties will be notified and can provide additional information</li>
                    <li>Our team will review all evidence and communications</li>
                    <li>A resolution will be determined within 5-7 business days</li>
                    <li>Funds will be released or refunded based on the decision</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isSubmitting || initiateMutation.isPending}
              >
                {isSubmitting || initiateMutation.isPending ? (
                  'Submitting Dispute...'
                ) : (
                  <>
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                    Initiate Dispute
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
