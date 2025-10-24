'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const composeMessageSchema = z.object({
  recipientId: z.string().min(1, 'Please select a recipient'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  projectId: z.string().optional()
})

type ComposeMessageFormData = z.infer<typeof composeMessageSchema>

interface Recipient {
  id: string
  name: string
  avatar?: string
  type: 'business' | 'talent'
  projectTitle?: string
}

interface ComposeMessageProps {
  isOpen: boolean
  onClose: () => void
  recipients: Recipient[]
  onSendMessage: (data: ComposeMessageFormData & { attachments: File[] }) => Promise<void>
  defaultRecipient?: string
  defaultProject?: string
  defaultSubject?: string
}

export function ComposeMessage({
  isOpen,
  onClose,
  recipients,
  onSendMessage,
  defaultRecipient,
  defaultProject,
  defaultSubject
}: ComposeMessageProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ComposeMessageFormData>({
    resolver: zodResolver(composeMessageSchema),
    defaultValues: {
      recipientId: defaultRecipient || '',
      subject: defaultSubject || '',
      projectId: defaultProject || ''
    }
  })

  const selectedRecipientId = watch('recipientId')
  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const onSubmit = async (data: ComposeMessageFormData) => {
    setIsSubmitting(true)
    try {
      await onSendMessage({ ...data, attachments })
      reset()
      setAttachments([])
      onClose()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setAttachments([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5" />
            Compose Message
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipientId">To *</Label>
            <Select
              value={selectedRecipientId}
              onValueChange={(value) => setValue('recipientId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {recipient.avatar ? (
                          <img
                            src={recipient.avatar}
                            alt={recipient.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{recipient.name}</p>
                        {recipient.projectTitle && (
                          <p className="text-sm text-gray-600">{recipient.projectTitle}</p>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.recipientId && (
              <p className="text-sm text-red-600">{errors.recipientId.message}</p>
            )}
          </div>

          {/* Selected Recipient Info */}
          {selectedRecipient && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {selectedRecipient.avatar ? (
                    <img
                      src={selectedRecipient.avatar}
                      alt={selectedRecipient.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedRecipient.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{selectedRecipient.type}</p>
                  {selectedRecipient.projectTitle && (
                    <p className="text-sm text-gray-500">{selectedRecipient.projectTitle}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              {...register('subject')}
              placeholder="Enter message subject"
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          {/* Project Context (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project Context (Optional)</Label>
            <Select
              value={watch('projectId') || ''}
              onValueChange={(value) => setValue('projectId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select related project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific project</SelectItem>
                {/* In real implementation, populate with user's projects */}
                <SelectItem value="project1">E-commerce Website Development</SelectItem>
                <SelectItem value="project2">Mobile App UI/UX Design</SelectItem>
                <SelectItem value="project3">Brand Identity Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              {...register('message')}
              placeholder="Type your message here..."
              rows={6}
              className="resize-none"
            />
            {errors.message && (
              <p className="text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            
            {attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <PaperClipIcon className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                      className="h-6 px-2 text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-input')?.click()}
              className="w-full"
            >
              <PaperClipIcon className="w-4 h-4 mr-2" />
              Attach Files
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
