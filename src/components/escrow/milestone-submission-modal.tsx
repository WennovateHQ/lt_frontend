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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useSubmitMilestone } from '@/lib/hooks/use-escrow'
import { EscrowMilestone, MilestoneDeliverable } from '@/lib/payments/escrow-manager'
import { formatCurrency } from '@/lib/utils'

const deliverableSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional()
})

const submissionSchema = z.object({
  deliverables: z.array(deliverableSchema).min(1, 'At least one deliverable is required'),
  notes: z.string().optional()
})

type SubmissionFormData = z.infer<typeof submissionSchema>

interface MilestoneSubmissionModalProps {
  escrowId: string
  milestone: EscrowMilestone
  onClose: () => void
}

export function MilestoneSubmissionModal({
  escrowId,
  milestone,
  onClose
}: MilestoneSubmissionModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  const submitMutation = useSubmitMilestone()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      deliverables: milestone.deliverables.length > 0 
        ? milestone.deliverables.map(d => ({
            title: d.title,
            description: d.description,
            fileUrl: d.fileUrl,
            fileName: d.fileName,
            fileSize: d.fileSize
          }))
        : [{ title: '', description: '', fileUrl: '', fileName: '', fileSize: 0 }],
      notes: milestone.notes || ''
    }
  })

  const deliverables = watch('deliverables')

  const addDeliverable = () => {
    const currentDeliverables = watch('deliverables')
    setValue('deliverables', [
      ...currentDeliverables,
      { title: '', description: '', fileUrl: '', fileName: '', fileSize: 0 }
    ])
  }

  const removeDeliverable = (index: number) => {
    const currentDeliverables = watch('deliverables')
    setValue('deliverables', currentDeliverables.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (index: number, file: File) => {
    const deliverableId = `deliverable-${index}`
    setUploadingFiles(prev => [...prev, deliverableId])

    try {
      // In real implementation, upload file to cloud storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const fileUrl = `https://storage.example.com/files/${file.name}`
      const currentDeliverables = watch('deliverables')
      const updatedDeliverables = [...currentDeliverables]
      updatedDeliverables[index] = {
        ...updatedDeliverables[index],
        fileUrl,
        fileName: file.name,
        fileSize: file.size
      }
      setValue('deliverables', updatedDeliverables)
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploadingFiles(prev => prev.filter(id => id !== deliverableId))
    }
  }

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      await submitMutation.mutateAsync({
        escrowId,
        milestoneId: milestone.id,
        deliverables: data.deliverables.map(d => ({
          title: d.title,
          description: d.description,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          fileSize: d.fileSize
        })),
        notes: data.notes
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit milestone:', error)
    }
  }

  const isResubmission = milestone.deliverables.some(d => d.status === 'rejected')

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DocumentArrowUpIcon className="w-5 h-5" />
            {isResubmission ? 'Resubmit' : 'Submit'} Milestone: {milestone.title}
          </DialogTitle>
          <DialogDescription>
            Submit your completed work for milestone approval. Include all required deliverables and documentation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Milestone Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="text-lg font-semibold">{formatCurrency(milestone.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Percentage</Label>
                  <p className="text-lg font-semibold">{milestone.percentage}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <p className="text-lg font-semibold capitalize">{milestone.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              {milestone.approvalRequirements.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-900">Approval Requirements</Label>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {milestone.approvalRequirements.map((requirement, index) => (
                      <li key={index} className="text-sm text-gray-600">{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resubmission Alert */}
          {isResubmission && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This milestone was previously rejected. Please address the feedback and resubmit with the requested changes.
              </AlertDescription>
            </Alert>
          )}

          {/* Deliverables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Deliverables</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Deliverable
              </Button>
            </div>

            {deliverables.map((deliverable, index) => {
              const deliverableId = `deliverable-${index}`
              const isUploading = uploadingFiles.includes(deliverableId)

              return (
                <Card key={index} className="relative">
                  <CardContent className="pt-6">
                    {deliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeDeliverable(index)}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`deliverables.${index}.title`}>
                          Title *
                        </Label>
                        <Input
                          {...register(`deliverables.${index}.title`)}
                          placeholder="e.g., Website Design Mockups"
                        />
                        {errors.deliverables?.[index]?.title && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.deliverables[index]?.title?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`deliverables.${index}.description`}>
                          Description *
                        </Label>
                        <Textarea
                          {...register(`deliverables.${index}.description`)}
                          placeholder="Describe what you're delivering and how it meets the requirements..."
                          rows={3}
                        />
                        {errors.deliverables?.[index]?.description && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.deliverables[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>File Upload</Label>
                        <div className="mt-2">
                          {deliverable.fileName ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  {deliverable.fileName}
                                </span>
                                {deliverable.fileSize && (
                                  <span className="text-xs text-green-600">
                                    ({Math.round(deliverable.fileSize / 1024)} KB)
                                  </span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const currentDeliverables = watch('deliverables')
                                  const updatedDeliverables = [...currentDeliverables]
                                  updatedDeliverables[index] = {
                                    ...updatedDeliverables[index],
                                    fileUrl: '',
                                    fileName: '',
                                    fileSize: 0
                                  }
                                  setValue('deliverables', updatedDeliverables)
                                }}
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">
                                {isUploading ? 'Uploading...' : 'Upload your file'}
                              </p>
                              <input
                                type="file"
                                className="hidden"
                                id={`file-${index}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleFileUpload(index, file)
                                  }
                                }}
                                disabled={isUploading}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`file-${index}`)?.click()}
                                disabled={isUploading}
                              >
                                {isUploading ? 'Uploading...' : 'Choose File'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {errors.deliverables?.root && (
              <p className="text-sm text-red-600">{errors.deliverables.root.message}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              {...register('notes')}
              placeholder="Any additional information or context for this submission..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || submitMutation.isPending || uploadingFiles.length > 0}
            >
              {isSubmitting || submitMutation.isPending ? 'Submitting...' : 
               isResubmission ? 'Resubmit Milestone' : 'Submit Milestone'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
