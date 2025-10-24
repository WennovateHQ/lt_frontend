'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/file-sharing/file-upload'
import { FileGallery } from '@/components/file-sharing/file-gallery'
import { useAuth } from '@/lib/contexts/auth-context'

export default function TalentFilesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
        <p className="text-gray-600">Manage your portfolio, project deliverables, and shared documents</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <FileGallery
            showUpload={false}
            allowBulkOperations={true}
            viewMode="grid"
          />
        </TabsContent>

        <TabsContent value="portfolio">
          <FileGallery
            showUpload={false}
            allowBulkOperations={true}
            viewMode="grid"
          />
        </TabsContent>

        <TabsContent value="deliverables">
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
            maxFiles={15}
            maxSize={50 * 1024 * 1024} // 50MB
            acceptedTypes={[
              'image/*',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'text/plain',
              'video/mp4',
              'video/webm',
              'application/zip',
              'audio/*'
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
