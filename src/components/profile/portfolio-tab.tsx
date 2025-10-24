'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, XMarkIcon, EyeIcon, BriefcaseIcon, PhotoIcon, CheckIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'

interface PortfolioTabProps {
  profile: any
  addPortfolioItem: () => void
  updatePortfolioItem: (id: string, updates: any) => void
  removePortfolioItem: (id: string) => void
  isEditing: boolean
}

export function PortfolioTab({ 
  profile, 
  addPortfolioItem, 
  updatePortfolioItem, 
  removePortfolioItem, 
  isEditing 
}: PortfolioTabProps) {
  // Local state for editing items
  const [editingItems, setEditingItems] = useState<{[key: string]: any}>({})
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({})
  
  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up any blob URLs when component unmounts
      Object.values(editingItems).forEach((item: any) => {
        if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.imageUrl)
        }
      })
    }
  }, [editingItems])

  // Initialize editing state for an item
  const startEditing = (item: any) => {
    setEditingItems(prev => ({
      ...prev,
      [item.id]: { ...item }
    }))
  }

  // Update local editing state
  const updateEditingItem = (id: string, field: string, value: any) => {
    setEditingItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  // Save changes
  const saveItem = (id: string) => {
    const editedItem = editingItems[id]
    if (editedItem) {
      // Clean up blob URL if it exists
      if (editedItem.imageUrl && editedItem.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(editedItem.imageUrl)
      }
      
      // Remove file-related fields before sending to backend
      const { imageFile, isUploadingImage, ...itemData } = editedItem
      updatePortfolioItem(id, itemData)
      setEditingItems(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    }
  }

  // Cancel editing
  const cancelEditing = (id: string) => {
    setEditingItems(prev => {
      const item = prev[id]
      // Clean up blob URL if it exists
      if (item && item.imageUrl && item.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageUrl)
      }
      
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  // Handle image upload
  const handleImageUpload = async (id: string, file: File) => {
    try {
      updateEditingItem(id, 'isUploadingImage', true)
      
      console.log('📸 Starting portfolio image upload...', { fileName: file.name, size: file.size })
      
      // Upload the image to get the permanent URL using API client
      const formData = new FormData()
      formData.append('image', file)
      
      // Use apiClient.post with FormData - it will handle the correct base URL
      const result = await apiClient.post('/users/portfolio/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }) as { imageUrl: string }
      
      console.log('✅ Portfolio image uploaded successfully:', result)
      
      // Update with the permanent URL directly - no blob URL needed
      updateEditingItem(id, 'imageUrl', result.imageUrl)
      updateEditingItem(id, 'imageFile', null) // Clear the file since it's uploaded
      updateEditingItem(id, 'isUploadingImage', false)
      
    } catch (error) {
      console.error('❌ Portfolio image upload failed:', error)
      updateEditingItem(id, 'isUploadingImage', false)
      
      // Revert to original image if upload fails
      const originalItem = profile.portfolio.find((item: any) => item.id === id)
      if (originalItem) {
        updateEditingItem(id, 'imageUrl', originalItem.imageUrl)
      } else {
        updateEditingItem(id, 'imageUrl', null)
      }
      
      alert('Failed to upload image. Please try again.')
    }
  }

  // Get current item data (either from editing state or original)
  const getCurrentItem = (item: any) => {
    return editingItems[item.id] || item
  }

  // Check if item is being edited
  const isItemEditing = (id: string) => {
    return editingItems.hasOwnProperty(id)
  }
  return (
    <div className="space-y-6">
      {/* Add Portfolio Item Button */}
      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={addPortfolioItem}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Portfolio Item
          </Button>
        </div>
      )}

      {/* Portfolio Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.portfolio.map((item: any) => {
          const currentItem = getCurrentItem(item)
          const itemIsEditing = isItemEditing(item.id)
          
          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {itemIsEditing ? (
                      <Input
                        value={currentItem.title}
                        onChange={(e) => updateEditingItem(item.id, 'title', e.target.value)}
                        placeholder="Project Title"
                      />
                    ) : (
                      currentItem.title
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {itemIsEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveItem(item.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelEditing(item.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Button>
                        )}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolioItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Image */}
                <div className="bg-gray-100 rounded-lg overflow-hidden relative" style={{ aspectRatio: '1 / 1' }}>
                  {currentItem.imageUrl ? (
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                        <p>No image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Image Upload Button */}
                  {itemIsEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {currentItem.isUploadingImage ? (
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm">Uploading...</p>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRefs.current[item.id]?.click()}
                        >
                          <PhotoIcon className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      )}
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current[item.id] = el
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload(item.id, file)
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  {itemIsEditing ? (
                    <Textarea
                      value={currentItem.description}
                      onChange={(e) => updateEditingItem(item.id, 'description', e.target.value)}
                      placeholder="Describe this project, your role, and key achievements..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-700 text-sm">{currentItem.description}</p>
                  )}
                </div>

                {/* Project URL */}
                <div>
                  {itemIsEditing ? (
                    <Input
                      value={currentItem.projectUrl || ''}
                      onChange={(e) => updateEditingItem(item.id, 'projectUrl', e.target.value)}
                      placeholder="https://project-url.com"
                    />
                  ) : (
                    currentItem.projectUrl && (
                      <a
                        href={currentItem.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Live Project
                      </a>
                    )
                  )}
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Technologies Used</h4>
                  {itemIsEditing ? (
                    <Input
                      value={Array.isArray(currentItem.technologies) ? currentItem.technologies.join(', ') : ''}
                      onChange={(e) => updateEditingItem(item.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      placeholder="React, Node.js, MongoDB (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {currentItem.technologies?.map((tech: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completion Date */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Completion Date</h4>
                  {itemIsEditing ? (
                    <Input
                      type="date"
                      value={currentItem.completedAt ? 
                        (typeof currentItem.completedAt === 'string' 
                          ? currentItem.completedAt.split('T')[0]
                          : (() => {
                              const date = new Date(currentItem.completedAt)
                              const year = date.getFullYear()
                              const month = String(date.getMonth() + 1).padStart(2, '0')
                              const day = String(date.getDate()).padStart(2, '0')
                              return `${year}-${month}-${day}`
                            })()
                        ) : ''
                      }
                      onChange={(e) => updateEditingItem(item.id, 'completedAt', e.target.value)}
                    />
                  ) : (
                    <div className="text-sm text-gray-700">
                      {currentItem.completedAt ? (
                        typeof currentItem.completedAt === 'string' 
                          ? new Date(currentItem.completedAt).toLocaleDateString()
                          : currentItem.completedAt.toLocaleDateString()
                      ) : 'Not set'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {profile.portfolio.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <BriefcaseIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
            <p className="text-gray-600 mb-4">
              Showcase your best work to attract more clients
            </p>
            {isEditing && (
              <Button onClick={addPortfolioItem}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
