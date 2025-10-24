'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/auth-context'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  PencilIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { usersService } from '@/lib/api/users.service'
import { toast } from 'sonner'
import { SearchableCitySelect } from '@/components/ui/searchable-city-select'

function BusinessProfileContent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  // Load user profile
  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await usersService.getProfile()
      console.log('✅ Business Profile loaded:', data)
      setProfile(data)
      const profileData = (data as any)?.profile || {}
      setEditData({
        firstName: profileData?.firstName || '',
        lastName: profileData?.lastName || '',
        companyName: profileData?.companyName || '',
        companySize: profileData?.companySize || '',
        industry: profileData?.industry || '',
        bio: profileData?.bio || '',
        phone: profileData?.phone || '',
        website: profileData?.website || '',
        city: profileData?.location?.city || '',
        province: profileData?.location?.province || '',
        country: profileData?.location?.country || 'Canada'
      })
    } catch (error) {
      console.error('❌ Error loading business profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      const updatedProfile = await usersService.updateProfile(editData)
      console.log('✅ Business Profile updated:', updatedProfile)
      setProfile(updatedProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('❌ Error updating business profile:', error)
      toast.error('Failed to update profile')
    }
  }

  // Upload avatar/logo
  const handleLogoUpload = async (file: File) => {
    try {
      const result = await usersService.uploadAvatar(file)
      console.log('✅ Company logo uploaded:', result)
      await loadProfile()
      toast.success('Company logo updated successfully!')
    } catch (error) {
      console.error('❌ Error uploading logo:', error)
      toast.error('Failed to upload company logo')
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
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

  const displayData = {
    firstName: profile?.profile?.firstName || 'First',
    lastName: profile?.profile?.lastName || 'Last',
    email: profile?.email || 'email@example.com',
    companyName: profile?.profile?.companyName || 'Company Name',
    companySize: profile?.profile?.companySize || 'Not specified',
    industry: profile?.profile?.industry || 'Not specified',
    bio: profile?.profile?.bio || 'Company description not provided yet.',
    avatar: profile?.profile?.avatar,
    phone: profile?.profile?.phone || '',
    website: profile?.profile?.website || '',
    location: profile?.profile?.location ? 
      `${profile.profile.location.city}, ${profile.profile.location.province}` : 'Location not set',
    joinedDate: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'
  }

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative">
                {displayData.avatar ? (
                  <img
                    src={displayData.avatar}
                    alt={displayData.companyName}
                    className="w-20 h-20 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center border">
                    <BuildingOfficeIcon className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                  <PencilIcon className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file)
                    }}
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {displayData.companyName}
                  </h1>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <p className="text-lg text-gray-600 mb-2">{displayData.industry}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{displayData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Member since {displayData.joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BuildingOfficeIcon className="h-4 w-4" />
                    <span>{displayData.companySize} employees</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
          
          {isEditing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={editData.companyName}
                    onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={editData.industry}
                    onChange={(e) => setEditData({...editData, industry: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Input
                    id="companySize"
                    value={editData.companySize}
                    onChange={(e) => setEditData({...editData, companySize: e.target.value})}
                    placeholder="e.g., 1-10, 11-50, 51-200"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editData.website}
                    onChange={(e) => setEditData({...editData, website: e.target.value})}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Company Description</Label>
                  <Textarea
                    id="bio"
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={3}
                    placeholder="Tell us about your company..."
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">Contact First Name</Label>
                  <Input
                    id="firstName"
                    value={editData.firstName}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Contact Last Name</Label>
                  <Input
                    id="lastName"
                    value={editData.lastName}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Business Location</Label>
                  <SearchableCitySelect
                    value={editData.city && editData.province ? `${editData.city}, ${editData.province}` : ''}
                    onChange={(city, province) => {
                      setEditData({
                        ...editData,
                        city,
                        province,
                        country: 'Canada'
                      })
                    }}
                    placeholder="Search for your business location..."
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This helps clients and talent find you
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About</h4>
              <p className="text-gray-700">{displayData.bio}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Company Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                    <span><strong>Industry:</strong> {displayData.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
                    <span><strong>Company Size:</strong> {displayData.companySize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <span><strong>Location:</strong> {displayData.location}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                    <span><strong>Email:</strong> {displayData.email}</span>
                  </div>
                  {displayData.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <span><strong>Phone:</strong> {displayData.phone}</span>
                    </div>
                  )}
                  {displayData.website && (
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>Website:</strong>{' '}
                        <a 
                          href={displayData.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          {displayData.website}
                        </a>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span><strong>Member Since:</strong> {displayData.joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BusinessProfilePage() {
  return (
    <AuthGuard requiredUserType="business">
      <BusinessProfileContent />
    </AuthGuard>
  )
}
