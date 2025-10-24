'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useFileUpload, useFileDrop, useFileUtils } from '@/lib/hooks/use-file-sharing'
import { FileCategory } from '@/lib/file-sharing/file-manager'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  projectId?: string
  conversationId?: string
  messageId?: string
  applicationId?: string
  contractId?: string
  escrowId?: string
  milestoneId?: string
  category?: FileCategory
  accessLevel?: 'public' | 'project_members' | 'private'
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  onFilesUploaded?: (files: any[]) => void
  className?: string
}

interface FileWithMetadata extends File {
  id: string
  description?: string
  tags?: string[]
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress?: number
  error?: string
  uploadedFile?: any
}

export function FileUpload({
  projectId,
  conversationId,
  messageId,
  applicationId,
  contractId,
  escrowId,
  milestoneId,
  category,
  accessLevel = 'project_members',
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'video/webm'
  ],
  onFilesUploaded,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, isUploading, uploadProgress } = useFileUpload()
  const { formatFileSize, getFileIcon, isPreviewable } = useFileUtils()

  const { isDragOver, dragHandlers } = useFileDrop({
    onFilesDropped: handleFilesAdded,
    acceptedTypes,
    maxFiles,
    maxSize
  })

  function handleFilesAdded(newFiles: File[]) {
    const filesWithMetadata: FileWithMetadata[] = newFiles.map(file => ({
      ...file,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...filesWithMetadata].slice(0, maxFiles))
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    handleFilesAdded(selectedFiles)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removeFile(fileId: string) {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  function updateFileMetadata(fileId: string, updates: Partial<FileWithMetadata>) {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates } : f))
  }

  async function uploadFiles() {
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      try {
        updateFileMetadata(file.id, { status: 'uploading', progress: 0 })

        const uploadedFile = await upload({
          file,
          options: {
            projectId,
            conversationId,
            messageId,
            applicationId,
            contractId,
            escrowId,
            milestoneId,
            category,
            accessLevel,
            description: file.description,
            tags: file.tags
          }
        })

        updateFileMetadata(file.id, { 
          status: 'completed', 
          progress: 100,
          uploadedFile 
        })

      } catch (error) {
        updateFileMetadata(file.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        })
      }
    }

    // Call callback with successfully uploaded files
    const uploadedFiles = files
      .filter(f => f.status === 'completed' && f.uploadedFile)
      .map(f => f.uploadedFile)
    
    if (uploadedFiles.length > 0 && onFilesUploaded) {
      onFilesUploaded(uploadedFiles)
    }
  }

  function clearCompleted() {
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }

  const hasFiles = files.length > 0
  const hasPendingFiles = files.some(f => f.status === 'pending')
  const hasCompletedFiles = files.some(f => f.status === 'completed')
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          hasFiles && 'border-solid border-gray-200'
        )}
        {...dragHandlers}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {!hasFiles ? (
            <>
              <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Support for {acceptedTypes.length > 3 ? 'multiple file types' : acceptedTypes.join(', ')}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>Max {maxFiles} files</span>
                  <span>•</span>
                  <span>Up to {formatFileSize(maxSize)} each</span>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DocumentArrowUpIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-sm text-gray-500">
                    ({formatFileSize(totalSize)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetails(!showDetails)
                  }}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>

              {!showDetails && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add More Files
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Details */}
      {hasFiles && showDetails && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.type}</span>
                          {isPreviewable(file.type) && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">
                                Previewable
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {file.status === 'pending' && (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {file.status === 'uploading' && (
                        <Badge variant="secondary">Uploading...</Badge>
                      )}
                      {file.status === 'completed' && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="destructive">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'uploading'}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mb-3">
                      <Progress 
                        value={uploadProgress[file.id] || 0} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <Alert className="border-red-200 bg-red-50 mb-3">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {file.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* File Metadata */}
                  {file.status === 'pending' && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`description-${file.id}`} className="text-sm">
                          Description (optional)
                        </Label>
                        <Textarea
                          id={`description-${file.id}`}
                          placeholder="Describe this file..."
                          value={file.description || ''}
                          onChange={(e) => updateFileMetadata(file.id, { description: e.target.value })}
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`tags-${file.id}`} className="text-sm">
                          Tags (optional)
                        </Label>
                        <Input
                          id={`tags-${file.id}`}
                          placeholder="Enter tags separated by commas"
                          value={file.tags?.join(', ') || ''}
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                            updateFileMetadata(file.id, { tags })
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {hasFiles && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasCompletedFiles && (
              <Button variant="outline" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear All
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={!hasPendingFiles || isUploading}
            >
              <CloudArrowUpIcon className="w-4 h-4 mr-2" />
              Upload {files.filter(f => f.status === 'pending').length} File{files.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
