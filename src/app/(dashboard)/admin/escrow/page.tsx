'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { EscrowDashboard } from '@/components/escrow/escrow-dashboard'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data - in real app, fetch from API
const mockEscrowAccounts = [
  {
    id: 'escrow1',
    contractId: 'contract1',
    businessName: 'Tech Corp Inc.',
    talentName: 'John Doe',
    projectTitle: 'E-commerce Website Development',
    totalAmount: 5000,
    releasedAmount: 2000,
    pendingAmount: 3000,
    status: 'partially_released',
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-01-28'),
    milestones: 5,
    completedMilestones: 2,
    hasDisputes: false
  },
  {
    id: 'escrow2',
    contractId: 'contract2',
    businessName: 'Startup LLC',
    talentName: 'Jane Smith',
    projectTitle: 'Mobile App UI/UX Design',
    totalAmount: 3500,
    releasedAmount: 0,
    pendingAmount: 3500,
    status: 'funded',
    createdAt: new Date('2024-01-20'),
    lastActivity: new Date('2024-01-29'),
    milestones: 3,
    completedMilestones: 0,
    hasDisputes: false
  },
  {
    id: 'escrow3',
    contractId: 'contract3',
    businessName: 'Digital Agency',
    talentName: 'Mike Johnson',
    projectTitle: 'Brand Identity Design',
    totalAmount: 2500,
    releasedAmount: 1000,
    pendingAmount: 1500,
    status: 'disputed',
    createdAt: new Date('2024-01-12'),
    lastActivity: new Date('2024-01-27'),
    milestones: 4,
    completedMilestones: 2,
    hasDisputes: true
  }
]

export default function AdminEscrowPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'funded' | 'partially_released' | 'disputed' | 'completed'>('all')
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null)

  const filteredEscrows = mockEscrowAccounts.filter(escrow => {
    const matchesSearch = 
      escrow.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.talentName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || escrow.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded': return 'bg-blue-100 text-blue-800'
      case 'partially_released': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'funded': return <BanknotesIcon className="w-4 h-4" />
      case 'partially_released': return <ClockIcon className="w-4 h-4" />
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'disputed': return <ExclamationTriangleIcon className="w-4 h-4" />
      default: return <ShieldCheckIcon className="w-4 h-4" />
    }
  }

  const totalEscrowValue = mockEscrowAccounts.reduce((sum, escrow) => sum + escrow.totalAmount, 0)
  const totalReleased = mockEscrowAccounts.reduce((sum, escrow) => sum + escrow.releasedAmount, 0)
  const totalPending = mockEscrowAccounts.reduce((sum, escrow) => sum + escrow.pendingAmount, 0)
  const disputedCount = mockEscrowAccounts.filter(escrow => escrow.hasDisputes).length

  if (selectedEscrow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedEscrow(null)}>
            ← Back to Escrow List
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Escrow Account Details</h1>
            <p className="text-gray-600">ID: {selectedEscrow}</p>
          </div>
        </div>
        
        <EscrowDashboard 
          escrowId={selectedEscrow}
          userRole="admin"
          userId="admin"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Escrow Management</h1>
        <p className="text-gray-600">Monitor and manage all escrow accounts across the platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Escrow Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalEscrowValue)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Across {mockEscrowAccounts.length} accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Released Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReleased)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {Math.round((totalReleased / totalEscrowValue) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Awaiting milestone completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Disputed Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disputedCount}
            </div>
            <p className="text-sm text-gray-600 mt-1">Require admin attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search escrow accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="funded">Funded</TabsTrigger>
            <TabsTrigger value="partially_released">In Progress</TabsTrigger>
            <TabsTrigger value="disputed">Disputed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Escrow Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Escrow Accounts ({filteredEscrows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEscrows.map(escrow => (
              <div key={escrow.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    {getStatusIcon(escrow.status)}
                  </div>
                  <div>
                    <h3 className="font-medium">{escrow.projectTitle}</h3>
                    <p className="text-sm text-gray-600">
                      {escrow.businessName} → {escrow.talentName}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Created {formatDate(escrow.createdAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Last activity {formatDate(escrow.lastActivity)}
                      </span>
                      {escrow.hasDisputes && (
                        <Badge variant="destructive" className="text-xs">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          Disputed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress */}
                  <div className="text-center">
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-xs text-gray-600">
                      {escrow.completedMilestones}/{escrow.milestones} milestones
                    </p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(escrow.completedMilestones / escrow.milestones) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(escrow.totalAmount)}</p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(escrow.releasedAmount)} released
                    </p>
                    <p className="text-sm text-yellow-600">
                      {formatCurrency(escrow.pendingAmount)} pending
                    </p>
                  </div>

                  {/* Status */}
                  <Badge className={`${getStatusColor(escrow.status)} flex items-center gap-1`}>
                    {getStatusIcon(escrow.status)}
                    {escrow.status.replace('_', ' ').toUpperCase()}
                  </Badge>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedEscrow(escrow.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        View Contract
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Transaction History
                      </DropdownMenuItem>
                      {escrow.hasDisputes && (
                        <DropdownMenuItem className="text-red-600">
                          Resolve Dispute
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
