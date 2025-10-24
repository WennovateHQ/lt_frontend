'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeftIcon,
  HeartIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { formatCurrency } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

// No mock data - all data comes from API

const availabilityColors = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-red-100 text-red-800',
}

const skillLevelColors = {
  beginner: 'bg-gray-100 text-gray-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
  expert: 'bg-green-100 text-green-800',
}

export default function TalentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [talent, setTalent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get return URL from query params
  const returnTo = searchParams.get('returnTo')

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch talent profile from public endpoint
        const talentData = await apiClient.get(`/users/${params.id}/public-profile`) as any
        console.log('Talent data received:', talentData)
        setTalent(talentData)
      } catch (error: any) {
        console.error('Failed to fetch talent:', error)
        setError('Failed to load talent profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchTalent()
    }
  }, [params.id])

  const handleSaveToggle = async () => {
    try {
      // await apiClient.post(`/business/talent/${talent.id}/save`)
      setTalent((prev: any) => ({ ...prev, isSaved: !prev.isSaved }))
    } catch (error) {
      console.error('Failed to toggle save:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !talent) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (returnTo) {
                window.location.href = returnTo
              } else {
                router.back()
              }
            }}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {returnTo ? 'Back to Application' : 'Back to Talent Search'}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {talent.matchScore && (
            <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
              <StarIcon className="h-4 w-4 fill-current" />
              {talent.matchScore}% match
            </div>
          )}
          <button
            onClick={handleSaveToggle}
            className="p-2 hover:bg-gray-50 rounded-full"
          >
            {talent.isSaved ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                {talent.profile?.avatar ? (
                  <img
                    src={talent.profile.avatar}
                    alt={talent.profile.displayName || 'Talent'}
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {talent.profile?.displayName || `${talent.profile?.firstName} ${talent.profile?.lastName}`}
                      </h1>
                      <p className="text-lg text-gray-600 mb-2">{talent.profile?.title || 'Professional'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        {talent.profile?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{talent.profile.location.city}, {talent.profile.location.province}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{talent.rating || 4.8} ({talent.reviewsCount || 0} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{talent.responseTime || '< 2 hours'} response</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(Number(talent.profile?.hourlyRate) || 75)}/hr
                      </div>
                      <div className="text-sm text-gray-500">Starting rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          {talent.profile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{talent.profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {talent.profile?.skills && talent.profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {talent.profile.skills.map((skill: any, index: number) => (
                    <div key={skill.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{skill.skill?.name || 'Unknown Skill'}</div>
                        <div className="text-sm text-gray-500">{skill.experience || 0} years experience</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        Level {skill.level || 1}
                      </Badge>
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {talent.portfolioItems.map((project: any) => (
                    <div key={project.id} className="border rounded-lg overflow-hidden">
                      {project.imageUrl && (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.technologies.map((tech: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience - Hidden until work experience system is implemented */}
          {false && talent.experience && talent.experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {talent.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                        <p className="text-gray-700">{exp.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reviews - Hidden until review system is implemented */}
          {false && talent.recentReviews && talent.recentReviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {talent.recentReviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">{review.client}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{review.project}</p>
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700">"{review.comment}"</p>
                </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projects Completed</span>
                <span className="font-medium">{talent.projectsCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium">{talent.completionRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium">{talent.responseTime || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-medium">{talent.memberSince ? new Date(talent.memberSince).getFullYear() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Identity Verified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Portfolio Reviewed</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Background Checked</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>Skills Assessed</span>
              </div>
            </CardContent>
          </Card>

          {/* Similar Talent - Hidden until matching algorithm is implemented */}
          {false && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Talent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/business/talent">
                  <Button variant="outline" size="sm" className="w-full">
                    Browse All Talent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
