export interface FileUpload {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  fileUrl: string
  thumbnailUrl?: string
  uploadedBy: string
  uploadedAt: Date
  projectId?: string
  conversationId?: string
  messageId?: string
  applicationId?: string
  contractId?: string
  escrowId?: string
  milestoneId?: string
  category: FileCategory
  status: 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted'
  virusScanStatus?: 'clean' | 'infected' | 'scanning' | 'failed'
  metadata: FileMetadata
  accessLevel: 'public' | 'project_members' | 'private'
  downloadCount: number
  lastAccessedAt?: Date
  expiresAt?: Date
  versions?: any[]
  shareUrl?: string
}

export type FileCategory = 
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'code'
  | 'design'
  | 'other'

export interface FileMetadata {
  width?: number
  height?: number
  duration?: number
  pages?: number
  hasPreview: boolean
  isProcessed: boolean
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'failed'
  tags: string[]
  description?: string
  version?: number
  parentFileId?: string
}

export interface FileShareLink {
  id: string
  fileId: string
  token: string
  shareUrl?: string
  createdBy: string
  createdAt: Date
  expiresAt?: Date
  accessCount: number
  maxAccesses?: number
  password?: string
  allowDownload: boolean
  allowPreview: boolean
  isActive: boolean
}

export interface FileVersion {
  id: string
  fileId: string
  version: number
  fileName: string
  fileSize: number
  fileUrl: string
  uploadedBy: string
  uploadedAt: Date
  changeNotes?: string
  isCurrentVersion: boolean
}

/**
 * Upload file to cloud storage
 */
export async function uploadFile(
  file: File,
  options: {
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
  } = {}
): Promise<FileUpload> {
  // Validate file
  validateFile(file)

  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const fileName = `${fileId}_${sanitizeFileName(file.name)}`
  
  // Determine file category
  const category = options.category || determineFileCategory(file.type)
  
  // Create file record
  const fileUpload: FileUpload = {
    id: fileId,
    fileName,
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fileUrl: '', // Will be set after upload
    uploadedBy: 'current_user_id', // In real app, get from auth context
    uploadedAt: new Date(),
    projectId: options.projectId,
    conversationId: options.conversationId,
    messageId: options.messageId,
    applicationId: options.applicationId,
    contractId: options.contractId,
    escrowId: options.escrowId,
    milestoneId: options.milestoneId,
    category,
    status: 'uploading',
    metadata: {
      hasPreview: false,
      isProcessed: false,
      virusScanStatus: 'pending',
      tags: options.tags || [],
      description: options.description
    },
    accessLevel: options.accessLevel || 'project_members',
    downloadCount: 0
  }

  try {
    // Upload to cloud storage (AWS S3, Google Cloud, etc.)
    const uploadResult = await uploadToCloudStorage(file, fileName, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedBy: fileUpload.uploadedBy,
        category,
        projectId: options.projectId
      }
    })

    fileUpload.fileUrl = uploadResult.url
    fileUpload.status = 'processing'

    // Generate thumbnail for images/videos
    if (category === 'image' || category === 'video') {
      try {
        const thumbnailUrl = await generateThumbnail(uploadResult.url, file.type)
        fileUpload.thumbnailUrl = thumbnailUrl
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error)
      }
    }

    // Extract metadata
    if (category === 'image') {
      const imageMetadata = await extractImageMetadata(file)
      fileUpload.metadata.width = imageMetadata.width
      fileUpload.metadata.height = imageMetadata.height
    } else if (category === 'video') {
      const videoMetadata = await extractVideoMetadata(file)
      fileUpload.metadata.width = videoMetadata.width
      fileUpload.metadata.height = videoMetadata.height
      fileUpload.metadata.duration = videoMetadata.duration
    } else if (category === 'document') {
      const docMetadata = await extractDocumentMetadata(file)
      fileUpload.metadata.pages = docMetadata.pages
    }

    // Virus scan
    const scanResult = await performVirusScan(uploadResult.url)
    fileUpload.metadata.virusScanStatus = scanResult.status

    if (scanResult.status === 'infected') {
      fileUpload.status = 'failed'
      await deleteFromCloudStorage(uploadResult.url)
      throw new Error('File failed virus scan')
    }

    fileUpload.status = 'ready'
    fileUpload.metadata.isProcessed = true
    fileUpload.metadata.hasPreview = canGeneratePreview(file.type)

    // Save to database
    await saveFileRecord(fileUpload)

    console.log('File uploaded successfully:', fileUpload)
    return fileUpload

  } catch (error) {
    fileUpload.status = 'failed'
    console.error('File upload failed:', error)
    throw error
  }
}

/**
 * Download file
 */
export async function downloadFile(fileId: string, userId: string): Promise<string> {
  const file = await getFileById(fileId)
  
  if (!file) {
    throw new Error('File not found')
  }

  // Check access permissions
  if (!hasFileAccess(file, userId)) {
    throw new Error('Access denied')
  }

  // Increment download count
  await incrementDownloadCount(fileId)

  // Generate signed URL for secure download
  const downloadUrl = await generateSignedDownloadUrl(file.fileUrl, {
    expiresIn: 3600, // 1 hour
    fileName: file.originalName,
    contentDisposition: 'attachment'
  })

  return downloadUrl
}

/**
 * Create shareable link
 */
export async function createShareLink(
  fileId: string,
  userId: string,
  options: {
    expiresIn?: number // seconds
    maxAccesses?: number
    password?: string
    allowDownload?: boolean
    allowPreview?: boolean
  } = {}
): Promise<FileShareLink> {
  const file = await getFileById(fileId)
  
  if (!file) {
    throw new Error('File not found')
  }

  if (!hasFileAccess(file, userId)) {
    throw new Error('Access denied')
  }

  const shareLink: FileShareLink = {
    id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fileId,
    token: generateSecureToken(),
    createdBy: userId,
    createdAt: new Date(),
    expiresAt: options.expiresIn ? new Date(Date.now() + options.expiresIn * 1000) : undefined,
    accessCount: 0,
    maxAccesses: options.maxAccesses,
    password: options.password ? await hashPassword(options.password) : undefined,
    allowDownload: options.allowDownload ?? true,
    allowPreview: options.allowPreview ?? true,
    isActive: true
  }

  await saveShareLink(shareLink)
  return shareLink
}

/**
 * Get files by context
 */
export async function getFilesByContext(context: {
  projectId?: string
  conversationId?: string
  applicationId?: string
  contractId?: string
  escrowId?: string
  milestoneId?: string
}, userId: string): Promise<FileUpload[]> {
  const files = await queryFiles(context)
  
  // Filter by access permissions
  return files.filter(file => hasFileAccess(file, userId))
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string, userId: string): Promise<void> {
  const file = await getFileById(fileId)
  
  if (!file) {
    throw new Error('File not found')
  }

  // Check if user can delete (owner or admin)
  if (file.uploadedBy !== userId && !isAdmin(userId)) {
    throw new Error('Access denied')
  }

  // Soft delete - mark as deleted
  file.status = 'deleted'
  await updateFileRecord(file)

  // Schedule for permanent deletion after grace period
  await scheduleFileDeletion(fileId, 30) // 30 days
}

/**
 * Create new file version
 */
export async function createFileVersion(
  originalFileId: string,
  newFile: File,
  userId: string,
  changeNotes?: string
): Promise<FileVersion> {
  const originalFile = await getFileById(originalFileId)
  
  if (!originalFile) {
    throw new Error('Original file not found')
  }

  if (!hasFileAccess(originalFile, userId)) {
    throw new Error('Access denied')
  }

  // Upload new version
  const newFileUpload = await uploadFile(newFile, {
    projectId: originalFile.projectId,
    conversationId: originalFile.conversationId,
    category: originalFile.category,
    accessLevel: originalFile.accessLevel
  })

  // Get current version number
  const versions = await getFileVersions(originalFileId)
  const nextVersion = Math.max(...versions.map(v => v.version), 0) + 1

  // Create version record
  const fileVersion: FileVersion = {
    id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fileId: originalFileId,
    version: nextVersion,
    fileName: newFileUpload.fileName,
    fileSize: newFileUpload.fileSize,
    fileUrl: newFileUpload.fileUrl,
    uploadedBy: userId,
    uploadedAt: new Date(),
    changeNotes,
    isCurrentVersion: true
  }

  // Mark previous versions as not current
  await markPreviousVersionsAsOld(originalFileId)
  
  // Save new version
  await saveFileVersion(fileVersion)

  // Update original file metadata
  originalFile.metadata.version = nextVersion
  originalFile.metadata.parentFileId = newFileUpload.id
  await updateFileRecord(originalFile)

  return fileVersion
}

// Helper functions

function validateFile(file: File): void {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/json', 'application/xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ]

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`)
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
}

function determineFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive'
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml')) return 'code'
  return 'other'
}

function canGeneratePreview(mimeType: string): boolean {
  const previewableTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'video/mp4', 'video/webm'
  ]
  return previewableTypes.includes(mimeType)
}

function hasFileAccess(file: FileUpload, userId: string): boolean {
  // File owner always has access
  if (file.uploadedBy === userId) return true
  
  // Admin always has access
  if (isAdmin(userId)) return true
  
  // Public files are accessible to all
  if (file.accessLevel === 'public') return true
  
  // Project members have access to project files
  if (file.accessLevel === 'project_members' && file.projectId) {
    return isProjectMember(file.projectId, userId)
  }
  
  return false
}

function generateSecureToken(): string {
  return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
}

// Mock implementations - these would be real implementations in production

async function uploadToCloudStorage(file: File, fileName: string, options: any): Promise<{ url: string }> {
  // Mock implementation
  return { url: `https://storage.example.com/files/${fileName}` }
}

async function generateThumbnail(fileUrl: string, mimeType: string): Promise<string> {
  // Mock implementation
  return `https://storage.example.com/thumbnails/${Date.now()}.jpg`
}

async function extractImageMetadata(file: File): Promise<{ width: number; height: number }> {
  // Mock implementation
  return { width: 1920, height: 1080 }
}

async function extractVideoMetadata(file: File): Promise<{ width: number; height: number; duration: number }> {
  // Mock implementation
  return { width: 1920, height: 1080, duration: 120 }
}

async function extractDocumentMetadata(file: File): Promise<{ pages: number }> {
  // Mock implementation
  return { pages: 10 }
}

async function performVirusScan(fileUrl: string): Promise<{ status: 'clean' | 'infected' | 'failed' }> {
  // Mock implementation
  return { status: 'clean' }
}

async function deleteFromCloudStorage(fileUrl: string): Promise<void> {
  // Mock implementation
  console.log('Deleted from cloud storage:', fileUrl)
}

async function generateSignedDownloadUrl(fileUrl: string, options: any): Promise<string> {
  // Mock implementation
  return `${fileUrl}?signed=true&expires=${Date.now() + options.expiresIn * 1000}`
}

async function hashPassword(password: string): Promise<string> {
  // Mock implementation
  return `hashed_${password}`
}

// Database operations - these would connect to real database

async function saveFileRecord(file: FileUpload): Promise<void> {
  console.log('Saved file record:', file.id)
}

async function getFileById(fileId: string): Promise<FileUpload | null> {
  // Mock implementation
  return null
}

async function updateFileRecord(file: FileUpload): Promise<void> {
  console.log('Updated file record:', file.id)
}

async function incrementDownloadCount(fileId: string): Promise<void> {
  console.log('Incremented download count for:', fileId)
}

async function saveShareLink(shareLink: FileShareLink): Promise<void> {
  console.log('Saved share link:', shareLink.id)
}

async function queryFiles(context: any): Promise<FileUpload[]> {
  // Mock implementation
  return []
}

async function scheduleFileDeletion(fileId: string, days: number): Promise<void> {
  console.log(`Scheduled deletion for ${fileId} in ${days} days`)
}

async function getFileVersions(fileId: string): Promise<FileVersion[]> {
  // Mock implementation
  return []
}

async function markPreviousVersionsAsOld(fileId: string): Promise<void> {
  console.log('Marked previous versions as old for:', fileId)
}

async function saveFileVersion(version: FileVersion): Promise<void> {
  console.log('Saved file version:', version.id)
}

// Permission checks

function isAdmin(userId: string): boolean {
  // Mock implementation
  return false
}

function isProjectMember(projectId: string, userId: string): boolean {
  // Mock implementation
  return true
}
