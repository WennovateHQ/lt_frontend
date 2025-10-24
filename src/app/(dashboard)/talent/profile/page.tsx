'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PencilIcon,
  StarIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EyeIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

// Import Profile Components
import { OverviewTab } from '@/components/profile/overview-tab'
import { SkillsTab } from '@/components/profile/skills-tab'
import { PortfolioTab } from '@/components/profile/portfolio-tab'
import { CredentialsTab } from '@/components/profile/credentials-tab'
import { RatesTab } from '@/components/profile/rates-tab'
import { PreferencesTab } from '@/components/profile/preferences-tab'

function TalentProfileContent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Load profile data from backend
  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/users/profile')
      setProfile((response as any).user)
      setError(null)
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Portfolio handlers
  const addPortfolioItem = async () => {
    try {
      await apiClient.post('/users/portfolio', {
        title: 'New Project',
        description: 'Project description',
        projectUrl: '',
        imageUrl: '',
        technologies: []
      })
      await loadProfile()
      toast.success('Portfolio item added')
    } catch (error) {
      console.error('Error adding portfolio item:', error)
      toast.error('Failed to add portfolio item')
    }
  }

  const updatePortfolioItem = async (id: string, updates: any) => {
    try {
      await apiClient.put(`/users/portfolio/${id}`, updates)
      await loadProfile()
      toast.success('Portfolio item updated')
    } catch (error) {
      console.error('Error updating portfolio item:', error)
      toast.error('Failed to update portfolio item')
    }
  }

  const removePortfolioItem = async (id: string) => {
    try {
      await apiClient.delete(`/users/portfolio/${id}`)
      await loadProfile()
      toast.success('Portfolio item removed')
    } catch (error) {
      console.error('Error removing portfolio item:', error)
      toast.error('Failed to remove portfolio item')
    }
  }

  // Avatar upload handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      console.log('📸 Uploading avatar:', { name: file.name, size: file.size, type: file.type })
      
      const formData = new FormData()
      formData.append('avatar', file, file.name)
      
      // Log FormData contents for debugging
      console.log('📦 FormData created with avatar field')
      
      // Use apiClient - Axios will automatically set correct Content-Type with boundary
      const response = await apiClient.post('/users/avatar', formData)
      
      console.log('✅ Avatar uploaded successfully:', response)
      
      // Reload profile to get updated avatar
      await loadProfile()
      toast.success('Profile picture updated successfully!')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.error || 'Failed to upload profile picture')
    }
  }

  // Skills handlers
  // Updated skills handler for new format
  const handleSkillsChange = async (skills: Array<{name: string, level: number, years: number, category?: string}>) => {
    try {
      console.log('🔄 Profile: handleSkillsChange called with skills:', skills)
      
      // Make API call to save skills to database first
      await apiClient.put('/users/skills', {
        skills: skills
      })
      
      // Reload profile from backend to get updated data
      await loadProfile()
      
      toast.success('Skills updated')
    } catch (error) {
      console.error('Error updating skills:', error)
      toast.error('Failed to update skills')
      
      // Revert local state on error by reloading
      await loadProfile()
    }
  }

  // Profile update handler
  const updateProfile = async (profileData: any) => {
    try {
      await apiClient.put('/users/profile', profileData)
      await loadProfile()
      toast.success('Profile updated')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  // Location update handler
  const updateLocation = async (locationData: any) => {
    try {
      await apiClient.put('/users/location', locationData)
      await loadProfile()
      toast.success('Location updated')
    } catch (error) {
      console.error('Error updating location:', error)
      toast.error('Failed to update location')
    }
  }

  // Availability update handler
  const updateAvailability = async (availabilityData: any) => {
    try {
      await apiClient.put('/users/availability', availabilityData)
      await loadProfile()
      toast.success('Availability updated')
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability')
    }
  }

  // Handle save/edit toggle
  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      if (displayData) {
        try {
          const profileUpdateData = {
            firstName: displayData.firstName,
            lastName: displayData.lastName,
            title: displayData.title,
            bio: displayData.bio,
            phone: displayData.phone
          }
          await updateProfile(profileUpdateData)
          setIsEditing(false)
        } catch (error) {
          // Error already handled in updateProfile
        }
      }
    } else {
      // Enter edit mode
      setIsEditing(true)
    }
  }

  // Credential handlers
  const addCredential = async () => {
    try {
      const newCredential = {
        title: 'New Credential',
        issuer: 'Institution Name',
        description: '',
        credentialUrl: '',
        issuedDate: new Date().toISOString().split('T')[0],
        expiryDate: null,
        type: 'CERTIFICATION'
      }
      await apiClient.post('/users/credentials', newCredential)
      await loadProfile()
      toast.success('Credential added')
    } catch (error) {
      console.error('Error adding credential:', error)
      toast.error('Failed to add credential')
    }
  }

  const updateCredential = async (id: string, updates: any) => {
    try {
      // Map frontend fields to backend fields
      const backendUpdates = { ...updates }
      
      // Map institution to issuer
      if (updates.institution) {
        backendUpdates.issuer = updates.institution
        delete backendUpdates.institution
      }
      
      // Map year to issuedDate
      if (updates.year) {
        backendUpdates.issuedDate = `${updates.year}-01-01`
        delete backendUpdates.year
      }
      
      await apiClient.put(`/users/credentials/${id}`, backendUpdates)
      await loadProfile()
      toast.success('Credential updated')
    } catch (error) {
      console.error('Error updating credential:', error)
      toast.error('Failed to update credential')
    }
  }

  const removeCredential = async (id: string) => {
    try {
      await apiClient.delete(`/users/credentials/${id}`)
      await loadProfile()
      toast.success('Credential removed')
    } catch (error) {
      console.error('Error removing credential:', error)
      toast.error('Failed to remove credential')
    }
  }

  // Rate structure handlers
  const updateRateStructure = async (rateData: any) => {
    try {
      await apiClient.put('/users/rate-structure', rateData)
      await loadProfile()
      toast.success('Rate structure updated')
    } catch (error) {
      console.error('Error updating rate structure:', error)
      toast.error('Failed to update rate structure')
    }
  }

  // Work preferences handlers
  const updateWorkPreferences = async (preferencesData: any) => {
    try {
      await apiClient.put('/users/work-preferences', preferencesData)
      await loadProfile()
      toast.success('Work preferences updated')
    } catch (error) {
      console.error('Error updating work preferences:', error)
      toast.error('Failed to update work preferences')
    }
  }

  // Industry experience handlers
  const addIndustryExperience = async (experienceData: any) => {
    try {
      await apiClient.post('/users/industry-experience', experienceData)
      await loadProfile()
      toast.success('Industry experience added')
    } catch (error) {
      console.error('Error adding industry experience:', error)
      toast.error('Failed to add industry experience')
    }
  }

  const updateIndustryExperience = async (id: string, updates: any) => {
    try {
      await apiClient.put(`/users/industry-experience/${id}`, updates)
      await loadProfile()
      toast.success('Industry experience updated')
    } catch (error) {
      console.error('Error updating industry experience:', error)
      toast.error('Failed to update industry experience')
    }
  }

  const removeIndustryExperience = async (id: string) => {
    try {
      await apiClient.delete(`/users/industry-experience/${id}`)
      await loadProfile()
      toast.success('Industry experience removed')
    } catch (error) {
      console.error('Error removing industry experience:', error)
      toast.error('Failed to remove industry experience')
    }
  }

  // Availability handlers (duplicate removed - using the one above)

  // Load profile on component mount
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  // Tab configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: EyeIcon },
    { id: 'skills', name: 'Skills', icon: StarIcon },
    { id: 'portfolio', name: 'Portfolio', icon: BriefcaseIcon },
    { id: 'credentials', name: 'Credentials', icon: AcademicCapIcon },
    { id: 'rates', name: 'Rates & Availability', icon: CurrencyDollarIcon },
    { id: 'preferences', name: 'Work Preferences', icon: MapPinIcon }
  ]

  // Transform profile data for components
  const displayData = profile ? {
    // Basic info
    firstName: profile.profile?.firstName || '',
    lastName: profile.profile?.lastName || '',
    email: profile.email || '',
    phone: profile.profile?.phone || '',
    title: profile.profile?.title || '',
    bio: profile.profile?.bio || '',
    avatar: profile.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`,
    
    // Location
    location: profile.profile?.location ? 
      `${profile.profile.location.city}, ${profile.profile.location.province}` : 'Location not set',
    
    // Skills and portfolio - Transform skills to new format
    skills: profile.profile?.skills?.map((skill: any) => ({
      name: skill.skill?.name || skill.name || skill,
      level: skill.level || 1,
      years: skill.experience || 0
    })) || [],
    skillsDetailed: {
      primary: profile.profile?.skills?.slice(0, 8).map((skill: any) => skill.skill?.name || skill.name || skill) || [],
      secondary: profile.profile?.skills?.slice(8).map((skill: any) => skill.skill?.name || skill.name || skill) || [],
      learning: [] // Skills currently being learned
    },
    portfolio: profile.portfolioItems || [],
    credentials: profile.profile?.credentials || [],
    industryExperience: profile.profile?.industryExperience || [],
    
    // Rate structure from backend
    rateStructure: profile.profile?.rateStructure ? {
      hourly: {
        webDevelopment: { 
          min: Number(profile.profile.rateStructure.webDevelopmentMin) || 0, 
          max: Number(profile.profile.rateStructure.webDevelopmentMax) || 0 
        },
        consulting: { 
          min: Number(profile.profile.rateStructure.consultingMin) || 0, 
          max: Number(profile.profile.rateStructure.consultingMax) || 0 
        },
        maintenance: { 
          min: Number(profile.profile.rateStructure.maintenanceMin) || 0, 
          max: Number(profile.profile.rateStructure.maintenanceMax) || 0 
        }
      },
      fixed: {
        smallProject: { 
          min: Number(profile.profile.rateStructure.smallProjectMin) || 0, 
          max: Number(profile.profile.rateStructure.smallProjectMax) || 0 
        },
        mediumProject: { 
          min: Number(profile.profile.rateStructure.mediumProjectMin) || 0, 
          max: Number(profile.profile.rateStructure.mediumProjectMax) || 0 
        },
        largeProject: { 
          min: Number(profile.profile.rateStructure.largeProjectMin) || 0, 
          max: Number(profile.profile.rateStructure.largeProjectMax) || 0 
        }
      }
    } : {
      hourly: {
        webDevelopment: { min: 0, max: 0 },
        consulting: { min: 0, max: 0 },
        maintenance: { min: 0, max: 0 }
      },
      fixed: {
        smallProject: { min: 0, max: 0 },
        mediumProject: { min: 0, max: 0 },
        largeProject: { min: 0, max: 0 }
      }
    },
    
    // Work preferences from backend
    workPreferences: profile.profile?.workPreferences || {
      arrangements: [],
      projectTypes: [],
      industries: [],
      preferredLocations: [],
      teamSize: '',
      communicationStyle: '',
      workingHours: ''
    },
    
    // Availability from backend (new structure)
    availability: profile.profile?.availability ? {
      status: profile.profile.availability.status || 'AVAILABLE',
      hoursPerWeek: profile.profile.availability.hoursPerWeek || 40,
      startDate: profile.profile.availability.startDate ? 
        new Date(profile.profile.availability.startDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]
    } : {
      status: 'AVAILABLE',
      hoursPerWeek: 40,
      startDate: new Date().toISOString().split('T')[0]
    },
    
    hourlyRate: profile.profile?.hourlyRate || 0,
    joinedDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'
  } : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProfile}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!profile || !displayData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No profile data found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img
                  src={displayData.avatar}
                  alt={`${displayData.firstName} ${displayData.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {displayData.firstName} {displayData.lastName}
                </h1>
                <p className="text-gray-600">{displayData.title}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                  <span className="text-sm text-gray-500">{displayData.location}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleEditToggle}
              variant={isEditing ? "default" : "outline"}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            profile={displayData} 
            setProfile={setProfile}
            updateProfile={updateProfile}
            updateLocation={updateLocation}
            updateAvailability={updateAvailability}
            isEditing={isEditing} 
          />
        )}
        
        {activeTab === 'skills' && (
          <SkillsTab 
            profile={displayData} 
            handleSkillsChange={handleSkillsChange} 
            isEditing={isEditing} 
          />
        )}
        
        {activeTab === 'portfolio' && (
          <PortfolioTab 
            profile={displayData} 
            addPortfolioItem={addPortfolioItem}
            updatePortfolioItem={updatePortfolioItem}
            removePortfolioItem={removePortfolioItem}
            isEditing={isEditing} 
          />
        )}
        
        {activeTab === 'credentials' && (
          <CredentialsTab 
            profile={displayData} 
            addCredential={addCredential}
            updateCredential={updateCredential}
            removeCredential={removeCredential}
            isEditing={isEditing} 
          />
        )}
        
        {activeTab === 'rates' && (
          <RatesTab 
            profile={displayData} 
            setProfile={setProfile}
            updateRateStructure={updateRateStructure}
            updateAvailability={updateAvailability}
            isEditing={isEditing} 
          />
        )}
        
        {activeTab === 'preferences' && (
          <PreferencesTab 
            profile={displayData} 
            setProfile={setProfile}
            updateWorkPreferences={updateWorkPreferences}
            updateLocation={updateLocation}
            addIndustryExperience={addIndustryExperience}
            updateIndustryExperience={updateIndustryExperience}
            removeIndustryExperience={removeIndustryExperience}
            isEditing={isEditing} 
          />
        )}
      </div>
    </div>
  )
}

export default function TalentProfilePage() {
  return (
    <AuthGuard requiredUserType="talent">
      <TalentProfileContent />
    </AuthGuard>
  )
}
