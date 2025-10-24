'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  PlusIcon, 
  AcademicCapIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  DocumentArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

interface CredentialsTabProps {
  profile: any
  addCredential: () => void
  updateCredential: (id: string, updates: any) => void
  removeCredential: (id: string) => void
  isEditing: boolean
}

export function CredentialsTab({ 
  profile, 
  addCredential, 
  updateCredential, 
  removeCredential, 
  isEditing 
}: CredentialsTabProps) {
  const [credentials, setCredentials] = useState<any[]>(profile.credentials || [])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({})

  // Update credentials when profile changes (when data is loaded from backend)
  useEffect(() => {
    console.log('🔄 Credentials: Profile changed, updating credentials from profile:', profile.credentials)
    setCredentials(profile.credentials || [])
    setHasUnsavedChanges(false)
  }, [profile.credentials])

  // Save credentials when exiting edit mode
  useEffect(() => {
    if (!isEditing && hasUnsavedChanges) {
      console.log('🔄 Credentials: Saving changes to backend...', credentials)
      saveAllCredentials()
    }
  }, [isEditing, hasUnsavedChanges])

  // Save all credentials to backend
  const saveAllCredentials = async () => {
    try {
      // Save each modified credential
      for (const credential of credentials) {
        if (credential.isModified) {
          const { isModified, ...credentialData } = credential
          await updateCredential(credential.id, credentialData)
        }
      }
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving credentials:', error)
    }
  }

  // Manual save function for debugging
  const saveCredentials = () => {
    console.log('🔄 Credentials: Manual save triggered', credentials)
    saveAllCredentials()
  }

  // Update local credential
  const updateLocalCredential = (id: string, updates: any) => {
    setCredentials(prev => prev.map(cred => 
      cred.id === id 
        ? { ...cred, ...updates, isModified: true }
        : cred
    ))
    setHasUnsavedChanges(true)
  }

  // Upload attachments to backend
  const uploadAttachments = async (credentialId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('attachments', file);
    });
    
    const response = await apiClient.post(
      `/users/credentials/${credentialId}/upload-attachments`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response as { attachments: string[], credential: any };
  };
  
  const handleFileUpload = async (credentialId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    
    // Validate files
    const validFiles = Array.from(files).filter(file => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format (PDF, DOC, DOCX, JPG, PNG only)`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File ${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setUploadingFiles(prev => ({ ...prev, [credentialId]: true }))
      
      // Upload files to backend
      const uploadResult = await uploadAttachments(credentialId, files)
      
      console.log('✅ Files uploaded successfully:', uploadResult)
      
      // Update local state with uploaded file URLs
      const credential = credentials.find((c: any) => c.id === credentialId)
      if (credential) {
        // The backend returns the updated credential with attachments as URLs
        // We'll update the local state to match the backend response
        updateLocalCredential(credentialId, {
          attachments: uploadResult.credential.attachments
        })
      }
      
    } catch (error) {
      console.error('❌ File upload failed:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [credentialId]: false }))
    }
  }

  const removeAttachment = async (credentialId: string, attachmentIndex: number) => {
    try {
      console.log('🗑️ Removing attachment:', { credentialId, attachmentIndex })
      
      const response = await apiClient.delete(
        `/users/credentials/${credentialId}/attachments/${attachmentIndex}`
      ) as { credential: any };
      
      console.log('✅ Attachment removed successfully:', response)
      
      // Update local state with the updated credential from backend
      updateLocalCredential(credentialId, {
        attachments: response.credential.attachments
      })
      
    } catch (error) {
      console.error('❌ Failed to remove attachment:', error)
      alert('Failed to remove attachment. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with unsaved changes indicator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Credentials & Education</CardTitle>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && isEditing && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Unsaved Changes
                </Badge>
              )}
              {hasUnsavedChanges && isEditing && (
                <Button onClick={saveCredentials} size="sm" variant="outline">
                  Save Credentials Now
                </Button>
              )}
              {isEditing && (
                <Button onClick={addCredential}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Add your educational background and professional certifications
            {hasUnsavedChanges && isEditing && (
              <span className="text-yellow-600 ml-2">• Click "Save Changes" to save your updates</span>
            )}
          </p>
        </CardHeader>
      </Card>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {credentials.map((credential: any) => (
          <Card key={credential.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">
                    {credential.type?.toLowerCase() === 'education' ? 'Education' : 
                     credential.type?.toLowerCase() === 'certification' ? 'Certification' :
                     credential.type?.toLowerCase() === 'license' ? 'License' :
                     credential.type?.toLowerCase() === 'course' ? 'Course' :
                     credential.type?.toLowerCase() === 'award' ? 'Award' :
                     'Credential'}
                  </CardTitle>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCredential(credential.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Credential Type */}
              <div>
                <Label>Type</Label>
                {isEditing ? (
                  <select
                    value={credential.type?.toLowerCase() || 'certification'}
                    onChange={(e) => updateLocalCredential(credential.id, { type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="degree">Degree</option>
                    <option value="certification">Certification</option>
                    <option value="license">License</option>
                    <option value="course">Course</option>
                    <option value="award">Award</option>
                  </select>
                ) : (
                  <Badge variant={credential.type?.toLowerCase() === 'education' ? 'default' : 'secondary'} className="mt-1">
                    {credential.type?.toLowerCase() === 'certification' ? 'Certification' :
                     credential.type?.toLowerCase() === 'education' ? 'Degree' :
                     credential.type?.toLowerCase() === 'license' ? 'License' :
                     credential.type?.toLowerCase() === 'course' ? 'Course' :
                     credential.type?.toLowerCase() === 'award' ? 'Award' :
                     credential.type}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <Label>Title</Label>
                {isEditing ? (
                  <Input
                    value={credential.title}
                    onChange={(e) => updateLocalCredential(credential.id, { title: e.target.value })}
                    placeholder="e.g., Bachelor of Computer Science"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="font-medium text-gray-900">{credential.title}</p>
                    {credential.verified && (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {/* Institution */}
              <div>
                <Label>Institution</Label>
                {isEditing ? (
                  <Input
                    value={credential.issuer || ''}
                    onChange={(e) => updateLocalCredential(credential.id, { issuer: e.target.value })}
                    placeholder="e.g., University of British Columbia"
                  />
                ) : (
                  <span className="text-gray-900">{credential.issuer}</span>
                )}
              </div>

              {/* Year and Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Year Obtained</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={credential.issuedDate ? new Date(credential.issuedDate).getFullYear() : ''}
                      onChange={(e) => {
                        const year = parseInt(e.target.value)
                        if (year) {
                          updateLocalCredential(credential.id, { issuedDate: new Date(year, 0, 1).toISOString() })
                        }
                      }}
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  ) : (
                    <p className="text-gray-600 mt-1">
                      {credential.issuedDate ? new Date(credential.issuedDate).getFullYear() : ''}
                    </p>
                  )}
                </div>
                {credential.type?.toLowerCase() === 'certification' && (
                  <div>
                    <Label>Expiry Date (Optional)</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={credential.expiryDate ? 
                          (typeof credential.expiryDate === 'string' 
                            ? credential.expiryDate.split('T')[0]
                            : credential.expiryDate.toISOString().split('T')[0]
                          ) : ''
                        }
                        onChange={(e) => updateLocalCredential(credential.id, { 
                          expiryDate: e.target.value ? e.target.value : null 
                        })}
                      />
                    ) : (
                      credential.expiryDate && (
                        <p className="text-gray-600 mt-1">
                          Expires: {new Date(credential.expiryDate).toLocaleDateString()}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Description (Optional)</Label>
                {isEditing ? (
                  <textarea
                    value={credential.description || ''}
                    onChange={(e) => updateLocalCredential(credential.id, { description: e.target.value })}
                    placeholder="Brief description of the credential..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                    rows={3}
                  />
                ) : (
                  credential.description && (
                    <p className="text-gray-600 mt-1">{credential.description}</p>
                  )
                )}
              </div>

              {/* Credential URL */}
              <div>
                <Label>Credential URL (Optional)</Label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={credential.credentialUrl || ''}
                    onChange={(e) => updateLocalCredential(credential.id, { credentialUrl: e.target.value })}
                    placeholder="https://example.com/verify-credential"
                  />
                ) : (
                  credential.credentialUrl && (
                    <a
                      href={credential.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-1 block text-sm"
                    >
                      View Credential
                    </a>
                  )
                )}
              </div>

              {/* Supporting Documents */}
              <div>
                <Label>Supporting Documents</Label>
                
                {/* Upload Area (Edit Mode) */}
                {isEditing && (
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {uploadingFiles[credential.id] ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading files...</p>
                      </div>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor={`file-upload-${credential.id}`} className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-500 font-medium">
                              Click to upload
                            </span>
                            <span className="text-gray-500"> or drag and drop</span>
                            <input
                              id={`file-upload-${credential.id}`}
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(credential.id, e.target.files)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, JPG, PNG up to 5MB each
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Attached Files */}
                {credential.attachments && credential.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {credential.attachments.map((attachment: any, index: number) => {
                      // Handle both URL strings and attachment objects
                      const isUrl = typeof attachment === 'string';
                      const fileName = isUrl ? attachment.split('/').pop() || 'Document' : attachment.name;
                      const fileUrl = isUrl ? attachment : attachment.url;
                      const fileSize = isUrl ? '' : attachment.size;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <DocumentArrowUpIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{fileName}</span>
                            {fileSize && <span className="text-xs text-gray-500">({fileSize})</span>}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(fileUrl, '_blank')}
                              title="View attachment"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {isEditing && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeAttachment(credential.id, index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove attachment"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {credentials.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <AcademicCapIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials added yet</h3>
            <p className="text-gray-600 mb-4">
              Add your education, certifications, and licenses to build credibility
            </p>
            {isEditing && (
              <Button onClick={addCredential}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Credential
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
