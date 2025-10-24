'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import {
  useFiles,
  useFileDownload,
  useDeleteFile,
  useCreateShareLink,
  useFileUtils,
  useBulkFileOperations
} from '@/lib/hooks/use-file-sharing'
import { FileUpload, FileCategory } from '@/lib/file-sharing/file-manager'
import { formatDate } from '@/lib/utils'
import { FilePreviewModal } from './file-preview-modal'
import { ShareLinkModal } from './share-link-modal'

interface FileGalleryProps {
  projectId?: string
  conversationId?: string
  applicationId?: string
  contractId?: string
  escrowId?: string
  milestoneId?: string
  showUpload?: boolean
  allowBulkOperations?: boolean
  viewMode?: 'grid' | 'list'
  className?: string
}

export function FileGallery({
  projectId,
  conversationId,
  applicationId,
  contractId,
  escrowId,
  milestoneId,
  showUpload = true,
  allowBulkOperations = true,
  viewMode: initialViewMode = 'grid',
  className
}: FileGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState(initialViewMode)
  const [categoryFilter, setCategoryFilter] = useState<FileCategory | 'all'>('all')
  const [previewFile, setPreviewFile] = useState<FileUpload | null>(null)
  const [shareFile, setShareFile] = useState<FileUpload | null>(null)

  const context = {
    projectId,
    conversationId,
    applicationId,
    contractId,
    escrowId,
    milestoneId
  }

  const { data: files = [], isLoading, error } = useFiles(context)
  const { download } = useFileDownload()
  const deleteFileMutation = useDeleteFile()
  const createShareLinkMutation = useCreateShareLink()
  const { formatFileSize, getFileIcon, isPreviewable } = useFileUtils()
  const { bulkDelete } = useBulkFileOperations()

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleFileSelect = (fileId: string, selected: boolean) => {
    if (selected) {
      setSelectedFiles(prev => [...prev, fileId])
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedFiles(filteredFiles.map(f => f.id))
    } else {
      setSelectedFiles([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return
    
    try {
      await bulkDelete(selectedFiles)
      setSelectedFiles([])
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const handleDownload = async (file: FileUpload) => {
    try {
      await download(file.id)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (file: FileUpload) => {
    try {
      await deleteFileMutation.mutateAsync(file.id)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleShare = async (file: FileUpload) => {
    setShareFile(file)
  }

  const categories: Array<{ value: FileCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Files' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'archive', label: 'Archives' },
    { value: 'code', label: 'Code' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          Failed to load files. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Files</h2>
          <p className="text-gray-600">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
            {files.length !== filteredFiles.length && ` (${files.length} total)`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <ListBulletIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Bulk Actions */}
          {allowBulkOperations && selectedFiles.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete ({selectedFiles.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FunnelIcon className="w-4 h-4 mr-2" />
              {categories.find(c => c.value === categoryFilter)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categories.map(category => (
              <DropdownMenuItem
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
              >
                {category.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Selection */}
      {allowBulkOperations && filteredFiles.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <Checkbox
            checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            Select all ({filteredFiles.length} files)
          </span>
        </div>
      )}

      {/* Files Grid/List */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DocumentIcon className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600 text-center">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload some files to get started'
              }
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <FileGridItem
              key={file.id}
              file={file}
              selected={selectedFiles.includes(file.id)}
              onSelect={allowBulkOperations ? (selected) => handleFileSelect(file.id, selected) : undefined}
              onPreview={() => setPreviewFile(file)}
              onDownload={() => handleDownload(file)}
              onShare={() => handleShare(file)}
              onDelete={() => handleDelete(file)}
              formatFileSize={formatFileSize}
              getFileIcon={getFileIcon}
              isPreviewable={isPreviewable}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredFiles.map(file => (
                <FileListItem
                  key={file.id}
                  file={file}
                  selected={selectedFiles.includes(file.id)}
                  onSelect={allowBulkOperations ? (selected) => handleFileSelect(file.id, selected) : undefined}
                  onPreview={() => setPreviewFile(file)}
                  onDownload={() => handleDownload(file)}
                  onShare={() => handleShare(file)}
                  onDelete={() => handleDelete(file)}
                  formatFileSize={formatFileSize}
                  getFileIcon={getFileIcon}
                  isPreviewable={isPreviewable}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {shareFile && (
        <ShareLinkModal
          file={shareFile}
          onClose={() => setShareFile(null)}
        />
      )}
    </div>
  )
}

// Grid Item Component
function FileGridItem({
  file,
  selected,
  onSelect,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  formatFileSize,
  getFileIcon,
  isPreviewable
}: {
  file: FileUpload
  selected: boolean
  onSelect?: (selected: boolean) => void
  onPreview: () => void
  onDownload: () => void
  onShare: () => void
  onDelete: () => void
  formatFileSize: (size: number) => string
  getFileIcon: (mimeType: string) => string
  isPreviewable: (mimeType: string) => boolean
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="flex justify-end mb-2">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
            />
          </div>
        )}

        {/* File Icon/Thumbnail */}
        <div className="flex items-center justify-center h-16 mb-3">
          {file.thumbnailUrl ? (
            <img
              src={file.thumbnailUrl}
              alt={file.originalName}
              className="max-h-16 max-w-full object-contain rounded"
            />
          ) : (
            <span className="text-4xl">{getFileIcon(file.mimeType)}</span>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate" title={file.originalName}>
            {file.originalName}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{formatFileSize(file.fileSize)}</span>
            <Badge variant="secondary" className="text-xs">
              {file.category}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>{formatDate(file.uploadedAt)}</span>
          </div>

          {file.metadata.tags.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TagIcon className="w-3 h-3" />
              <span className="truncate">{file.metadata.tags.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-1">
            {isPreviewable(file.mimeType) && (
              <Button variant="ghost" size="sm" onClick={onPreview}>
                <EyeIcon className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <ArrowDownTrayIcon className="w-4 h-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onShare}>
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

// List Item Component
function FileListItem({
  file,
  selected,
  onSelect,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  formatFileSize,
  getFileIcon,
  isPreviewable
}: {
  file: FileUpload
  selected: boolean
  onSelect?: (selected: boolean) => void
  onPreview: () => void
  onDownload: () => void
  onShare: () => void
  onDelete: () => void
  formatFileSize: (size: number) => string
  getFileIcon: (mimeType: string) => string
  isPreviewable: (mimeType: string) => boolean
}) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
      {/* Selection */}
      {onSelect && (
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
        />
      )}

      {/* File Icon */}
      <div className="flex-shrink-0">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.originalName}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{file.originalName}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
          <span>{formatFileSize(file.fileSize)}</span>
          <Badge variant="secondary" className="text-xs">
            {file.category}
          </Badge>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
          {file.metadata.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              <span className="truncate">{file.metadata.tags.slice(0, 2).join(', ')}</span>
              {file.metadata.tags.length > 2 && <span>+{file.metadata.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isPreviewable(file.mimeType) && (
          <Button variant="ghost" size="sm" onClick={onPreview}>
            <EyeIcon className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDownload}>
          <ArrowDownTrayIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onShare}>
          <ShareIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
