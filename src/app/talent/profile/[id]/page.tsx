'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  UserIcon,
  StarIcon,
  MapPinIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { apiClient } from '@/lib/api/client'
import { formatCurrency } from '@/lib/utils'

interface TalentProfile {
  id: string
  email: string
  profile: {
    firstName: string
    lastName: string
    displayName: string
    avatar?: string
    bio?: string
    title?: string
    hourlyRate?: string
    phone?: string
    website?: string
    location?: {
      city: string
      province: string
      country: string
    }
    skills?: Array<{
      id: string
      level: number
      experience: number
      skill: {
        id: string
        name: string
        category: string
      }
    }>
  }
  portfolioItems?: Array<{
    id: string
    title: string
    description: string
    imageUrl?: string
    projectUrl?: string
    technologies: string[]
    completedAt: string
  }>
}

export default function PublicTalentProfilePage() {
  const params = useParams()
  const talentId = params.id as string
  
  const [talent, setTalent] = useState<TalentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (talentId) {
      fetchTalentProfile()
    }
  }, [talentId])

  const fetchTalentProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch talent profile - this should be a public endpoint
      const response = await fetch(`/api/users/${params.id}/public-profile`)
      const data = await response.json()
      setTalent(data as TalentProfile)
    } catch (err: any) {
      console.error('Failed to fetch talent profile:', err)
      setError('Failed to load talent profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !talent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Talent not found'}</p>
          <Button onClick={() => window.close()}>Close</Button>
        </div>
      </div>
    )
  }

  const profile = talent.profile

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.displayName || `${profile.firstName} ${profile.lastName}`}
              </h1>
              
              {profile.title && (
                <p className="text-xl text-gray-600 mb-3">{profile.title}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{profile.location.city}, {profile.location.province}</span>
                  </div>
                )}
                
                {profile.hourlyRate && (
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-green-600">
                      {formatCurrency(Number(profile.hourlyRate))}/hr
                    </span>
                  </div>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="text-sm">
                        {skill.skill.name} (Level {skill.level})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {talent.portfolioItems && talent.portfolioItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talent.portfolioItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        {item.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{talent.email}</span>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => window.close()}
                >
                  Close Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
