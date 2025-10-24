'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/contexts/auth-context'

const workArrangementColors = {
  remote: 'bg-green-100 text-green-800',
  hybrid: 'bg-blue-100 text-blue-800',
  onsite: 'bg-purple-100 text-purple-800',
}

function TalentOpportunitiesContent() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [workArrangement, setWorkArrangement] = useState<string>('all')

  useEffect(() => {
    const fetchOpportunities = async () => {
      // Don't require user for public projects endpoint
      console.log('🔍 Starting opportunities fetch...')
      console.log('👤 User status:', user ? 'authenticated' : 'not authenticated')

      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔍 Fetching opportunities from /projects endpoint...')
        console.log('👤 Current user:', user)
        console.log('🔑 Auth token exists:', !!localStorage.getItem('accessToken'))
        
        // Test basic connectivity first
        console.log('🌐 Testing basic API connectivity...')
        try {
          const testResponse = await fetch('http://localhost:5000/api/projects', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          console.log('🌐 Direct fetch status:', testResponse.status)
          console.log('🌐 Direct fetch ok:', testResponse.ok)
          
          if (testResponse.ok) {
            const testData = await testResponse.json()
            console.log('🌐 Direct fetch data:', testData)
            console.log('🌐 Direct fetch data length:', Array.isArray(testData) ? testData.length : 'not array')
            
            // If direct fetch works, use that data
            if (Array.isArray(testData) && testData.length > 0) {
              console.log('✅ Using direct fetch data as fallback')
              setOpportunities(testData)
              setIsLoading(false)
              return
            }
          } else {
            console.error('🌐 Direct fetch failed with status:', testResponse.status)
            const errorText = await testResponse.text()
            console.error('🌐 Error response:', errorText)
          }
        } catch (testErr) {
          console.error('🌐 Direct fetch failed:', testErr)
        }
        
        // Fetch all available projects/opportunities
        console.log('📡 Now trying with apiClient...')
        const response = await apiClient.get('/projects')
        console.log('📋 Full response object:', response)
        console.log('📋 Response status:', (response as any)?.status)
        console.log('📋 Response headers:', (response as any)?.headers)
        
        const data = (response as any)?.data
        console.log('📊 Raw response data:', data)
        console.log('📊 Data type:', typeof data)
        console.log('📊 Is array?', Array.isArray(data))
        
        if (Array.isArray(data)) {
          console.log(`✅ Found ${data.length} projects in response`)
          data.forEach((project, index) => {
            console.log(`📋 Project ${index + 1}:`, {
              id: project.id,
              title: project.title,
              status: project.status,
              business: project.business?.profile?.companyName
            })
          })
          setOpportunities(data)
          console.log(`✅ Set ${data.length} opportunities in state`)
        } else {
          console.warn('⚠️ Response data is not an array:', data)
          console.warn('⚠️ Setting empty array')
          setOpportunities([])
        }
      } catch (err) {
        console.error('❌ Error fetching opportunities:', err)
        console.error('❌ Error details:', {
          message: (err as any)?.message,
          status: (err as any)?.response?.status,
          data: (err as any)?.response?.data
        })
        setError(`Failed to load opportunities: ${(err as any)?.message || 'Unknown error'}`)
        setOpportunities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunities()
  }, []) // Remove user dependency since projects endpoint is public

  const toggleSaved = (id: string) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id ? { ...opp, isSaved: !opp.isSaved } : opp
      )
    )
  }

  const filteredOpportunities = opportunities.filter(opp => {
    // Handle both old mock data structure and new backend structure
    const title = opp.title || opp.name || ''
    const description = opp.description || ''
    const workArr = opp.workArrangement || opp.workType || 'remote'
    const skills = opp.skills || []
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesWorkArrangement = workArrangement === 'all' || workArr === workArrangement
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some((skill: string) => {
                           // Handle both array of strings and array of objects
                           if (Array.isArray(skills)) {
                             return skills.some(s => 
                               typeof s === 'string' ? s.includes(skill) : s.skill?.name?.includes(skill)
                             )
                           }
                           return false
                         })
    
    return matchesSearch && matchesWorkArrangement && matchesSkills
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Opportunities</h1>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Opportunities</h1>
        <p className="text-gray-600">Find projects that match your skills and interests</p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Arrangement
                </label>
                <select
                  value={workArrangement}
                  onChange={(e) => setWorkArrangement(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredOpportunities.length} opportunities found
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Sort by: Newest
          </Button>
        </div>
      </div>

      {/* Opportunities list */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {opportunity.title || opportunity.name}
                        </h3>
                        {opportunity.isUrgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {opportunity.company || opportunity.business?.profile?.companyName || opportunity.business?.profile?.displayName}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSaved(opportunity.id)}
                      className="p-2 hover:bg-gray-50 rounded-full"
                    >
                      {opportunity.isSaved ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-700 line-clamp-2">{opportunity.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      {opportunity.type === 'HOURLY' 
                        ? opportunity.hourlyRate 
                          ? `${formatCurrency(opportunity.hourlyRate)}/hr`
                          : opportunity.budgetMin && opportunity.budgetMax
                            ? `${formatCurrency(opportunity.budgetMin)}-${formatCurrency(opportunity.budgetMax)}/hr`
                            : opportunity.budget?.min && opportunity.budget?.max
                              ? `${formatCurrency(opportunity.budget.min)}-${formatCurrency(opportunity.budget.max)}/hr`
                              : 'Hourly rate TBD'
                        : opportunity.budget?.min && opportunity.budget?.max 
                          ? `${formatCurrency(opportunity.budget.min)} - ${formatCurrency(opportunity.budget.max)}`
                          : opportunity.budgetMin && opportunity.budgetMax 
                            ? `${formatCurrency(opportunity.budgetMin)} - ${formatCurrency(opportunity.budgetMax)}`
                            : 'Budget TBD'
                      }
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {opportunity.location || opportunity.city || 'Remote'} 
                      {opportunity.distance && ` (${opportunity.distance})`}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {opportunity.duration || opportunity.timeline || 'TBD'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={workArrangementColors[(opportunity.workArrangement || opportunity.workType || 'remote') as keyof typeof workArrangementColors]}>
                        {opportunity.workArrangement || opportunity.workType || 'Remote'}
                      </Badge>
                      {(opportunity.skills || []).slice(0, 3).map((skill: any, index: number) => (
                        <Badge key={skill.skill?.name || skill || index} variant="secondary" className="text-xs">
                          {skill.skill?.name || skill}
                        </Badge>
                      ))}
                      {(opportunity.skills || []).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(opportunity.skills || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        {opportunity.postedAt ? formatRelativeTime(opportunity.postedAt) : 
                         opportunity.createdAt ? formatRelativeTime(opportunity.createdAt) : 'Recently posted'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {opportunity.applicationsCount || opportunity._count?.applications || 0} applications
                      </span>
                      <Link href={`/talent/opportunities/${opportunity.id}`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or check back later for new projects.
          </p>
        </div>
      )}
    </div>
  )
}

export default function TalentOpportunitiesPage() {
  return (
    <AuthGuard requiredUserType="talent">
      <TalentOpportunitiesContent />
    </AuthGuard>
  )
}
