'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvailabilityMatcher } from '@/components/matching/availability-matcher'
import { BudgetMatcher } from '@/components/matching/budget-matcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  StarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { formatCurrency } from '@/lib/utils'

// Demo data - would come from API
const mockTalents = [
  {
    id: 't1',
    firstName: 'Sarah',
    lastName: 'Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    title: 'Senior React Developer',
    bio: 'Passionate full-stack developer with 6+ years of experience building modern web applications. Specialized in React, Node.js, and cloud technologies.',
    location: 'Vancouver, BC',
    hourlyRate: 75,
    availability: 'available',
    rating: 4.9,
    reviewsCount: 23,
    projectsCompleted: 45,
    responseTime: '< 2 hours',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    portfolio: [
      {
        title: 'E-commerce Platform',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop'
      },
      {
        title: 'Restaurant Management System',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop'
      }
    ],
    isSaved: false,
    matchScore: 95
  },
  {
    id: 't2',
    firstName: 'Marcus',
    lastName: 'Thompson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    title: 'UI/UX Designer',
    bio: 'Creative designer with 5+ years of experience in mobile and web design. Expert in user research, prototyping, and design systems.',
    location: 'Vancouver, BC',
    hourlyRate: 65,
    availability: 'available',
    rating: 4.7,
    reviewsCount: 18,
    projectsCompleted: 32,
    responseTime: '< 4 hours',
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
    portfolio: [
      {
        title: 'Fitness App Design',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
      },
      {
        title: 'Banking App Interface',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop'
      }
    ],
    isSaved: true,
    matchScore: 88
  },
  {
    id: 't3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    title: 'Full-Stack Developer',
    bio: 'Versatile developer with expertise in both frontend and backend technologies. Strong background in Python, Django, and modern JavaScript frameworks.',
    location: 'Burnaby, BC',
    hourlyRate: 70,
    availability: 'busy',
    rating: 4.8,
    reviewsCount: 31,
    projectsCompleted: 28,
    responseTime: '< 6 hours',
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
    portfolio: [
      {
        title: 'Real Estate Platform',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop'
      },
      {
        title: 'Healthcare Dashboard',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop'
      }
    ],
    isSaved: false,
    matchScore: 82
  },
  {
    id: 't4',
    firstName: 'David',
    lastName: 'Kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    title: 'Mobile App Developer',
    bio: 'Specialized mobile developer with expertise in React Native and native iOS/Android development. 4+ years building high-performance mobile apps.',
    location: 'Richmond, BC',
    hourlyRate: 80,
    availability: 'available',
    rating: 4.6,
    reviewsCount: 15,
    projectsCompleted: 22,
    responseTime: '< 3 hours',
    skills: ['React Native', 'iOS', 'Android', 'Swift', 'Kotlin'],
    portfolio: [
      {
        title: 'Food Delivery App',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
      },
      {
        title: 'Travel Planning App',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop'
      }
    ],
    isSaved: false,
    matchScore: 79
  }
]

const availabilityColors = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-yellow-100 text-yellow-800',
  unavailable: 'bg-red-100 text-red-800',
}

export default function BusinessTalentPage() {
  const [talents, setTalents] = useState(mockTalents)
  const [searchQuery, setSearchQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('match_score')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setIsLoading(true)
        // const talentsData = await apiClient.get('/business/talent/search', { params: filters })
        // setTalents(talentsData)
        
        // Using mock data for now
        setTalents(mockTalents)
      } catch (error) {
        console.error('Failed to fetch talents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTalents()
  }, [searchQuery, skillFilter, locationFilter, availabilityFilter, sortBy])

  const filteredTalents = talents.filter(talent => {
    const matchesSearch = talent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         talent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         talent.bio.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSkill = !skillFilter || talent.skills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    )
    
    const matchesLocation = !locationFilter || talent.location.toLowerCase().includes(locationFilter.toLowerCase())
    
    const matchesAvailability = availabilityFilter === 'all' || talent.availability === availabilityFilter
    
    return matchesSearch && matchesSkill && matchesLocation && matchesAvailability
  })

  const sortedTalents = [...filteredTalents].sort((a, b) => {
    switch (sortBy) {
      case 'match_score':
        return b.matchScore - a.matchScore
      case 'rating':
        return b.rating - a.rating
      case 'hourly_rate_low':
        return a.hourlyRate - b.hourlyRate
      case 'hourly_rate_high':
        return b.hourlyRate - a.hourlyRate
      case 'projects_completed':
        return b.projectsCompleted - a.projectsCompleted
      default:
        return 0
    }
  })

  const toggleSaved = async (talentId: string) => {
    try {
      // await apiClient.post(`/business/talent/${talentId}/save`)
      setTalents(prev => prev.map(talent => 
        talent.id === talentId ? { ...talent, isSaved: !talent.isSaved } : talent
      ))
    } catch (error) {
      console.error('Failed to toggle save:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Talent</h1>
          <p className="text-gray-600">Discover and connect with local specialists using intelligent matching</p>
        </div>
        <Button>
          <UserIcon className="h-4 w-4 mr-2" />
          Invite Talent
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Talent</TabsTrigger>
          <TabsTrigger value="availability">Availability Matching</TabsTrigger>
          <TabsTrigger value="budget">Budget Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Input
                placeholder="Skills (e.g. React, Design)"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
              <Input
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="match_score">Best Match</option>
                <option value="rating">Highest Rated</option>
                <option value="hourly_rate_low">Lowest Rate</option>
                <option value="hourly_rate_high">Highest Rate</option>
                <option value="projects_completed">Most Experienced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {sortedTalents.length} of {talents.length} talents
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border-0 bg-transparent font-medium text-gray-900"
          >
            <option value="match_score">Best Match</option>
            <option value="rating">Highest Rated</option>
            <option value="hourly_rate_low">Lowest Rate</option>
            <option value="hourly_rate_high">Highest Rate</option>
            <option value="projects_completed">Most Experienced</option>
          </select>
        </div>
      </div>

      {/* Talents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedTalents.map((talent) => (
          <Card key={talent.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={talent.avatar}
                    alt={`${talent.firstName} ${talent.lastName}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {talent.firstName} {talent.lastName}
                    </h3>
                    <p className="text-gray-600 mb-1">{talent.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{talent.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{talent.rating} ({talent.reviewsCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                      <StarIcon className="h-4 w-4 fill-current" />
                      {talent.matchScore}% match
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSaved(talent.id)}
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

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {talent.bio}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {talent.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {talent.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{talent.skills.length - 5} more
                  </Badge>
                )}
              </div>

              {/* Portfolio Preview */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {talent.portfolio.slice(0, 2).map((project, index) => (
                  <div key={index} className="relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-20 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium text-center px-2">
                        {project.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{formatCurrency(talent.hourlyRate)}/hr</div>
                  <div className="text-gray-500">Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{talent.projectsCompleted}</div>
                  <div className="text-gray-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{talent.responseTime}</div>
                  <div className="text-gray-500">Response</div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between mb-4">
                <Badge className={availabilityColors[talent.availability as keyof typeof availabilityColors]}>
                  {talent.availability.charAt(0).toUpperCase() + talent.availability.slice(1)}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link href={`/business/talent/${talent.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
                <Button className="flex-1">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedTalents.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No talents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
          <div className="mt-6">
            <Button onClick={() => {
              setSearchQuery('')
              setSkillFilter('')
              setLocationFilter('')
              setAvailabilityFilter('all')
            }}>
              Clear Filters
            </Button>
          </div>
        </div>
      )}
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityMatcher projectId="" />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetMatcher projectId="" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
