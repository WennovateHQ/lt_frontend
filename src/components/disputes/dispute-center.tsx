'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'
import { disputesService, Dispute, CreateDisputeRequest } from '@/lib/api/disputes.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export function DisputeCenter() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    loadDisputes()
  }, [statusFilter, typeFilter])

  const loadDisputes = async () => {
    try {
      const params: any = {
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.type = typeFilter

      const response = await disputesService.getDisputes(params)
      setDisputes(response.disputes)
    } catch (error) {
      console.error('Failed to load disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'under_review': case 'mediation': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'escalated': return 'bg-red-100 text-red-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: Dispute['type']) => {
    switch (type) {
      case 'payment': return '💳'
      case 'quality': return '⭐'
      case 'timeline': return '⏰'
      case 'scope': return '📋'
      case 'communication': return '💬'
      case 'contract_violation': return '📄'
      default: return '❓'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Dispute Resolution Center
          </h2>
          <p className="text-gray-600">Manage and resolve project disputes</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              File Dispute
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>File a New Dispute</DialogTitle>
            </DialogHeader>
            <CreateDisputeForm onSuccess={() => {
              setShowCreateDialog(false)
              loadDisputes()
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="mediation">In Mediation</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payment Issues</SelectItem>
                <SelectItem value="quality">Quality Concerns</SelectItem>
                <SelectItem value="timeline">Timeline Disputes</SelectItem>
                <SelectItem value="scope">Scope Changes</SelectItem>
                <SelectItem value="communication">Communication Issues</SelectItem>
                <SelectItem value="contract_violation">Contract Violations</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Total: {disputes?.length || 0}</span>
              <span>•</span>
              <span>Open: {(disputes || []).filter(d => !['resolved', 'closed'].includes(d?.status || '')).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disputes List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Disputes ({disputes?.length || 0})</h3>
            
            {(disputes?.length || 0) === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Disputes</h3>
                  <p className="text-gray-600">You have no active disputes. Great work!</p>
                </CardContent>
              </Card>
            ) : (
              (disputes || []).map(dispute => (
                <Card 
                  key={dispute.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedDispute?.id === dispute.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedDispute(dispute)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(dispute.type)}</span>
                        <div>
                          <h4 className="font-medium">{dispute.subject}</h4>
                          <p className="text-sm text-gray-600">
                            Case #{dispute.id.slice(-6)} • {dispute.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(dispute.priority)}>
                          {dispute.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Against: {dispute.respondent.name}</span>
                        {dispute.amountInDispute && (
                          <span className="font-medium">
                            {formatCurrency(dispute.amountInDispute)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatDate(dispute.createdAt)}
                        </span>
                        
                        {(dispute.messages?.length || 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            {dispute.messages?.length || 0} messages
                          </span>
                        )}
                        
                        {(dispute.evidence?.length || 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <DocumentTextIcon className="w-4 h-4" />
                            {dispute.evidence?.length || 0} files
                          </span>
                        )}
                      </div>
                    </div>

                    {dispute?.resolution && (
                      <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Resolved:</strong> {dispute?.resolution?.summary}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Dispute Details */}
          <div className="space-y-4">
            {selectedDispute ? (
              <DisputeDetails 
                dispute={selectedDispute} 
                onUpdate={() => loadDisputes()}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Dispute</h3>
                  <p className="text-gray-600">Click on a dispute to view details and take actions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CreateDisputeForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<Partial<CreateDisputeRequest>>({
    type: 'payment',
    requestedResolution: 'mediation'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await disputesService.createDispute(formData as CreateDisputeRequest)
      onSuccess()
    } catch (error) {
      console.error('Failed to create dispute:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dispute Type
          </label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Payment Issues</SelectItem>
              <SelectItem value="quality">Quality Concerns</SelectItem>
              <SelectItem value="timeline">Timeline Disputes</SelectItem>
              <SelectItem value="scope">Scope Changes</SelectItem>
              <SelectItem value="communication">Communication Issues</SelectItem>
              <SelectItem value="contract_violation">Contract Violations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requested Resolution
          </label>
          <Select 
            value={formData.requestedResolution} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, requestedResolution: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="refund">Full Refund</SelectItem>
              <SelectItem value="partial_refund">Partial Refund</SelectItem>
              <SelectItem value="completion">Project Completion</SelectItem>
              <SelectItem value="compensation">Compensation</SelectItem>
              <SelectItem value="mediation">Mediation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <Input
          value={formData.subject || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed explanation of the dispute..."
          rows={4}
          required
        />
      </div>

      {(formData.requestedResolution === 'refund' || formData.requestedResolution === 'partial_refund' || formData.requestedResolution === 'compensation') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount in Dispute
          </label>
          <Input
            type="number"
            value={formData.amountInDispute || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, amountInDispute: parseFloat(e.target.value) }))}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setFormData({})}>
          Reset
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Dispute'}
        </Button>
      </div>
    </form>
  )
}

function DisputeDetails({ dispute, onUpdate }: { dispute: Dispute; onUpdate: () => void }) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await disputesService.sendMessage(dispute.id, newMessage)
      setNewMessage('')
      onUpdate()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dispute Details</span>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(dispute.priority)}>
                {dispute.priority}
              </Badge>
              <Badge className={getStatusColor(dispute.status)}>
                {dispute.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{dispute.subject}</h4>
              <p className="text-sm text-gray-600 mt-1">{dispute.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium">{dispute.type.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">{formatDate(dispute.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-600">Complainant:</span>
                <p className="font-medium">{dispute.complainant.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Respondent:</span>
                <p className="font-medium">{dispute.respondent.name}</p>
              </div>
            </div>

            {dispute.amountInDispute && (
              <div>
                <span className="text-gray-600">Amount in Dispute:</span>
                <p className="font-medium text-lg">{formatCurrency(dispute.amountInDispute)}</p>
              </div>
            )}

            {dispute.mediator && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Mediator Assigned:</strong> {dispute.mediator.name}
                </p>
              </div>
            )}

            {dispute.resolution && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">Resolution</h5>
                <p className="text-sm text-green-700">{dispute.resolution.details}</p>
                {dispute.resolution.financialResolution && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>Financial Resolution:</strong> {formatCurrency(dispute.resolution.financialResolution.refundAmount || 0)} 
                    to {dispute.resolution.financialResolution.recipient}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Messages ({dispute.messages.length})</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({dispute.evidence.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dispute.messages.map(message => (
                  <div key={message.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <PaperClipIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {message.attachments.length} attachment(s)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!['resolved', 'closed'].includes(dispute.status) && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence & Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              {dispute.evidence.length === 0 ? (
                <p className="text-center text-gray-600 py-4">No evidence uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {dispute.evidence.map(evidence => (
                    <div key={evidence.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm">{evidence.fileName}</p>
                          <p className="text-xs text-gray-600">{evidence.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800'
    case 'high': return 'bg-orange-100 text-orange-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'resolved': return 'bg-green-100 text-green-800'
    case 'under_review': case 'mediation': return 'bg-yellow-100 text-yellow-800'
    case 'submitted': return 'bg-blue-100 text-blue-800'
    case 'escalated': return 'bg-red-100 text-red-800'
    case 'closed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
