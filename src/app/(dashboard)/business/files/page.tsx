'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/file-sharing/file-upload'
import { FileGallery } from '@/components/file-sharing/file-gallery'
import { useAuth } from '@/lib/contexts/auth-context'

export default function BusinessFilesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
        <p className="text-gray-600">Upload, organize, and share project files with your team and talents</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="projects">Project Files</TabsTrigger>
          <TabsTrigger value="contracts">Contract Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FileGallery
            showUpload={false}
            allowBulkOperations={true}
            viewMode="grid"
          />
        </TabsContent>

        <TabsContent value="projects">
          <FileGallery
            showUpload={false}
            allowBulkOperations={true}
            viewMode="list"
          />
        </TabsContent>

        <TabsContent value="contracts">
          <FileGallery
            showUpload={false}
            allowBulkOperations={true}
            viewMode="list"
          />
        </TabsContent>

        <TabsContent value="upload">
          <FileUpload
            accessLevel="project_members"
            maxFiles={20}
            maxSize={100 * 1024 * 1024} // 100MB
            acceptedTypes={[
              'image/*',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'text/plain',
              'video/mp4',
              'video/webm',
              'application/zip'
            ]}
            onFilesUploaded={(files) => {
              console.log('Files uploaded:', files)
              setActiveTab('all')
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
