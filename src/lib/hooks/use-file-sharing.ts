import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileUpload,
  FileShareLink,
  FileVersion,
  FileCategory,
  uploadFile,
  downloadFile,
  createShareLink,
  getFilesByContext,
  deleteFile,
  createFileVersion
} from '@/lib/file-sharing/file-manager'
import { apiClient } from '@/lib/api-client'

// Hook for uploading files
export function useFileUpload() {
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const uploadMutation = useMutation({
    mutationFn: async (params: {
      file: File
      options?: {
        projectId?: string
        conversationId?: string
        messageId?: string
        applicationId?: string
        contractId?: string
        escrowId?: string
        milestoneId?: string
        category?: FileCategory
        accessLevel?: 'public' | 'project_members' | 'private'
        description?: string
        tags?: string[]
      }
    }) => {
      const { file, options = {} } = params
      
      // Track upload progress
      const fileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[fileId] || 0
            if (current < 90) {
              return { ...prev, [fileId]: current + 10 }
            }
            return prev
          })
        }, 200)

        const result = await uploadFile(file, options)
        
        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
        
        // Clean up progress after delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [fileId]: _, ...rest } = prev
            return rest
          })
        }, 2000)

        return { ...result, tempId: fileId }
      } catch (error) {
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev
          return rest
        })
        throw error
      }
    },
    onSuccess: (fileUpload, variables) => {
      // Invalidate relevant queries
      if (variables.options?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['files', 'project', variables.options.projectId] })
      }
      if (variables.options?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['files', 'conversation', variables.options.conversationId] })
      }
      if (variables.options?.applicationId) {
        queryClient.invalidateQueries({ queryKey: ['files', 'application', variables.options.applicationId] })
      }
    }
  })

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error
  }
}

// Hook for fetching files by context
export function useFiles(context: {
  projectId?: string
  conversationId?: string
  applicationId?: string
  contractId?: string
  escrowId?: string
  milestoneId?: string
}) {
  return useQuery({
    queryKey: ['files', context],
    queryFn: async () => {
      const response = await apiClient.get('/files', { params: context }) as any
      return response.data as FileUpload[]
    },
    enabled: Object.values(context).some(Boolean)
  })
}

// Hook for fetching single file
export function useFile(fileId: string) {
  return useQuery({
    queryKey: ['files', fileId],
    queryFn: async () => {
      const response = await apiClient.get(`/files/${fileId}`) as any
      return response.data as FileUpload
    },
    enabled: !!fileId
  })
}

// Hook for downloading files
export function useFileDownload() {
  const downloadMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiClient.post(`/files/${fileId}/download`) as any
      return (response.data as { downloadUrl: string }).downloadUrl
    },
    onSuccess: (downloadUrl) => {
      // Trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = ''
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  })

  return {
    download: downloadMutation.mutateAsync,
    isDownloading: downloadMutation.isPending,
    error: downloadMutation.error
  }
}

// Hook for creating share links
export function useCreateShareLink() {
  return useMutation({
    mutationFn: async (params: {
      fileId: string
      options?: {
        expiresIn?: number
        maxAccesses?: number
        password?: string
        allowDownload?: boolean
        allowPreview?: boolean
      }
    }) => {
      const response = await apiClient.post(`/files/${params.fileId}/share`, params.options) as any
      return response.data as FileShareLink
    }
  })
}

// Hook for deleting files
export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fileId: string) => {
      await apiClient.delete(`/files/${fileId}`)
    },
    onSuccess: (_, fileId) => {
      // Remove from all relevant queries
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.removeQueries({ queryKey: ['files', fileId] })
    }
  })
}

// Hook for file versions
export function useFileVersions(fileId: string) {
  return useQuery({
    queryKey: ['files', fileId, 'versions'],
    queryFn: async () => {
      const response = await apiClient.get(`/files/${fileId}/versions`) as any
      return response.data as FileVersion[]
    },
    enabled: !!fileId
  })
}

// Hook for creating new file version
export function useCreateFileVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      originalFileId: string
      newFile: File
      changeNotes?: string
    }) => {
      const formData = new FormData()
      formData.append('file', params.newFile)
      if (params.changeNotes) {
        formData.append('changeNotes', params.changeNotes)
      }

      const response = await apiClient.post(
        `/files/${params.originalFileId}/versions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ) as any
      return response.data as FileVersion
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files', variables.originalFileId, 'versions'] })
      queryClient.invalidateQueries({ queryKey: ['files', variables.originalFileId] })
    }
  })
}

// Hook for file preview
export function useFilePreview(fileId: string) {
  return useQuery({
    queryKey: ['files', fileId, 'preview'],
    queryFn: async () => {
      const response = await apiClient.get(`/files/${fileId}/preview`) as any
      return response.data as {
        previewUrl: string
        previewType: 'image' | 'pdf' | 'video' | 'text' | 'none'
        canPreview: boolean
      }
    },
    enabled: !!fileId
  })
}

// Hook for bulk file operations
export function useBulkFileOperations() {
  const queryClient = useQueryClient()

  const bulkDeleteMutation = useMutation({
    mutationFn: async (fileIds: string[]) => {
      await apiClient.post('/files/bulk-delete', { fileIds })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    }
  })

  const bulkMoveMutation = useMutation({
    mutationFn: async (params: {
      fileIds: string[]
      targetProjectId?: string
      targetConversationId?: string
    }) => {
      await apiClient.post('/files/bulk-move', params)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    }
  })

  return {
    bulkDelete: bulkDeleteMutation.mutateAsync,
    bulkMove: bulkMoveMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkMoving: bulkMoveMutation.isPending
  }
}

// Hook for file search
export function useFileSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<{
    category?: FileCategory
    dateRange?: { start: Date; end: Date }
    sizeRange?: { min: number; max: number }
    tags?: string[]
  }>({})

  const searchQuery_ = useQuery({
    queryKey: ['files', 'search', searchQuery, filters],
    queryFn: async () => {
      const response = await apiClient.get('/files/search', {
        params: {
          query: searchQuery,
          ...filters
        }
      }) as any
      return response.data as FileUpload[]
    },
    enabled: searchQuery.length > 2
  })

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    results: searchQuery_.data || [],
    isSearching: searchQuery_.isLoading,
    error: searchQuery_.error
  }
}

// Hook for file analytics
export function useFileAnalytics(fileId?: string, projectId?: string) {
  return useQuery({
    queryKey: ['files', 'analytics', fileId, projectId],
    queryFn: async () => {
      const params: any = {}
      if (fileId) params.fileId = fileId
      if (projectId) params.projectId = projectId

      const response = await apiClient.get('/files/analytics', { params }) as any
      return response.data as {
        totalFiles: number
        totalSize: number
        downloadCount: number
        shareCount: number
        categoryBreakdown: Record<FileCategory, number>
        recentActivity: Array<{
          action: 'upload' | 'download' | 'share' | 'delete'
          fileName: string
          timestamp: Date
          userId: string
        }>
      }
    },
    enabled: !!fileId || !!projectId
  })
}

// Hook for drag and drop file handling
export function useFileDrop(options: {
  onFilesDropped: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    
    // Filter files by accepted types
    let validFiles = files
    if (options.acceptedTypes) {
      validFiles = files.filter(file => 
        options.acceptedTypes!.some(type => file.type.match(type))
      )
    }

    // Limit number of files
    if (options.maxFiles && validFiles.length > options.maxFiles) {
      validFiles = validFiles.slice(0, options.maxFiles)
    }

    // Filter by file size
    if (options.maxSize) {
      validFiles = validFiles.filter(file => file.size <= options.maxSize!)
    }

    if (validFiles.length > 0) {
      options.onFilesDropped(validFiles)
    }
  }, [options])

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  }
}

// Utility hook for file size formatting
export function useFileUtils() {
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const getFileIcon = useCallback((mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️'
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) return '💻'
    return '📁'
  }, [])

  const isPreviewable = useCallback((mimeType: string): boolean => {
    const previewableTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'video/mp4', 'video/webm'
    ]
    return previewableTypes.includes(mimeType)
  }, [])

  return {
    formatFileSize,
    getFileIcon,
    isPreviewable
  }
}
