'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowDownTrayIcon,
  ShareIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { FileUpload } from '@/lib/file-sharing/file-manager'
import { useFilePreview, useFileDownload } from '@/lib/hooks/use-file-sharing'
import { formatDate, formatCurrency } from '@/lib/utils'

interface FilePreviewModalProps {
  file: FileUpload
  onClose: () => void
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const { data: previewData } = useFilePreview(file.id)
  const { download } = useFileDownload()

  const handleDownload = async () => {
    try {
      await download(file.id)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const getFileIcon = () => {
    if (file.mimeType.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />
    }
    if (file.mimeType.startsWith('video/')) {
      return <VideoCameraIcon className="w-8 h-8 text-purple-500" />
    }
    if (file.mimeType.startsWith('audio/')) {
      return <SpeakerWaveIcon className="w-8 h-8 text-green-500" />
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />
  }

  const renderPreview = () => {
    if (!previewData?.canPreview) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          {getFileIcon()}
          <p className="mt-4 text-gray-600">Preview not available for this file type</p>
          <Button onClick={handleDownload} className="mt-4">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Download to View
          </Button>
        </div>
      )
    }

    switch (previewData.previewType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={previewData.previewUrl}
              alt={file.originalName}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        )
      
      case 'video':
        return (
          <video
            src={previewData.previewUrl}
            controls
            className="w-full max-h-96 rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        )
      
      case 'pdf':
        return (
          <iframe
            src={previewData.previewUrl}
            className="w-full h-96 rounded-lg border"
            title={file.originalName}
          />
        )
      
      case 'text':
        return (
          <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">{previewData.previewUrl}</pre>
          </div>
        )
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
            {getFileIcon()}
            <p className="mt-4 text-gray-600">Preview not available</p>
          </div>
        )
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {getFileIcon()}
              <div>
                <h2 className="text-lg font-semibold">{file.originalName}</h2>
                <p className="text-sm text-gray-600">
                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.mimeType}
                </p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Preview */}
          <div className="border rounded-lg p-4">
            {renderPreview()}
          </div>

          {/* File Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">File Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Name:</span>
                  <span className="font-medium">{file.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="font-medium">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Type:</span>
                  <span className="font-medium">{file.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="secondary">{file.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="font-medium">{formatDate(file.uploadedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access Level:</span>
                  <Badge variant="outline">{file.accessLevel.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Additional Details</h3>
              <div className="space-y-2 text-sm">
                {file.metadata.description && (
                  <div>
                    <span className="text-gray-600 block mb-1">Description:</span>
                    <p className="text-gray-900">{file.metadata.description}</p>
                  </div>
                )}
                
                {file.metadata.tags.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-2">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {file.metadata.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">{file.downloadCount || 0}</span>
                </div>

                {file.virusScanStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Virus Scan:</span>
                    <Badge 
                      variant={file.virusScanStatus === 'clean' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {file.virusScanStatus}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Version History */}
          {file.versions && file.versions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Version History</h3>
              <div className="space-y-2">
                {file.versions.map((version, index) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Version {file.versions!.length - index}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(version.createdAt)} • {(version.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {version.changeNotes && (
                        <p className="text-sm text-gray-500 mt-1">{version.changeNotes}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
