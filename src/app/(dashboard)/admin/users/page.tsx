'use client'

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  UserIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'
import { CreateAdminUserModal } from '@/components/admin/create-admin-user-modal'

// Mock data - in real app, fetch from API
const mockUsers = [
  {
    id: 'user1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    userType: 'talent' as const,
    status: 'active' as const,
    emailVerified: true,
    phoneVerified: false,
    registeredAt: new Date('2024-01-15'),
    lastActive: new Date('2024-01-28'),
    projectsCount: 5,
    totalEarnings: 12500
  },
  {
    id: 'user2',
    email: 'jane.smith@techcorp.com',
    firstName: 'Jane',
    lastName: 'Smith',
    userType: 'business' as const,
    status: 'active' as const,
    emailVerified: true,
    phoneVerified: true,
    companyName: 'Tech Corp Inc.',
    registeredAt: new Date('2024-01-10'),
    lastActive: new Date('2024-01-29'),
    projectsCount: 3,
    totalSpent: 25000
  },
  {
    id: 'admin1',
    email: 'admin@localtalents.ca',
    firstName: 'Admin',
    lastName: 'User',
    userType: 'admin' as const,
    status: 'active' as const,
    emailVerified: true,
    phoneVerified: true,
    role: 'super_admin' as const,
    registeredAt: new Date('2023-12-01'),
    lastActive: new Date('2024-01-29')
  }
]

const adminRoles = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
  { value: 'user_manager', label: 'User Manager', description: 'Manage users and verification' },
  { value: 'project_manager', label: 'Project Manager', description: 'Monitor projects and disputes' },
  { value: 'finance_manager', label: 'Finance Manager', description: 'Handle payments and escrow' },
  { value: 'support_agent', label: 'Support Agent', description: 'Customer support access' }
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserType, setSelectedUserType] = useState<'all' | 'business' | 'talent' | 'admin'>('all')
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.userType === 'business' && user.companyName?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = selectedUserType === 'all' || user.userType === selectedUserType
    
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'business': return <BuildingOfficeIcon className="w-4 h-4" />
      case 'admin': return <ShieldCheckIcon className="w-4 h-4" />
      default: return <UserIcon className="w-4 h-4" />
    }
  }

  const handleUserAction = (userId: string, action: string) => {
    console.log(`Performing ${action} on user ${userId}`)
    // In real app, make API call
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts, verification, and access control</p>
        </div>
        <Button onClick={() => setShowCreateAdmin(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Admin User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedUserType} onValueChange={(value) => setSelectedUserType(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="business">Businesses</TabsTrigger>
            <TabsTrigger value="talent">Talents</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getUserTypeIcon(user.userType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                      {user.userType === 'admin' && user.role && (
                        <Badge variant="secondary" className="text-xs">
                          {adminRoles.find(r => r.value === user.role)?.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.userType === 'business' && user.companyName && (
                      <p className="text-sm text-gray-500">{user.companyName}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Joined {formatDate(user.registeredAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Last active {formatDate(user.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Verification Status */}
                  <div className="flex items-center gap-2">
                    {user.emailVerified ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" title="Email verified" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-500" title="Email not verified" />
                    )}
                    {user.phoneVerified ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" title="Phone verified" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-gray-400" title="Phone not verified" />
                    )}
                  </div>

                  {/* User Stats */}
                  <div className="text-right text-sm">
                    {user.userType === 'talent' && (
                      <>
                        <p className="font-medium">{user.projectsCount} projects</p>
                        <p className="text-gray-600">${user.totalEarnings?.toLocaleString()} earned</p>
                      </>
                    )}
                    {user.userType === 'business' && (
                      <>
                        <p className="font-medium">{user.projectsCount} projects</p>
                        <p className="text-gray-600">${user.totalSpent?.toLocaleString()} spent</p>
                      </>
                    )}
                  </div>

                  {/* Status Badge */}
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUserAction(user.id, 'view')}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction(user.id, 'verify')}>
                        Verify Account
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'active' ? (
                        <DropdownMenuItem 
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="text-red-600"
                        >
                          Suspend Account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600"
                        >
                          Activate Account
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

      {/* Create Admin User Modal */}
      {showCreateAdmin && (
        <CreateAdminUserModal
          onClose={() => setShowCreateAdmin(false)}
          adminRoles={adminRoles}
        />
      )}
    </div>
  )
}
