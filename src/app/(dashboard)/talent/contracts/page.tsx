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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

interface Contract {
  id: string
  title: string
  description: string
  status: string
  totalAmount: number
  hourlyRate?: number
  startDate?: string
  endDate?: string
  createdAt: string
  businessSignedAt?: string
  talentSignedAt?: string
  project: {
    id: string
    title: string
    description: string
  }
  business: {
    id: string
    profile: {
      companyName: string
      displayName: string
      avatar?: string
      title?: string
    }
  }
  application: {
    id: string
    proposedRate: number
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

export default function TalentContractsPage() {
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
      const response = await apiClient.get('/contracts') as Contract[]
      console.log('📋 Talent contracts response:', response)
      setContracts(response)
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.business.profile.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contract.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading contracts...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchContracts}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending_signatures">Pending Signatures</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Contracts Grid */}
      {filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600 text-center">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You don\'t have any contracts yet. Apply to projects to get started!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-1">
                      {contract.project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span>{contract.business.profile.companyName}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(contract as any).type === 'fixed' ? (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(contract.totalAmount)}</span>
                    </div>
                  ) : (
                    contract.hourlyRate && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formatCurrency(contract.hourlyRate)}/hr</span>
                      </div>
                    )
                  )}
                  {contract.startDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(contract.startDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span>{contract.milestones.length} milestones</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/talent/contracts/${contract.id}`}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}