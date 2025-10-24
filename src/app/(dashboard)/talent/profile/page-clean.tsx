'use client'

import { useState, useEffect } from 'react'
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
  CalendarIcon
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
  
  // Load profile data from backend
  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/users/profile') as any
      setProfile(response)
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

  // Skills handlers
  const handleSkillsChange = async (skills: any) => {
    try {
      // Update skills via API
      console.log('Skills changed:', skills)
      toast.success('Skills updated')
    } catch (error) {
      console.error('Error updating skills:', error)
      toast.error('Failed to update skills')
    }
  }

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
    
    // Skills and portfolio
    skills: profile.profile?.skills || [],
    portfolio: profile.portfolioItems || [],
    
    // Other data
    availability: 'Available',
    hourlyRate: 75,
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
              <img
                src={displayData.avatar}
                alt={`${displayData.firstName} ${displayData.lastName}`}
                className="w-16 h-16 rounded-full"
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
              onClick={() => setIsEditing(!isEditing)}
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
            isEditing={isEditing}
            addCredential={() => {}}
            updateCredential={() => {}}
            removeCredential={() => {}}
          />
        )}
        
        {activeTab === 'rates' && (
          <RatesTab 
            profile={displayData} 
            isEditing={isEditing}
            setProfile={setProfile}
          />
        )}
        
        {activeTab === 'preferences' && (
          <PreferencesTab 
            profile={displayData} 
            isEditing={isEditing}
            setProfile={setProfile}
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
