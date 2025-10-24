'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api/client'
// Note: Using simple alerts for now - can be replaced with proper toast library later

const PROJECT_TYPES = [
  { value: 'FIXED_PRICE', label: 'Fixed Price' },
  { value: 'HOURLY', label: 'Hourly Rate' },
  { value: 'CONTRACT', label: 'Contract' }
]

const PROJECT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PAUSED', label: 'Paused' }
]

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FIXED_PRICE',
    budgetMin: '',
    budgetMax: '',
    hourlyRate: '',
    status: 'DRAFT',
    skills: [] as string[],
    city: '',
    duration: '',
    startDate: '',
    workArrangement: ''
  })
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true)
        console.log('🔍 Fetching project for editing:', params.id)
        const projectData: any = await apiClient.get(`/projects/${params.id}`)
        console.log('📋 Project data received:', projectData)
        
        setProject(projectData)
        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          type: projectData.type || 'FIXED_PRICE',
          budgetMin: projectData.budgetMin?.toString() || '',
          budgetMax: projectData.budgetMax?.toString() || '',
          hourlyRate: projectData.hourlyRate?.toString() || '',
          status: projectData.status || 'DRAFT',
          skills: projectData.skills?.map((skill: any) => skill.name || skill) || [],
          city: projectData.city || '',
          duration: projectData.duration || '',
          startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
          workArrangement: projectData.workArrangement || projectData.type || ''
        })
      } catch (error) {
        console.error('Failed to fetch project:', error)
        console.error('Failed to load project details')
        alert('Failed to load project details. Redirecting to projects list.')
        router.push('/business/projects')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      console.log('💾 Saving project changes:', formData)
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        budgetMin: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        status: formData.status,
        city: formData.city,
        duration: formData.duration,
        startDate: formData.startDate || null,
        workArrangement: formData.workArrangement,
        // Skills update re-enabled with proper backend handling
        skills: formData.skills
      }

      const updatedProject = await apiClient.put(`/projects/${params.id}`, updateData)
      console.log('✅ Project updated successfully:', updatedProject)
      
      console.log('Project updated successfully!')
      alert('Project updated successfully!')
      router.push(`/business/projects/${params.id}`)
    } catch (error) {
      console.error('Failed to update project:', error)
      console.error('Failed to update project. Please try again.')
      alert('Failed to update project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!project) {
    return <div className="flex justify-center items-center h-64">Project not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/business/projects/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600">Update your project details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project requirements, goals, and expectations"
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Project Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Project Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.type === 'HOURLY' ? (
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      placeholder="Enter hourly rate"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budgetMin">Minimum Budget ($)</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                        placeholder="Enter minimum budget"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budgetMax">Maximum Budget ($)</Label>
                      <Input
                        id="budgetMax"
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                        placeholder="Enter maximum budget"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Project Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 2-3 months, 6 weeks"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Preferred Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Required Skills</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button type="button" onClick={handleAddSkill} variant="outline">
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location & Work Arrangement */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="city">City/Location</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g., Vancouver, BC"
                  />
                </div>

                <div>
                  <Label htmlFor="workArrangement">Work Arrangement</Label>
                  <Select value={formData.workArrangement} onValueChange={(value) => handleInputChange('workArrangement', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work arrangement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/business/projects/${params.id}`} className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
