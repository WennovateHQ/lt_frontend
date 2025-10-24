'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'

const adminUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters'),
  sendWelcomeEmail: z.boolean().default(true),
  notes: z.string().optional()
})

type AdminUserFormData = z.infer<typeof adminUserSchema>

interface AdminRole {
  value: string
  label: string
  description: string
}

interface CreateAdminUserModalProps {
  onClose: () => void
  adminRoles: AdminRole[]
}

const availablePermissions = [
  { id: 'user_management', label: 'User Management', description: 'Create, edit, and manage user accounts' },
  { id: 'project_oversight', label: 'Project Oversight', description: 'Monitor and manage projects' },
  { id: 'payment_management', label: 'Payment Management', description: 'Handle escrow and payment disputes' },
  { id: 'dispute_resolution', label: 'Dispute Resolution', description: 'Resolve conflicts between users' },
  { id: 'system_settings', label: 'System Settings', description: 'Configure platform settings' },
  { id: 'analytics_access', label: 'Analytics Access', description: 'View platform analytics and reports' },
  { id: 'content_moderation', label: 'Content Moderation', description: 'Moderate user-generated content' },
  { id: 'support_tickets', label: 'Support Tickets', description: 'Handle customer support requests' }
]

const rolePermissions: Record<string, string[]> = {
  super_admin: ['user_management', 'project_oversight', 'payment_management', 'dispute_resolution', 'system_settings', 'analytics_access', 'content_moderation', 'support_tickets'],
  user_manager: ['user_management', 'analytics_access', 'support_tickets'],
  project_manager: ['project_oversight', 'dispute_resolution', 'analytics_access', 'content_moderation'],
  finance_manager: ['payment_management', 'dispute_resolution', 'analytics_access'],
  support_agent: ['support_tickets', 'content_moderation']
}

export function CreateAdminUserModal({ onClose, adminRoles }: CreateAdminUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      permissions: [],
      sendWelcomeEmail: true
    }
  })

  const watchedPermissions = watch('permissions')

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    const defaultPermissions = rolePermissions[role] || []
    setValue('permissions', defaultPermissions)
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentPermissions = watchedPermissions || []
    if (checked) {
      setValue('permissions', [...currentPermissions, permissionId])
    } else {
      setValue('permissions', currentPermissions.filter(p => p !== permissionId))
    }
  }

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('temporaryPassword', password)
  }

  const onSubmit = async (data: AdminUserFormData) => {
    setIsSubmitting(true)
    try {
      // In real implementation, make API call to create admin user
      console.log('Creating admin user:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onClose()
    } catch (error) {
      console.error('Failed to create admin user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="w-5 h-5" />
            Create Admin User
          </DialogTitle>
          <DialogDescription>
            Create a new admin user with specific role and permissions. The user will receive login credentials via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  {...register('firstName')}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  {...register('lastName')}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                {...register('email')}
                type="email"
                placeholder="admin@localtalents.ca"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role & Permissions</h3>
            
            <div>
              <Label htmlFor="role">Admin Role *</Label>
              <Select onValueChange={(value) => {
                setValue('role', value)
                handleRoleChange(value)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admin role" />
                </SelectTrigger>
                <SelectContent>
                  {adminRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <p className="font-medium">{role.label}</p>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Permissions */}
            <div>
              <Label>Permissions *</Label>
              <div className="mt-2 space-y-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                {availablePermissions.map(permission => (
                  <div key={permission.id} className="flex items-start gap-3">
                    <Checkbox
                      id={permission.id}
                      checked={watchedPermissions?.includes(permission.id) || false}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="cursor-pointer font-medium">
                        {permission.label}
                      </Label>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-sm text-red-600 mt-1">{errors.permissions.message}</p>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security</h3>
            
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="temporaryPassword">Temporary Password *</Label>
                <Button type="button" variant="outline" size="sm" onClick={generateTemporaryPassword}>
                  Generate Password
                </Button>
              </div>
              <Input
                {...register('temporaryPassword')}
                type="password"
                placeholder="Enter temporary password"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                User will be required to change this password on first login
              </p>
              {errors.temporaryPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.temporaryPassword.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="sendWelcomeEmail"
                checked={watch('sendWelcomeEmail')}
                onCheckedChange={(checked) => setValue('sendWelcomeEmail', checked as boolean)}
              />
              <Label htmlFor="sendWelcomeEmail">
                Send welcome email with login credentials
              </Label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              {...register('notes')}
              placeholder="Add any additional notes about this admin user..."
              rows={3}
            />
          </div>

          {/* Warning */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Important:</strong> Admin users have elevated privileges. Only create admin accounts for trusted team members. 
              All admin actions are logged and audited.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                'Creating Admin User...'
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Create Admin User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
