'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  DocumentArrowUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { ProjectCreationData } from '@/app/(dashboard)/business/projects/create/page'

interface ProjectDetailsStepProps {
  data: Partial<ProjectCreationData>
  onUpdate: (data: Partial<ProjectCreationData>) => void
  onNext: () => void
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Professional Services',
  'Construction',
  'Hospitality',
  'Agriculture',
  'Education',
  'Non-profit',
  'Government',
  'Other'
]

export function ProjectDetailsStep({ data, onUpdate, onNext }: ProjectDetailsStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!data.title?.trim()) {
      newErrors.title = 'Project title is required'
    } else if (data.title.length < 10) {
      newErrors.title = 'Project title must be at least 10 characters'
    }
    
    if (!data.description?.trim()) {
      newErrors.description = 'Project description is required'
    } else if (data.description.length < 50) {
      newErrors.description = 'Project description must be at least 50 characters'
    }
    
    if (!data.industry) {
      newErrors.industry = 'Please select an industry'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    // Filter for allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ]
    
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format.`)
        return false
      }
      return true
    })
    
    const currentFiles = data.attachments || []
    const newFiles = [...currentFiles, ...validFiles]
    
    if (newFiles.length > 5) {
      alert('Maximum 5 files allowed')
      return
    }
    
    onUpdate({ attachments: newFiles })
  }

  const removeFile = (index: number) => {
    const currentFiles = data.attachments || []
    const newFiles = currentFiles.filter((_, i) => i !== index)
    onUpdate({ attachments: newFiles })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <DocumentTextIcon className="h-8 w-8 text-red-500" />
    } else {
      return <DocumentIcon className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <p className="text-sm text-gray-600">
          Tell us about your project. The more details you provide, the better we can match you with the right talent.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Project Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Build a modern e-commerce website for our retail business"
            value={data.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500">
            Be specific and descriptive. This helps talent understand your needs.
          </p>
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Project Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your project in detail. Include what you want to achieve, any specific requirements, deliverables, and any other relevant information that would help talent understand the scope of work."
            value={data.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={6}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Minimum 50 characters</span>
            <span>{data.description?.length || 0} characters</span>
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">Industry *</Label>
          <select
            id="industry"
            value={data.industry || ''}
            onChange={(e) => onUpdate({ industry: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.industry ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-sm text-red-600">{errors.industry}</p>
          )}
        </div>

        {/* File Attachments */}
        <div className="space-y-2">
          <Label>Project Attachments (Optional)</Label>
          <p className="text-xs text-gray-500">
            Upload any relevant documents, images, or files that help explain your project (RFPs, technical specs, mockups, etc.)
          </p>
          
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={handleFileInput}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PDF, DOC, DOCX, JPG, PNG, GIF, TXT up to 10MB each (max 5 files)
            </p>
          </div>

          {/* Uploaded Files */}
          {data.attachments && data.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
              <div className="space-y-2">
                {data.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleNext}>
            Next: Skills & Requirements
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
