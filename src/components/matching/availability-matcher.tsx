'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { matchingService, TalentMatch } from '@/lib/api/matching.service'
import { formatDate } from '@/lib/utils'

interface AvailabilityMatch {
  talentId: string
  projectId: string
  compatibilityScore: number
  availability: {
    status: 'available' | 'partially_available' | 'unavailable'
    hoursPerWeek: number
    startDate: string
    conflicts: Array<{
      projectTitle: string
      hoursCommitted: number
      endDate: string
    }>
  }
  schedule: {
    timezone: string
    workingHours: {
      start: string
      end: string
      days: string[]
    }
    preferredMeetingTimes: string[]
  }
  projectRequirements: {
    expectedHours: number
    timeline: {
      startDate: string
      endDate: string
      milestones: Array<{
        title: string
        deadline: string
        hoursRequired: number
      }>
    }
    meetingRequirements: {
      frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly'
      duration: number
      timezone: string
    }
  }
  recommendations: string[]
  concerns: string[]
}

export function AvailabilityMatcher({ projectId }: { projectId: string }) {
  const [matches, setMatches] = useState<AvailabilityMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<AvailabilityMatch | null>(null)

  useEffect(() => {
    loadAvailabilityMatches()
  }, [projectId])

  const loadAvailabilityMatches = async () => {
    try {
      // This would call a specialized availability matching endpoint
      const response = await matchingService.getProjectMatches(projectId, {
        sortBy: 'score',
        maxResults: 20
      })
      
      // Transform the data to include availability analysis
      const availabilityMatches = response.matches.map(match => ({
        talentId: match.talentId,
        projectId: match.projectId,
        compatibilityScore: calculateAvailabilityScore(match),
        availability: analyzeAvailability(match.talent),
        schedule: extractScheduleInfo(match.talent),
        projectRequirements: extractProjectRequirements(match.project),
        recommendations: generateRecommendations(match),
        concerns: identifyConcerns(match)
      }))
      
      setMatches(availabilityMatches)
    } catch (error) {
      console.error('Failed to load availability matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAvailabilityScore = (match: TalentMatch): number => {
    // Enhanced scoring based on availability factors
    const baseScore = match.matchScore.breakdown.availability
    const timezoneFactor = calculateTimezoneCompatibility(match)
    const scheduleFactor = calculateScheduleOverlap(match)
    const workloadFactor = calculateWorkloadCompatibility(match)
    
    return Math.round((baseScore * 0.4 + timezoneFactor * 0.3 + scheduleFactor * 0.2 + workloadFactor * 0.1) * 100)
  }

  const calculateTimezoneCompatibility = (match: TalentMatch): number => {
    // Mock calculation - in real app, compare timezones
    return 0.85
  }

  const calculateScheduleOverlap = (match: TalentMatch): number => {
    // Mock calculation - in real app, analyze working hours overlap
    return 0.75
  }

  const calculateWorkloadCompatibility = (match: TalentMatch): number => {
    // Mock calculation - in real app, analyze current workload vs project needs
    return 0.90
  }

  const analyzeAvailability = (talent: any) => ({
    status: talent.availability?.status || 'available',
    hoursPerWeek: talent.availability?.hoursPerWeek || 40,
    startDate: talent.availability?.startDate || new Date().toISOString(),
    conflicts: [
      {
        projectTitle: 'Existing Project A',
        hoursCommitted: 15,
        endDate: '2024-02-15'
      }
    ]
  })

  const extractScheduleInfo = (talent: any) => ({
    timezone: 'America/Toronto',
    workingHours: {
      start: '09:00',
      end: '17:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    preferredMeetingTimes: ['10:00-11:00', '14:00-15:00']
  })

  const extractProjectRequirements = (project: any) => ({
    expectedHours: 160,
    timeline: {
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      milestones: [
        {
          title: 'Design Phase',
          deadline: '2024-02-28',
          hoursRequired: 40
        },
        {
          title: 'Development Phase',
          deadline: '2024-04-15',
          hoursRequired: 100
        }
      ]
    },
    meetingRequirements: {
      frequency: 'weekly' as const,
      duration: 60,
      timezone: 'America/Toronto'
    }
  })

  const generateRecommendations = (match: TalentMatch): string[] => [
    'Schedule overlap allows for 6 hours of collaborative work daily',
    'Talent can start immediately with no conflicts',
    'Weekly meetings align with talent\'s preferred schedule'
  ]

  const identifyConcerns = (match: TalentMatch): string[] => [
    'Talent has 15 hours/week committed to another project until Feb 15',
    'Different timezone may require adjusted meeting times'
  ]

  const getAvailabilityStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'partially_available': return 'bg-yellow-100 text-yellow-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          Availability Matching
        </h2>
        <p className="text-gray-600">Find talents with compatible schedules and availability</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matches List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Talents ({matches.length})</h3>
            
            {matches.map(match => (
              <Card 
                key={match.talentId} 
                className={`cursor-pointer transition-colors ${
                  selectedMatch?.talentId === match.talentId ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Talent #{match.talentId.slice(-4)}</h4>
                        <p className="text-sm text-gray-600">
                          {match.availability.hoursPerWeek}h/week available
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(match.compatibilityScore)}`}>
                        {match.compatibilityScore}%
                      </div>
                      <Badge className={getAvailabilityStatusColor(match.availability.status)}>
                        {match.availability.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Can start: {formatDate(match.availability.startDate)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {match.schedule.workingHours.start} - {match.schedule.workingHours.end} 
                        ({match.schedule.timezone})
                      </span>
                    </div>

                    {match.availability.conflicts.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>{match.availability.conflicts.length} scheduling conflict(s)</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Availability Match</span>
                      <span>{match.compatibilityScore}%</span>
                    </div>
                    <Progress value={match.compatibilityScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-4">
            {selectedMatch ? (
              <>
                <h3 className="text-lg font-semibold">Availability Analysis</h3>
                
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Compatibility Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold ${getScoreColor(selectedMatch.compatibilityScore)} mb-2`}>
                          {selectedMatch.compatibilityScore}%
                        </div>
                        <Progress value={selectedMatch.compatibilityScore} className="h-3" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedMatch.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {selectedMatch.concerns.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Concerns</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedMatch.concerns.map((concern, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                <span className="text-sm text-gray-700">{concern}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Working Hours</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Time:</span>
                            <p>{selectedMatch.schedule.workingHours.start} - {selectedMatch.schedule.workingHours.end}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Days:</span>
                            <p>{selectedMatch.schedule.workingHours.days.join(', ')}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Timezone:</span>
                            <p>{selectedMatch.schedule.timezone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Meeting Availability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedMatch.schedule.preferredMeetingTimes.map((time, index) => (
                            <Badge key={index} variant="outline">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Project Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Duration:</span>
                            <p>
                              {formatDate(selectedMatch.projectRequirements.timeline.startDate)} - {' '}
                              {formatDate(selectedMatch.projectRequirements.timeline.endDate)}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-600">Expected Hours:</span>
                            <p>{selectedMatch.projectRequirements.expectedHours} hours total</p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-600">Milestones:</span>
                            <div className="space-y-2 mt-2">
                              {selectedMatch.projectRequirements.timeline.milestones.map((milestone, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium text-sm">{milestone.title}</p>
                                    <p className="text-xs text-gray-600">{milestone.hoursRequired} hours</p>
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {formatDate(milestone.deadline)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Talent</h3>
                  <p className="text-gray-600">Click on a talent to see detailed availability analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
