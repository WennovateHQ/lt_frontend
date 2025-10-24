'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  PlusIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

interface Deliverable {
  id: string
  title: string
  description: string
  fileUrl?: string
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  createdAt: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

interface DeliverableManagementProps {
  milestoneId: string
  userRole: 'business' | 'talent'
  canEdit: boolean
  onUpdate?: () => void
}

export function DeliverableManagement({ 
  milestoneId, 
  userRole, 
  canEdit,
  onUpdate 
}: DeliverableManagementProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for new deliverable
  const [newDeliverable, setNewDeliverable] = useState({
    title: '',
    description: '',
    fileUrl: ''
  })

  useEffect(() => {
    fetchDeliverables()
  }, [milestoneId])

  const fetchDeliverables = async () => {
    try {
      setIsLoading(true)
      const response: any = await apiClient.get(`/milestones/${milestoneId}/deliverables`)
      console.log('Deliverables response:', response)
      
      // Ensure we always set an array
      const deliverablesList = Array.isArray(response.deliverables) 
        ? response.deliverables 
        : Array.isArray(response) 
        ? response 
        : []
      
      setDeliverables(deliverablesList)
    } catch (error) {
      console.error('Error fetching deliverables:', error)
      setDeliverables([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDeliverable = async () => {
    if (!newDeliverable.title || !newDeliverable.description) {
      return
    }

    try {
      setIsSubmitting(true)
      
      let fileUrl = newDeliverable.fileUrl
      
      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const uploadResponse = await apiClient.post('/upload/deliverable', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }) as any
        fileUrl = uploadResponse.fileUrl
      }

      await apiClient.post(`/milestones/${milestoneId}/deliverables`, {
        title: newDeliverable.title,
        description: newDeliverable.description,
        fileUrl
      })

      // Reset form
      setNewDeliverable({ title: '', description: '', fileUrl: '' })
      setSelectedFile(null)
      setShowCreateForm(false)
      
      // Refresh deliverables
      await fetchDeliverables()
      onUpdate?.()
      
    } catch (error) {
      console.error('Error creating deliverable:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitDeliverable = async (deliverableId: string) => {
    try {
      await apiClient.put(`/deliverables/${deliverableId}/submit`)
      await fetchDeliverables()
      onUpdate?.()
    } catch (error) {
      console.error('Error submitting deliverable:', error)
    }
  }

  const handleReviewDeliverable = async (
    deliverableId: string, 
    action: 'approve' | 'reject',
    rejectionReason?: string
  ) => {
    try {
      await apiClient.put(`/deliverables/${deliverableId}/review`, {
        action,
        rejectionReason
      })
      await fetchDeliverables()
      onUpdate?.()
    } catch (error) {
      console.error('Error reviewing deliverable:', error)
    }
  }

  const getStatusBadge = (status: Deliverable['status']) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: ClockIcon, text: 'Pending' },
      SUBMITTED: { variant: 'default' as const, icon: DocumentArrowUpIcon, text: 'Submitted' },
      APPROVED: { variant: 'success' as const, icon: CheckCircleIcon, text: 'Approved' },
      REJECTED: { variant: 'destructive' as const, icon: XMarkIcon, text: 'Rejected' }
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Deliverables</h3>
        {userRole === 'talent' && canEdit && (
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Deliverable</DialogTitle>
                <DialogDescription>
                  Add a deliverable item for this milestone.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newDeliverable.title}
                    onChange={(e) => setNewDeliverable(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter deliverable title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDeliverable.description}
                    onChange={(e) => setNewDeliverable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what will be delivered"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="file">Attachment (Optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateDeliverable}
                    disabled={isSubmitting || !newDeliverable.title || !newDeliverable.description}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Deliverable'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {deliverables.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <DocumentArrowUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No deliverables added yet.</p>
            {userRole === 'talent' && canEdit && (
              <p className="text-sm mt-2">Add deliverables to track your progress on this milestone.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliverables.map((deliverable) => (
            <Card key={deliverable.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{deliverable.title}</h4>
                      {getStatusBadge(deliverable.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{deliverable.description}</p>
                    
                    {deliverable.fileUrl && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <DocumentArrowUpIcon className="h-4 w-4" />
                        <a 
                          href={deliverable.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View Attachment
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Created: {formatDate(deliverable.createdAt)}</span>
                      {deliverable.submittedAt && (
                        <span>Submitted: {formatDate(deliverable.submittedAt)}</span>
                      )}
                      {deliverable.approvedAt && (
                        <span>Approved: {formatDate(deliverable.approvedAt)}</span>
                      )}
                    </div>
                    
                    {deliverable.status === 'REJECTED' && deliverable.rejectionReason && (
                      <Alert className="mt-3">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Rejection Reason:</strong> {deliverable.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {/* Talent Actions */}
                    {userRole === 'talent' && deliverable.status === 'PENDING' && canEdit && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSubmitDeliverable(deliverable.id)}
                      >
                        Submit
                      </Button>
                    )}
                    
                    {/* Business Actions */}
                    {userRole === 'business' && deliverable.status === 'SUBMITTED' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleReviewDeliverable(deliverable.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Please provide a reason for rejection:')
                            if (reason) {
                              handleReviewDeliverable(deliverable.id, 'reject', reason)
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
