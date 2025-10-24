'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/lib/contexts/auth-context'
import { OnboardingChecklist } from '@/components/onboarding/onboarding-checklist'

// Initial empty state
const initialDashboardData = {
  stats: {
    activeApplications: 0,
    activeContracts: 0,
    totalEarnings: 0,
    profileViews: 0,
  },
  recentApplications: [],
  recommendedOpportunities: [],
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

function TalentDashboardContent() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(initialDashboardData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch profile data for onboarding checklist
        try {
          const profileData = await apiClient.get('/users/profile')
          setProfile((profileData as any).user)
        } catch (err: any) {
          console.error('Error fetching profile:', err)
        }

        // Fetch dashboard stats, recent applications, and recommended opportunities in parallel
        let statsResponse, applicationsResponse, opportunitiesResponse;
        
        try {
          const dashboardData = await apiClient.get('/users/dashboard');
          statsResponse = { data: dashboardData };
        } catch (err: any) {
          statsResponse = { data: { stats: initialDashboardData.stats } };
        }
        
        try {
          const applicationsData = await apiClient.get('/applications/my?limit=3');
          applicationsResponse = { data: applicationsData };
        } catch (err: any) {
          applicationsResponse = { data: [] };
        }
        
        try {
          const opportunitiesData = await apiClient.get('/projects?limit=3&recommended=true');
          opportunitiesResponse = { data: Array.isArray(opportunitiesData) ? opportunitiesData.slice(0, 3) : [] };
        } catch (err: any) {
          opportunitiesResponse = { data: [] };
        }

        setDashboardData({
          stats: (statsResponse as any)?.data?.stats || initialDashboardData.stats,
          recentApplications: Array.isArray((applicationsResponse as any)?.data) ? (applicationsResponse as any).data : [],
          recommendedOpportunities: Array.isArray((opportunitiesResponse as any)?.data) ? (opportunitiesResponse as any).data : []
        })
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        setDashboardData(initialDashboardData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const { stats, recentApplications, recommendedOpportunities } = dashboardData

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your talent activity overview.</p>
      </div>

      {/* Onboarding Checklist */}
      {showOnboarding && profile && (
        <OnboardingChecklist 
          profile={{
            avatar: profile.profile?.avatar,
            title: profile.profile?.title,
            bio: profile.profile?.bio,
            phone: profile.profile?.phone,
            skills: profile.profile?.skills || [],
            portfolio: profile.portfolioItems || []
          }}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/talent/applications">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No applications yet</p>
                <p className="text-sm">Start applying to projects to see your applications here</p>
              </div>
            ) : (
              recentApplications.map((application: any) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{application.project?.title || 'Project'}</h4>
                    <p className="text-sm text-gray-600">{application.project?.businessId ? 'Business Project' : 'Project'}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                      <span>
                        {application.rateType === 'hourly' ? 'Rate:' : 'Budget:'} {
                          application.rateType === 'hourly' 
                            ? formatCurrency(Number(application.proposedRate || 0))
                            : formatCurrency(Number(application.proposedBudget || 0))
                        }
                        {application.rateType === 'hourly' ? '/hr' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                      {application.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recommended Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recommended for You</CardTitle>
            <Link href="/talent/opportunities">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedOpportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No recommendations yet</p>
                <p className="text-sm">Complete your profile to get personalized project recommendations</p>
              </div>
            ) : (
              recommendedOpportunities.map((opportunity: any) => (
                <div key={opportunity.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                      <p className="text-sm text-gray-600">{opportunity.location}</p>
                    </div>
                    <div className="flex items-center text-sm text-yellow-600">
                      <StarIcon className="h-4 w-4 mr-1" />
                      {opportunity.matchScore}% match
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>
                      {opportunity.type === 'HOURLY' 
                        ? opportunity.hourlyRate 
                          ? `${formatCurrency(Number(opportunity.hourlyRate))}/hr`
                          : opportunity.budgetMin && opportunity.budgetMax
                            ? `${formatCurrency(Number(opportunity.budgetMin))}-${formatCurrency(Number(opportunity.budgetMax))}/hr`
                            : `${formatCurrency(Number(opportunity.budgetMin || opportunity.budgetMax || 0))}/hr`
                        : `${formatCurrency(Number(opportunity.budgetMin || 0))} - ${formatCurrency(Number(opportunity.budgetMax || 0))}`
                      }
                    </span>
                    <span>{opportunity.location}</span>
                    <span>{opportunity.postedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills?.slice(0, 3).map((skill: any, index: number) => {
                      const skillName = skill.skill?.name || skill.name || (typeof skill === 'string' ? skill : 'Skill');
                      return (
                        <Badge key={skill.id || index} variant="secondary" className="text-xs">
                          {skillName}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <Link href={`/talent/opportunities/${opportunity.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link href="/talent/opportunities">
              <Button className="w-full h-20 flex-col">
                <MagnifyingGlassIcon className="h-6 w-6 mb-2" />
                Browse Opportunities
              </Button>
            </Link>
            <Link href="/talent/profile">
              <Button variant="outline" className="w-full h-20 flex-col">
                <StarIcon className="h-6 w-6 mb-2" />
                Update Profile
              </Button>
            </Link>
            <Link href="/talent/contracts">
              <Button variant="outline" className="w-full h-20 flex-col">
                <DocumentTextIcon className="h-6 w-6 mb-2" />
                View Contracts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TalentDashboard() {
  return (
    <AuthGuard requiredUserType="talent">
      <TalentDashboardContent />
    </AuthGuard>
  )
}
