'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

interface Contract {
  id: string
  title: string
  description: string
  status: string
  totalAmount: number
  hourlyRate?: number
  estimatedHours?: number
  startDate?: string
  endDate?: string
  createdAt: string
  businessSignedAt?: string
  talentSignedAt?: string
  project: {
    id: string
    title: string
    description: string
    type: 'HOURLY' | 'FIXED_PRICE'
  }
  talent: {
    id: string
    profile: {
      firstName: string
      lastName: string
      displayName: string
      avatar?: string
      title?: string
    }
  }
  application: {
    id: string
    proposedRate: number
    estimatedHours?: number
  }
  milestones: Array<{
    id: string
    title: string
    description: string
    amount: number
    status: string
    dueDate?: string
    order: number
  }>
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import('@/lib/api/client')
      const response = await apiClient.get('/contracts') as any
      console.log('📋 Fetched contracts:', response)
      if (Array.isArray(response)) {
        response.forEach((contract: any) => {
          console.log(`Contract ${contract.id}:`, {
            projectType: contract.project?.type,
            hourlyRate: contract.hourlyRate,
            contractEstimatedHours: contract.estimatedHours,
            applicationEstimatedHours: contract.application?.estimatedHours,
            totalAmount: contract.totalAmount,
            calculatedTotal: (contract.estimatedHours || contract.application?.estimatedHours) 
              ? (contract.hourlyRate || 0) * (contract.estimatedHours || contract.application?.estimatedHours)
              : null
          })
        })
      }
      
      setContracts(response as Contract[])
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
      setError('Failed to load contracts')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending_signatures': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'disputed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.talent.profile.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contract.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchContracts}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600">Manage your project contracts and agreements</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'pending_signatures' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending_signatures')}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('completed')}
            size="sm"
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600">
              {contracts.length === 0 
                ? "You don't have any contracts yet. Create your first contract from an accepted application."
                : "No contracts match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{contract.description}</p>
                    
                    {/* Project and Talent Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4" />
                        <span>{contract.project.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{contract.talent.profile.displayName}</span>
                      </div>
                      {contract.project.type === 'HOURLY' && contract.hourlyRate && (
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>{formatCurrency(contract.hourlyRate)}/hr</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/business/contracts/${contract.id}`}>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Value</p>
                    <p className="text-lg font-semibold text-green-600">
                      {(() => {
                        const estimatedHrs = contract.estimatedHours || contract.application?.estimatedHours
                        if (contract.project.type === 'HOURLY' && estimatedHrs) {
                          return formatCurrency((contract.hourlyRate || 0) * estimatedHrs)
                        } else if (contract.project.type === 'HOURLY') {
                          return `${formatCurrency(contract.hourlyRate || 0)}/hr`
                        } else {
                          return formatCurrency(contract.totalAmount)
                        }
                      })()}
                    </p>
                    {contract.project.type === 'HOURLY' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(contract.hourlyRate || 0)}/hr
                        {(contract.estimatedHours || contract.application?.estimatedHours) && 
                          ` × ${contract.estimatedHours || contract.application?.estimatedHours} hrs`}
                      </p>
                    )}
                  </div>
                  
                  {contract.startDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Start Date</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(new Date(contract.startDate))}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {formatRelativeTime(new Date(contract.createdAt))}
                    </p>
                  </div>
                </div>
                
                {/* Milestones */}
                {contract.milestones && contract.milestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-900 mb-3">Milestones</p>
                    <div className="space-y-2">
                      {contract.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getMilestoneStatusColor(milestone.status)} variant="secondary">
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm">{milestone.title}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(milestone.amount)}
                          </span>
                        </div>
                      ))}
                      {contract.milestones.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{contract.milestones.length - 3} more milestones
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}