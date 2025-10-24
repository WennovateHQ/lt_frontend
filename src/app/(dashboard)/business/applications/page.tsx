'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApplicationReviewInterface } from '@/components/business/application-review-interface'
import { useBusinessApplications } from '@/lib/hooks/use-applications'
import { useAuth } from '@/lib/contexts/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function BusinessApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('all')
  
  // Fetch all applications for business user's projects
  const { data: applications = [], isLoading, error } = useBusinessApplications()
  
  // Group applications by status
  const applicationsByStatus = {
    all: applications,
    submitted: applications.filter(app => app.status === 'submitted'),
    under_review: applications.filter(app => app.status === 'under_review'),
    shortlisted: applications.filter(app => app.status === 'shortlisted'),
    accepted: applications.filter(app => app.status === 'accepted'),
    rejected: applications.filter(app => app.status === 'rejected')
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600">Review and manage talent applications for your projects</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600">Review and manage talent applications for your projects</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading applications: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
        <p className="text-gray-600">Review and manage talent applications for your projects</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Applications ({applicationsByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({applicationsByStatus.submitted.length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({applicationsByStatus.under_review.length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({applicationsByStatus.shortlisted.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({applicationsByStatus.accepted.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({applicationsByStatus.rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {applicationsByStatus.all.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">No applications found for your projects.</p>
              </CardContent>
            </Card>
          ) : (
            applicationsByStatus.all.map(application => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{application.project?.title || `Project #${application.projectId?.slice(0, 6) || 'N/A'}`}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Applied by: {application.talent?.profile?.firstName} {application.talent?.profile?.lastName}
                      </p>
                    </div>
                    <Badge variant={application.status === 'submitted' ? 'secondary' : 
                                  application.status === 'under_review' ? 'outline' :
                                  application.status === 'shortlisted' ? 'default' :
                                  application.status === 'accepted' ? 'default' : 
                                  application.status === 'rejected' ? 'destructive' : 'outline'}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Cover Letter</h4>
                      <p className="text-sm text-gray-600 mt-1">{application.coverLetter}</p>
                    </div>
                    {(application.proposedRate || application.proposedBudget) && (
                      <div>
                        <h4 className="font-medium">
                          {application.project?.type === 'HOURLY' ? 'Proposed Rate & Budget' : 'Proposed Budget'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {application.project?.type === 'HOURLY' 
                            ? (
                              <>
                                <span>${application.proposedRate}/hr</span>
                                {application.estimatedHours && (
                                  <span className="ml-2">
                                    • {application.estimatedHours} hrs 
                                    • ${(application.proposedRate || 0) * application.estimatedHours} total
                                  </span>
                                )}
                              </>
                            )
                            : `$${application.proposedBudget} total budget`
                          }
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/business/projects/${application.projectId}/applications/${application.id}`)}
                      >
                        View Details
                      </Button>
                      {['submitted', 'under_review'].includes(application.status) && (
                        <>
                          <Button size="sm" variant="default">
                            Shortlist
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === 'shortlisted' && (
                        <>
                          <Button size="sm" variant="default">
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive">
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {(['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'] as const).map(status => (
          <TabsContent key={status} value={status} className="space-y-6">
            {applicationsByStatus[status].length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600">No {status} applications found.</p>
                </CardContent>
              </Card>
            ) : (
              applicationsByStatus[status].map(application => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                      <CardTitle>{application.project?.title || `Project #${application.projectId?.slice(0, 6) || 'N/A'}`}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Applied by: {application.talent?.profile?.firstName} {application.talent?.profile?.lastName}
                      </p>
                    </div>
                      <Badge variant={
                        application.status === 'submitted' ? 'secondary' :
                        application.status === 'under_review' ? 'outline' :
                        application.status === 'shortlisted' ? 'default' :
                        application.status === 'accepted' ? 'default' : 
                        application.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Cover Letter</h4>
                        <p className="text-sm text-gray-600 mt-1">{application.coverLetter}</p>
                      </div>
                      {(application.proposedRate || application.proposedBudget) && (
                        <div>
                          <h4 className="font-medium">
                            {application.rateType === 'hourly' ? 'Proposed Rate & Budget' : 'Proposed Budget'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {application.rateType === 'hourly' && application.proposedRate
                              ? (
                                <>
                                  <span>${application.proposedRate}/hr</span>
                                  {application.estimatedHours && (
                                    <span className="ml-2">
                                      • {application.estimatedHours} hrs 
                                      • ${(application.proposedRate || 0) * application.estimatedHours} total
                                    </span>
                                  )}
                                </>
                              )
                              : application.proposedBudget
                                ? `$${application.proposedBudget} total budget`
                                : 'No budget specified'
                            }
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/business/projects/${application.projectId}/applications/${application.id}`)}
                        >
                          View Details
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default">
                              Accept
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
